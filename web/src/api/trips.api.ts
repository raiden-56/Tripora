import { apiRequest, pickBody } from "./client";
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
  role: Trip["role"];
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
    role: t.role ?? "owner",
  };
}

function toBackend(payload: Partial<Trip>) {
  const body = pickBody(payload, {
    title: "title",
    startDate: "start_date",
    endDate: "end_date",
    status: "status",
    coverImageUrl: "cover_image_url",
    notes: "notes",
    driveFolderUrl: "drive_folder_url",
  });
  if (payload.destinationIds) {
    body.destination_ids = payload.destinationIds.filter(Boolean).map(Number);
  }
  return body;
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
