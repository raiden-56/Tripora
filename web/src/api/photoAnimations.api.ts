import { apiRequest, mediaUrl } from "./client";

export type AnimationStatus = "pending" | "processing" | "completed" | "failed";

export interface PhotoAnimation {
  id: number;
  title: string;
  status: AnimationStatus;
  outputUrl: string | null;
  errorMessage: string | null;
}

interface BackendPhotoAnimation {
  id: number;
  title: string;
  status: AnimationStatus;
  output_url: string | null;
  error_message: string | null;
}


function toFrontend(a: BackendPhotoAnimation): PhotoAnimation {
  return {
    id: a.id,
    title: a.title,
    status: a.status,
    outputUrl: mediaUrl(a.output_url),
    errorMessage: a.error_message,
  };
}

export async function createAnimation(
  title: string,
  photoIds: number[],
  tripId?: string,
): Promise<PhotoAnimation> {
  const result = await apiRequest<BackendPhotoAnimation>("/api/v1/photos/animations", {
    method: "POST",
    body: { title, photo_ids: photoIds, trip_id: tripId ? Number(tripId) : undefined },
  });
  return toFrontend(result);
}

export async function listAnimations(): Promise<PhotoAnimation[]> {
  const result = await apiRequest<BackendPhotoAnimation[]>("/api/v1/photos/animations");
  return result.map(toFrontend);
}

export async function getAnimation(id: number): Promise<PhotoAnimation> {
  const result = await apiRequest<BackendPhotoAnimation>(`/api/v1/photos/animations/${id}`);
  return toFrontend(result);
}

export async function deleteAnimation(id: number): Promise<void> {
  await apiRequest<void>(`/api/v1/photos/animations/${id}`, { method: "DELETE" });
}
