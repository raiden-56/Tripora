import { create } from "zustand";
import type {
  Destination,
  DestinationStatus,
  JourneyVisibility,
  Memory,
  MapFilters,
  Trip,
  ViewMode,
} from "../types";
import {
  achievements as seedAchievements,
  currentUser,
  destinations as seedDestinations,
  memories as seedMemories,
  trips as seedTrips,
} from "../data/mockData";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface AppState {
  destinations: Destination[];
  trips: Trip[];
  memories: Memory[];
  achievements: typeof seedAchievements;
  user: typeof currentUser;

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

  addDestination: (dest: Destination) => void;
  updateDestination: (id: string, patch: Partial<Destination>) => void;
  deleteDestination: (id: string) => void;
  toggleFavorite: (id: string) => void;
  moveToPlanned: (id: string) => void;

  addMemory: (memory: Memory) => void;
  deleteMemory: (id: string) => void;

  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, patch: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;

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

export const useAppStore = create<AppState>((set, get) => ({
  destinations: seedDestinations,
  trips: seedTrips,
  memories: seedMemories,
  achievements: seedAchievements,
  user: currentUser,

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
  setUserVisibility: (visibility) =>
    set((state) => ({ user: { ...state.user, visibility } })),
  updateUserBio: (bio) => set((state) => ({ user: { ...state.user, bio } })),
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

  addDestination: (dest) =>
    set((state) => ({ destinations: [dest, ...state.destinations] })),
  updateDestination: (id, patch) =>
    set((state) => ({
      destinations: state.destinations.map((d) =>
        d.id === id ? { ...d, ...patch } : d,
      ),
    })),
  deleteDestination: (id) =>
    set((state) => ({
      destinations: state.destinations.filter((d) => d.id !== id),
    })),
  toggleFavorite: (id) =>
    set((state) => ({
      destinations: state.destinations.map((d) =>
        d.id === id ? { ...d, isFavorite: !d.isFavorite } : d,
      ),
    })),
  moveToPlanned: (id) => {
    get().updateDestination(id, { status: "planned" as DestinationStatus });
    get().pushToast("Moved to planned destinations", "success");
  },

  addMemory: (memory) =>
    set((state) => ({ memories: [memory, ...state.memories] })),
  deleteMemory: (id) =>
    set((state) => ({ memories: state.memories.filter((m) => m.id !== id) })),

  addTrip: (trip) => set((state) => ({ trips: [trip, ...state.trips] })),
  updateTrip: (id, patch) =>
    set((state) => ({
      trips: state.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
  deleteTrip: (id) =>
    set((state) => ({ trips: state.trips.filter((t) => t.id !== id) })),

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
