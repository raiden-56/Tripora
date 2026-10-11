import { apiRequest, mediaUrl } from "./client";
import type { Destination, DestinationStatus } from "../types";

interface BackendPublicJourney {
  handle: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  home_location: string | null;
  destinations: {
    id: number;
    name: string;
    country: string;
    state: string | null;
    city: string | null;
    latitude: number;
    longitude: number;
    status: DestinationStatus;
    is_favorite: boolean;
    rating: number | null;
    hero_image_url: string | null;
    visited_from: string | null;
    visited_to: string | null;
  }[];
  memories: {
    id: number;
    destination_id: number;
    title: string;
    description: string | null;
    memory_date: string;
    image_url: string | null;
  }[];
  trips_completed: number;
  travel_days: number;
}

export interface PublicMemory {
  id: string;
  destinationId: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string | null;
}

export interface PublicJourney {
  handle: string;
  name: string;
  bio: string;
  avatarUrl: string | null;
  homeLocation: string | null;
  destinations: Destination[];
  memories: PublicMemory[];
  tripsCompleted: number;
  travelDays: number;
}

/** A journey whose owner made it public. Rejects with a 404 ApiError otherwise. */
export async function getPublicJourney(handle: string): Promise<PublicJourney> {
  const j = await apiRequest<BackendPublicJourney>(
    `/api/v1/public/journeys/${encodeURIComponent(handle)}`,
    { auth: false },
  );
  return {
    handle: j.handle,
    name: j.name,
    bio: j.bio ?? "",
    avatarUrl: mediaUrl(j.avatar_url),
    homeLocation: j.home_location,
    destinations: j.destinations.map((d) => ({
      id: String(d.id),
      name: d.name,
      country: d.country,
      state: d.state ?? undefined,
      city: d.city ?? undefined,
      latitude: d.latitude,
      longitude: d.longitude,
      status: d.status,
      isFavorite: d.is_favorite,
      rating: d.rating ?? undefined,
      heroImageUrl: d.hero_image_url ?? "",
      visitedFrom: d.visited_from ?? undefined,
      visitedTo: d.visited_to ?? undefined,
    })),
    memories: j.memories.map((m) => ({
      id: String(m.id),
      destinationId: String(m.destination_id),
      title: m.title,
      description: m.description ?? "",
      date: m.memory_date,
      imageUrl: mediaUrl(m.image_url),
    })),
    tripsCompleted: j.trips_completed,
    travelDays: j.travel_days,
  };
}
