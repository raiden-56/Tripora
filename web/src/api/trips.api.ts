import { apiRequest } from "./client";
import type { DestinationStatus, Trip } from "../types";

interface BackendTrip {
  id: number;
  user_id: number;
  title: string;
  start_date: string;
  end_date: string;
  status: DestinationStatus;
  cover_image_url: string | null;
  notes: string | null;
  drive_folder_url: string | null;
  destination_ids: number[];
}

interface Page<T> {
  data: T[];
  meta: { page: number; page_size: number; total: number; total_pages: number };
}

function toFrontend(t: BackendTrip): Trip {
  return {
    id: String(t.id),
    title: t.title,
    destinationIds: t.destination_ids.map(String),
    startDate: t.start_date,
    endDate: t.end_date,
    status: t.status,
    coverImageUrl: t.cover_image_url ?? "",
    notes: t.notes ?? undefined,
    driveFolderUrl: t.drive_folder_url ?? undefined,
  };
}

function toBackend(payload: Partial<Trip>) {
  return {
    title: payload.title,
    start_date: payload.startDate,
    end_date: payload.endDate,
    status: payload.status,
    cover_image_url: payload.coverImageUrl,
    notes: payload.notes,
    drive_folder_url: payload.driveFolderUrl,
    destination_ids: payload.destinationIds?.map(Number),
  };
}

export async function listTrips(): Promise<Trip[]> {
  const result = await apiRequest<Page<BackendTrip>>(
    "/api/v1/trips?page_size=100",
  );
  return result.data.map(toFrontend);
}

export async function createTrip(payload: Partial<Trip>): Promise<Trip> {
  const result = await apiRequest<BackendTrip>("/api/v1/trips", {
    method: "POST",
    body: toBackend(payload),
  });
  return toFrontend(result);
}

export async function updateTrip(
  id: string,
  payload: Partial<Trip>,
): Promise<Trip> {
  const result = await apiRequest<BackendTrip>(`/api/v1/trips/${id}`, {
    method: "PUT",
    body: toBackend(payload),
  });
  return toFrontend(result);
}

export async function deleteTrip(id: string): Promise<void> {
  await apiRequest<void>(`/api/v1/trips/${id}`, { method: "DELETE" });
}
