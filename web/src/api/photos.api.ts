import { apiRequest, mediaUrl } from "./client";

export interface Photo {
  id: number;
  destinationId: string | null;
  memoryId: string | null;
  tripId: string | null;
  url: string;
  caption: string | null;
  takenAt: string | null;
}

interface BackendPhoto {
  id: number;
  destination_id: number | null;
  memory_id: number | null;
  trip_id: number | null;
  url: string;
  caption: string | null;
  taken_at: string | null;
}

/** A shareable album created from selected photos (POST /photos/share). */
export interface PhotoShare {
  id: number;
  shareToken: string;
  title: string;
  description: string | null;
}

interface BackendPhotoShare {
  id: number;
  share_token: string;
  title: string;
  description: string | null;
  is_public: boolean;
}

function toFrontend(p: BackendPhoto): Photo {
  return {
    id: p.id,
    destinationId: p.destination_id ? String(p.destination_id) : null,
    memoryId: p.memory_id ? String(p.memory_id) : null,
    tripId: p.trip_id ? String(p.trip_id) : null,
    url: mediaUrl(p.url),
    caption: p.caption,
    takenAt: p.taken_at,
  };
}

export async function listPhotos(
  filters: { destinationId?: string } = {},
): Promise<Photo[]> {
  const params = new URLSearchParams();
  if (filters.destinationId)
    params.set("destination_id", filters.destinationId);
  const query = params.toString();
  const result = await apiRequest<BackendPhoto[]>(
    `/api/v1/photos${query ? `?${query}` : ""}`,
  );
  return result.map(toFrontend);
}

export async function uploadPhoto(
  file: File,
  options: {
    destinationId?: string;
    memoryId?: string;
    tripId?: string;
    caption?: string;
  } = {},
): Promise<Photo> {
  const formData = new FormData();
  formData.append("file", file);
  if (options.destinationId)
    formData.append("destination_id", options.destinationId);
  if (options.memoryId) formData.append("memory_id", options.memoryId);
  if (options.tripId) formData.append("trip_id", options.tripId);
  if (options.caption) formData.append("caption", options.caption);
  const result = await apiRequest<BackendPhoto>("/api/v1/photos", {
    method: "POST",
    body: formData,
    isFormData: true,
  });
  return toFrontend(result);
}

export async function deletePhoto(id: number): Promise<void> {
  await apiRequest<void>(`/api/v1/photos/${id}`, { method: "DELETE" });
}

export async function sharePhotos(payload: {
  title: string;
  description?: string;
  photoIds: number[];
}): Promise<PhotoShare> {
  const result = await apiRequest<BackendPhotoShare>(
    "/api/v1/photos/share",
    {
      method: "POST",
      body: {
        title: payload.title,
        description: payload.description,
        photo_ids: payload.photoIds,
        is_public: true,
      },
    },
  );
  return {
    id: result.id,
    shareToken: result.share_token,
    title: result.title,
    description: result.description,
  };
}
