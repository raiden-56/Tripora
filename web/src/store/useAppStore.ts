import { create } from "zustand";
import type {
  Achievement,
  Destination,
  DestinationStatus,
  JourneyVisibility,
  Memory,
  MapFilters,
  Trip,
  User,
  ViewMode,
} from "../types";
import * as destinationsApi from "../api/destinations.api";
import * as tripsApi from "../api/trips.api";
import * as memoriesApi from "../api/memories.api";
import * as usersApi from "../api/users.api";
import * as photosApi from "../api/photos.api";
import { computeAchievements } from "../utils/achievements";
export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

const emptyUser: User = {
  name: "",
  bio: "",
  avatarUrl: "",
  visibility: "private",
  handle: "",
  interests: [],
};

interface AppState {
  destinations: Destination[];
  trips: Trip[];
  memories: Memory[];
  achievements: Achievement[];
  user: User;
  dataLoaded: boolean;
  loadingData: boolean;

  theme: "light" | "dark";
  viewMode: ViewMode;
  mapFilters: MapFilters;
  searchQuery: string;
  notificationsEnabled: boolean;

  selectedDestinationId: string | null;
  addDestinationOpen: boolean;
  editingDestinationId: string | null;
  toasts: Toast[];

  toggleTheme: () => void;
  setViewMode: (mode: ViewMode) => void;
  setMapFilters: (filters: Partial<MapFilters>) => void;
  setSearchQuery: (q: string) => void;
  setUserVisibility: (visibility: JourneyVisibility) => void;
  updateUserBio: (bio: string) => void;
  toggleNotifications: () => void;
  toggleChecklistItem: (tripId: string, itemId: string) => void;

  selectDestination: (id: string | null) => void;
  openAddDestination: (editId?: string | null) => void;
  closeAddDestination: () => void;

  fetchAllData: () => Promise<void>;
  resetData: () => void;
  recomputeAchievements: () => void;

  addDestination: (dest: Partial<Destination>) => Promise<Destination | null>;
  updateDestination: (id: string, patch: Partial<Destination>) => Promise<void>;
  deleteDestination: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  moveToPlanned: (id: string) => Promise<void>;

  addMemory: (
    memory: Partial<Memory>,
    photoFile?: File,
  ) => Promise<Memory | null>;
  deleteMemory: (id: string) => Promise<void>;

  addTrip: (trip: Partial<Trip>) => Promise<Trip | null>;
  updateTrip: (id: string, patch: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;

  pushToast: (message: string, type?: Toast["type"]) => void;
  dismissToast: (id: string) => void;
}

const getInitialTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("tc-theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export const useAppStore = create<AppState>((set, get) => ({
  destinations: [],
  trips: [],
  memories: [],
  achievements: [],
  user: emptyUser,
  dataLoaded: false,
  loadingData: false,

  theme: getInitialTheme(),
  viewMode: "world",
  mapFilters: { status: "all" },
  searchQuery: "",
  notificationsEnabled: true,

  selectedDestinationId: null,
  addDestinationOpen: false,
  editingDestinationId: null,
  toasts: [],

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        window.localStorage.setItem("tc-theme", next);
        document.documentElement.classList.toggle("dark", next === "dark");
      }
      return { theme: next };
    }),

  setViewMode: (mode) => set({ viewMode: mode }),
  setMapFilters: (filters) =>
    set((state) => ({ mapFilters: { ...state.mapFilters, ...filters } })),
  setSearchQuery: (q) => set({ searchQuery: q }),

  setUserVisibility: (visibility) => {
    set((state) => ({ user: { ...state.user, visibility } }));
    usersApi.updateMyProfile({ visibility }).catch(() => {
      get().pushToast("Could not save visibility setting.", "error");
    });
  },
  updateUserBio: (bio) => {
    set((state) => ({ user: { ...state.user, bio } }));
    usersApi.updateMyProfile({ bio }).catch(() => {
      get().pushToast("Could not save bio.", "error");
    });
  },
  toggleNotifications: () =>
    set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
  toggleChecklistItem: (tripId, itemId) =>
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              checklist: t.checklist?.map((c) =>
                c.id === itemId ? { ...c, done: !c.done } : c,
              ),
            }
          : t,
      ),
    })),

  selectDestination: (id) => set({ selectedDestinationId: id }),
  openAddDestination: (editId = null) =>
    set({ addDestinationOpen: true, editingDestinationId: editId }),
  closeAddDestination: () =>
    set({ addDestinationOpen: false, editingDestinationId: null }),

  recomputeAchievements: () =>
    set((state) => ({
      achievements: computeAchievements(
        state.destinations,
        state.trips,
        state.memories,
      ),
    })),

  fetchAllData: async () => {
    set({ loadingData: true });
    try {
      const [destinations, trips, memories, profile, photos] =
        await Promise.all([
          destinationsApi.listDestinations(),
          tripsApi.listTrips(),
          memoriesApi.listMemories(),
          usersApi.getMyProfile().catch(() => null),
          photosApi.listPhotos().catch(() => []),
        ]);

      const photoByMemory = new Map(
        photos
          .filter((p) => p.memoryId)
          .map((p) => [p.memoryId as string, p.url]),
      );
      const hydratedMemories = memories.map((m) => ({
        ...m,
        imageUrl: photoByMemory.get(m.id) ?? m.imageUrl,
      }));

      set((state) => ({
        destinations,
        trips,
        memories: hydratedMemories,
        user: profile
          ? {
              ...state.user,
              bio: profile.bio ?? "",
              avatarUrl: profile.avatar_url ?? "",
              visibility:
                (profile.visibility as JourneyVisibility) ?? "private",
              handle: profile.handle ?? "",
            }
          : state.user,
        dataLoaded: true,
        loadingData: false,
      }));
      get().recomputeAchievements();
    } catch {
      set({ loadingData: false });
      get().pushToast("Could not load your data. Please refresh.", "error");
    }
  },

  resetData: () =>
    set({
      destinations: [],
      trips: [],
      memories: [],
      achievements: [],
      user: emptyUser,
      dataLoaded: false,
      selectedDestinationId: null,
      addDestinationOpen: false,
      editingDestinationId: null,
    }),

  addDestination: async (payload) => {
    try {
      const created = await destinationsApi.createDestination(payload);
      set((state) => ({ destinations: [created, ...state.destinations] }));
      get().recomputeAchievements();
      return created;
    } catch (err) {
      get().pushToast(errorMessage(err, "Could not add destination."), "error");
      return null;
    }
  },
  updateDestination: async (id, patch) => {
    const previous = get().destinations;
    set((state) => ({
      destinations: state.destinations.map((d) =>
        d.id === id ? { ...d, ...patch } : d,
      ),
    }));
    try {
      await destinationsApi.updateDestination(id, patch);
      get().recomputeAchievements();
    } catch (err) {
      set({ destinations: previous });
      get().pushToast(
        errorMessage(err, "Could not update destination."),
        "error",
      );
    }
  },
  deleteDestination: async (id) => {
    const previous = get().destinations;
    set((state) => ({
      destinations: state.destinations.filter((d) => d.id !== id),
    }));
    try {
      await destinationsApi.deleteDestination(id);
      get().recomputeAchievements();
    } catch (err) {
      set({ destinations: previous });
      get().pushToast(
        errorMessage(err, "Could not delete destination."),
        "error",
      );
    }
  },
  toggleFavorite: async (id) => {
    const dest = get().destinations.find((d) => d.id === id);
    if (!dest) return;
    await get().updateDestination(id, { isFavorite: !dest.isFavorite });
  },
  moveToPlanned: async (id) => {
    await get().updateDestination(id, {
      status: "planned" as DestinationStatus,
    });
    get().pushToast("Moved to planned destinations", "success");
  },

  addMemory: async (payload, photoFile) => {
    try {
      const created = await memoriesApi.createMemory(payload);
      let imageUrl = created.imageUrl;
      if (photoFile) {
        try {
          const photo = await photosApi.uploadPhoto(photoFile, {
            memoryId: created.id,
          });
          imageUrl = photo.url;
        } catch {
          get().pushToast(
            "Memory saved, but the photo failed to upload.",
            "info",
          );
        }
      }
      const finalMemory = { ...created, imageUrl };
      set((state) => ({ memories: [finalMemory, ...state.memories] }));
      get().recomputeAchievements();
      return finalMemory;
    } catch (err) {
      get().pushToast(errorMessage(err, "Could not save memory."), "error");
      return null;
    }
  },
  deleteMemory: async (id) => {
    const previous = get().memories;
    set((state) => ({ memories: state.memories.filter((m) => m.id !== id) }));
    try {
      await memoriesApi.deleteMemory(id);
      get().recomputeAchievements();
    } catch (err) {
      set({ memories: previous });
      get().pushToast(errorMessage(err, "Could not delete memory."), "error");
    }
  },

  addTrip: async (payload) => {
    try {
      const created = await tripsApi.createTrip(payload);
      set((state) => ({ trips: [created, ...state.trips] }));
      return created;
    } catch (err) {
      get().pushToast(errorMessage(err, "Could not create trip."), "error");
      return null;
    }
  },
  updateTrip: async (id, patch) => {
    const previous = get().trips;
    set((state) => ({
      trips: state.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
    try {
      await tripsApi.updateTrip(id, patch);
      get().recomputeAchievements();
    } catch (err) {
      set({ trips: previous });
      get().pushToast(errorMessage(err, "Could not update trip."), "error");
    }
  },
  deleteTrip: async (id) => {
    const previous = get().trips;
    set((state) => ({ trips: state.trips.filter((t) => t.id !== id) }));
    try {
      await tripsApi.deleteTrip(id);
    } catch (err) {
      set({ trips: previous });
      get().pushToast(errorMessage(err, "Could not delete trip."), "error");
    }
  },

  pushToast: (message, type = "success") =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: `toast-${Date.now()}-${Math.random()}`, message, type },
      ],
    })),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
