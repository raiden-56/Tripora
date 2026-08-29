import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import type { Guide, Place, Booking, TimeSlot } from "../types";
import { mockGuides, mockPlaces, mockBookings } from "../services/mockData";

interface AppContextType {
  // Places
  places: Place[];
  addPlace: (place: Place) => void;
  updatePlace: (id: string, place: Partial<Place>) => void;
  deletePlace: (id: string) => void;

  // Guides
  guides: Guide[];
  addGuide: (guide: Guide) => void;
  updateGuide: (id: string, guide: Partial<Guide>) => void;
  deleteGuide: (id: string) => void;

  // Bookings
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  cancelBooking: (id: string) => void;

  // Favorites
  favoriteGuideIds: string[];
  toggleFavorite: (guideId: string) => void;

  // Helpers
  getGuideById: (id: string) => Guide | undefined;
  getPlaceById: (id: string) => Place | undefined;
  getGuidesForPlace: (placeId: string) => Guide[];
  getAvailableSlots: (guideId: string) => TimeSlot[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [places, setPlaces] = useState<Place[]>(mockPlaces);
  const [guides, setGuides] = useState<Guide[]>(mockGuides);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [favoriteGuideIds, setFavoriteGuideIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("hire-guide-favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // Places
  const addPlace = useCallback((place: Place) => {
    setPlaces((prev) => [...prev, place]);
  }, []);

  const updatePlace = useCallback((id: string, data: Partial<Place>) => {
    setPlaces((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }, []);

  const deletePlace = useCallback((id: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Guides
  const addGuide = useCallback((guide: Guide) => {
    setGuides((prev) => [...prev, guide]);
  }, []);

  const updateGuide = useCallback((id: string, data: Partial<Guide>) => {
    setGuides((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
  }, []);

  const deleteGuide = useCallback((id: string) => {
    setGuides((prev) => prev.filter((g) => g.id !== id));
  }, []);

  // Bookings
  const addBooking = useCallback((booking: Booking) => {
    setBookings((prev) => [...prev, booking]);
    // Mark slot as booked
    setGuides((prev) =>
      prev.map((g) =>
        g.id === booking.guideId
          ? {
              ...g,
              availableSlots: g.availableSlots.map((s) =>
                s.id === booking.slot.id ? { ...s, isBooked: true } : s,
              ),
            }
          : g,
      ),
    );
  }, []);

  const cancelBooking = useCallback((id: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: "cancelled" as const } : b,
      ),
    );
  }, []);

  // Favorites
  const toggleFavorite = useCallback((guideId: string) => {
    setFavoriteGuideIds((prev) => {
      const next = prev.includes(guideId)
        ? prev.filter((id) => id !== guideId)
        : [...prev, guideId];
      localStorage.setItem("hire-guide-favorites", JSON.stringify(next));
      return next;
    });
  }, []);

  // Helpers
  const getGuideById = useCallback(
    (id: string) => guides.find((g) => g.id === id),
    [guides],
  );
  const getPlaceById = useCallback(
    (id: string) => places.find((p) => p.id === id),
    [places],
  );
  const getGuidesForPlace = useCallback(
    (placeId: string) => {
      const place = places.find((p) => p.id === placeId);
      if (!place) return [];
      return guides.filter((g) => place.guides.includes(g.id));
    },
    [places, guides],
  );
  const getAvailableSlots = useCallback(
    (guideId: string) => {
      const guide = guides.find((g) => g.id === guideId);
      return guide ? guide.availableSlots.filter((s) => !s.isBooked) : [];
    },
    [guides],
  );

  const value = useMemo(
    () => ({
      places,
      addPlace,
      updatePlace,
      deletePlace,
      guides,
      addGuide,
      updateGuide,
      deleteGuide,
      bookings,
      addBooking,
      cancelBooking,
      favoriteGuideIds,
      toggleFavorite,
      getGuideById,
      getPlaceById,
      getGuidesForPlace,
      getAvailableSlots,
    }),
    [
      places,
      guides,
      bookings,
      favoriteGuideIds,
      addPlace,
      updatePlace,
      deletePlace,
      addGuide,
      updateGuide,
      deleteGuide,
      addBooking,
      cancelBooking,
      toggleFavorite,
      getGuideById,
      getPlaceById,
      getGuidesForPlace,
      getAvailableSlots,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used within AppProvider");
  return context;
};
