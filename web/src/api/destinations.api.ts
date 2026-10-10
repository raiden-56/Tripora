import { apiRequest, pickBody } from "./client";
import type { Destination, DestinationStatus } from "../types";

interface BackendDestination {
  id: number;
  user_id: number;
  name: string;
  country: string;
  state: string | null;
  city: string | null;
  category: string | null;
  latitude: number;
  longitude: number;
  status: DestinationStatus;
  is_favorite: boolean;
  priority: string | null;
  visited_from: string | null;
  visited_to: string | null;
  rating: number | null;
  description: string | null;
  notes: string | null;
  hero_image_url: string | null;
  google_maps_url: string | null;
  drive_folder_url: string | null;
}

interface Page<T> {
  data: T[];
  meta: { page: number; page_size: number; total: number; total_pages: number };
}

function toFrontend(d: BackendDestination): Destination {
  return {
    id: String(d.id),
    name: d.name,
    country: d.country,
    state: d.state ?? undefined,
    city: d.city ?? undefined,
    latitude: d.latitude,
    longitude: d.longitude,
    status: d.status,
    isFavorite: d.is_favorite,
    priority: (d.priority as Destination["priority"]) ?? undefined,
    visitedFrom: d.visited_from ?? undefined,
    visitedTo: d.visited_to ?? undefined,
    rating: d.rating ?? undefined,
    description: d.description ?? undefined,
    notes: d.notes ?? undefined,
    heroImageUrl: d.hero_image_url ?? "",
    googleMapsUrl: d.google_maps_url ?? undefined,
    googleDriveUrl: d.drive_folder_url ?? undefined,
    category: d.category ?? undefined,
  };
}

/** Only keys present in the payload are sent; present-but-empty ones are sent as
 * null, which is how an edit clears an optional field. */
function toBackend(payload: Partial<Destination>) {
  return pickBody(payload, {
    name: "name",
    country: "country",
    state: "state",
    city: "city",
    category: "category",
    latitude: "latitude",
    longitude: "longitude",
    status: "status",
    isFavorite: "is_favorite",
    priority: "priority",
    visitedFrom: "visited_from",
    visitedTo: "visited_to",
    rating: "rating",
    description: "description",
    notes: "notes",
    heroImageUrl: "hero_image_url",
    googleMapsUrl: "google_maps_url",
    googleDriveUrl: "drive_folder_url",
  });
}

export async function listDestinations(): Promise<Destination[]> {
  const result = await apiRequest<Page<BackendDestination>>(
    "/api/v1/destinations?page_size=100",
  );
  return result.data.map(toFrontend);
}

export async function createDestination(
  payload: Partial<Destination>,
): Promise<Destination> {
  const result = await apiRequest<BackendDestination>("/api/v1/destinations", {
    method: "POST",
    body: toBackend(payload),
  });
  return toFrontend(result);
}

export async function updateDestination(
  id: string,
  payload: Partial<Destination>,
): Promise<Destination> {
  const result = await apiRequest<BackendDestination>(
    `/api/v1/destinations/${id}`,
    {
      method: "PUT",
      body: toBackend(payload),
    },
  );
  return toFrontend(result);
}

export async function deleteDestination(id: string): Promise<void> {
  await apiRequest<void>(`/api/v1/destinations/${id}`, { method: "DELETE" });
}
