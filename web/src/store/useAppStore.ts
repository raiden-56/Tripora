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
  id: null,
  name: "",
  email: "",
  bio: "",
  avatarUrl: "",
  homeLocation: "",
  visibility: "private",
  handle: "",
  interests: [],
  travelStyle: "",
  notificationsEnabled: true,
};

export type ProfilePatch = usersApi.ProfileUpdate & { name?: string };

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

  selectedDestinationId: string | null;
  addDestinationOpen: boolean;
  editingDestinationId: string | null;
  /** Destination to preselect when the Add Memory modal opens from elsewhere. */
  addMemoryForDestinationId: string | null;
  toasts: Toast[];

  toggleTheme: () => void;
  setViewMode: (mode: ViewMode) => void;
  setMapFilters: (filters: Partial<MapFilters>) => void;
  /** Saves profile/account fields; returns false (after a toast) on failure. */
  updateProfile: (patch: ProfilePatch) => Promise<boolean>;
  setUserVisibility: (visibility: JourneyVisibility) => Promise<boolean>;
  toggleNotifications: () => Promise<boolean>;

  selectDestination: (id: string | null) => void;
  openAddDestination: (editId?: string | null) => void;
  closeAddDestination: () => void;
  openAddMemory: (destinationId: string | null) => void;

  fetchAllData: () => Promise<void>;
  refreshPhotos: () => Promise<void>;
  resetData: () => void;
  recomputeAchievements: () => void;

  addDestination: (dest: Partial<Destination>) => Promise<Destination | null>;
  updateDestination: (id: string, patch: Partial<Destination>) => Promise<boolean>;
  deleteDestination: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<boolean>;
  moveToPlanned: (id: string) => Promise<boolean>;

  addMemory: (
    memory: Partial<Memory>,
    photoFile?: File,
  ) => Promise<Memory | null>;
  updateMemory: (id: string, patch: Partial<Memory>) => Promise<boolean>;
  deleteMemory: (id: string) => Promise<boolean>;

  addTrip: (trip: Partial<Trip>) => Promise<Trip | null>;
  updateTrip: (id: string, patch: Partial<Trip>) => Promise<boolean>;
  deleteTrip: (id: string) => Promise<boolean>;

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

function photoMap(photos: photosApi.Photo[]) {
  return new Map(
    photos.filter((p) => p.memoryId).map((p) => [p.memoryId as string, p.url]),
  );
}

let fetchInFlight: Promise<void> | null = null;

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

  selectedDestinationId: null,
  addDestinationOpen: false,
  editingDestinationId: null,
  addMemoryForDestinationId: null,
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

  updateProfile: async ({ name, ...profilePatch }) => {
    try {
      if (name !== undefined) {
        const me = await usersApi.updateMe({ name });
        set((state) => ({ user: { ...state.user, name: me.name } }));
      }
      if (Object.keys(profilePatch).length > 0) {
        const profile = await usersApi.updateMyProfile(profilePatch);
        set((state) => ({
          user: {
            ...state.user,
            bio: profile.bio ?? "",
            avatarUrl: profile.avatar_url ?? "",
            homeLocation: profile.home_location ?? "",
            visibility: profile.visibility,
            handle: profile.handle ?? "",
            interests: usersApi.splitInterests(profile),
            travelStyle: profile.preferred_travel_style ?? "",
            notificationsEnabled: profile.notifications_enabled,
          },
        }));
      }
      return true;
    } catch (err) {
      get().pushToast(errorMessage(err, "Could not save your profile."), "error");
      return false;
    }
  },
  setUserVisibility: (visibility) => get().updateProfile({ visibility }),
  toggleNotifications: () =>
    get().updateProfile({
      notificationsEnabled: !get().user.notificationsEnabled,
    }),

  selectDestination: (id) => set({ selectedDestinationId: id }),
  openAddDestination: (editId = null) =>
    set({ addDestinationOpen: true, editingDestinationId: editId }),
  closeAddDestination: () =>
    set({ addDestinationOpen: false, editingDestinationId: null }),
  openAddMemory: (destinationId) =>
    set({ addMemoryForDestinationId: destinationId }),

  recomputeAchievements: () =>
    set((state) => ({
      achievements: computeAchievements(
        state.destinations,
        state.trips,
        state.memories,
      ),
    })),

  fetchAllData: () => {
    // Several components may ask at once (layout mount, invite accepted, ...):
    // share one request instead of racing.
    if (fetchInFlight) return fetchInFlight;
    fetchInFlight = (async () => {
      set({ loadingData: true });
      try {
        const [destinations, trips, memories, profile, me, photos] =
          await Promise.all([
            destinationsApi.listDestinations(),
            tripsApi.listTrips(),
            memoriesApi.listMemories(),
            usersApi.getMyProfile().catch(() => null),
            usersApi.getMe().catch(() => null),
            photosApi.listPhotos().catch(() => []),
          ]);

        const photoByMemory = photoMap(photos);
        const hydratedMemories = memories.map((m) => ({
          ...m,
          imageUrl: photoByMemory.get(m.id) ?? m.imageUrl,
        }));

        set((state) => ({
          destinations,
          trips,
          memories: hydratedMemories,
          user: {
            ...state.user,
            id: me?.id ?? state.user.id,
            name: me?.name ?? state.user.name,
            email: me?.email ?? state.user.email,
            ...(profile
              ? {
                  bio: profile.bio ?? "",
                  avatarUrl: profile.avatar_url ?? "",
                  homeLocation: profile.home_location ?? "",
                  visibility: profile.visibility ?? "private",
                  handle: profile.handle ?? "",
                  interests: usersApi.splitInterests(profile),
                  travelStyle: profile.preferred_travel_style ?? "",
                  notificationsEnabled: profile.notifications_enabled,
                }
              : {}),
          },
          dataLoaded: true,
          loadingData: false,
        }));
        get().recomputeAchievements();
      } catch {
        set({ loadingData: false });
        get().pushToast("Could not load your data. Please refresh.", "error");
      } finally {
        fetchInFlight = null;
      }
    })();
    return fetchInFlight;
  },

  refreshPhotos: async () => {
    try {
      const photoByMemory = photoMap(await photosApi.listPhotos());
      set((state) => ({
        memories: state.memories.map((m) => ({
          ...m,
          imageUrl: photoByMemory.get(m.id) ?? "",
        })),
      }));
    } catch {
      // Non-critical: images just stay as they were until the next full load.
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
      addMemoryForDestinationId: null,
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
      const saved = await destinationsApi.updateDestination(id, patch);
      set((state) => ({
        destinations: state.destinations.map((d) => (d.id === id ? saved : d)),
      }));
      get().recomputeAchievements();
      return true;
    } catch (err) {
      set({ destinations: previous });
      get().pushToast(
        errorMessage(err, "Could not update destination."),
        "error",
      );
      return false;
    }
  },
  deleteDestination: async (id) => {
    const previous = get().destinations;
    set((state) => ({
      destinations: state.destinations.filter((d) => d.id !== id),
      // Memories cascade with their destination on the server.
      memories: state.memories.filter((m) => m.destinationId !== id),
    }));
    try {
      await destinationsApi.deleteDestination(id);
      get().recomputeAchievements();
      return true;
    } catch (err) {
      set({ destinations: previous });
      get().pushToast(
        errorMessage(err, "Could not delete destination."),
        "error",
      );
      return false;
    }
  },
  toggleFavorite: async (id) => {
    const dest = get().destinations.find((d) => d.id === id);
    if (!dest) return false;
    return get().updateDestination(id, { isFavorite: !dest.isFavorite });
  },
  moveToPlanned: async (id) => {
    const ok = await get().updateDestination(id, {
      status: "planned" as DestinationStatus,
    });
    if (ok) get().pushToast("Moved to planned destinations", "success");
    return ok;
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
        } catch (err) {
          get().pushToast(
            `Memory saved, but the photo failed to upload: ${errorMessage(err, "unknown error")}`,
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
  updateMemory: async (id, patch) => {
    const previous = get().memories;
    set((state) => ({
      memories: state.memories.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
    try {
      await memoriesApi.updateMemory(id, patch);
      return true;
    } catch (err) {
      set({ memories: previous });
      get().pushToast(errorMessage(err, "Could not update memory."), "error");
      return false;
    }
  },
  deleteMemory: async (id) => {
    const previous = get().memories;
    set((state) => ({ memories: state.memories.filter((m) => m.id !== id) }));
    try {
      await memoriesApi.deleteMemory(id);
      get().recomputeAchievements();
      return true;
    } catch (err) {
      set({ memories: previous });
      get().pushToast(errorMessage(err, "Could not delete memory."), "error");
      return false;
    }
  },

  addTrip: async (payload) => {
    try {
      const created = await tripsApi.createTrip(payload);
      set((state) => ({ trips: [created, ...state.trips] }));
      get().recomputeAchievements();
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
      const saved = await tripsApi.updateTrip(id, patch);
      set((state) => ({
        trips: state.trips.map((t) => (t.id === id ? saved : t)),
      }));
      get().recomputeAchievements();
      return true;
    } catch (err) {
      set({ trips: previous });
      get().pushToast(errorMessage(err, "Could not update trip."), "error");
      return false;
    }
  },
  deleteTrip: async (id) => {
    const previous = get().trips;
    set((state) => ({ trips: state.trips.filter((t) => t.id !== id) }));
    try {
      await tripsApi.deleteTrip(id);
      get().recomputeAchievements();
      return true;
    } catch (err) {
      set({ trips: previous });
      get().pushToast(errorMessage(err, "Could not delete trip."), "error");
      return false;
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
