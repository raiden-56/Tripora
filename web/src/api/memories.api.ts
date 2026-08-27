import { apiRequest } from "./client";
import type { Memory } from "../types";

interface BackendMemory {
  id: number;
  user_id: number;
  destination_id: number;
  trip_id: number | null;
  title: string;
  description: string | null;
  memory_date: string;
  tags: string[];
}

interface Page<T> {
  data: T[];
  meta: { page: number; page_size: number; total: number; total_pages: number };
}

function toFrontend(m: BackendMemory): Memory {
  return {
    id: String(m.id),
    destinationId: String(m.destination_id),
    title: m.title,
    description: m.description ?? "",
    imageUrl: "",
    date: m.memory_date,
    tags: m.tags,
  };
}

function toBackend(payload: Partial<Memory>) {
  return {
    destination_id: payload.destinationId
      ? Number(payload.destinationId)
      : undefined,
    title: payload.title,
    description: payload.description,
    memory_date: payload.date,
    tags: payload.tags,
  };
}

export async function listMemories(): Promise<Memory[]> {
  const result = await apiRequest<Page<BackendMemory>>(
    "/api/v1/memories?page_size=100",
  );
  return result.data.map(toFrontend);
}

export async function createMemory(payload: Partial<Memory>): Promise<Memory> {
  const result = await apiRequest<BackendMemory>("/api/v1/memories", {
    method: "POST",
    body: toBackend(payload),
  });
  return toFrontend(result);
}

export async function updateMemory(
  id: string,
  payload: Partial<Memory>,
): Promise<Memory> {
  const result = await apiRequest<BackendMemory>(`/api/v1/memories/${id}`, {
    method: "PUT",
    body: toBackend(payload),
  });
  return toFrontend(result);
}

export async function deleteMemory(id: string): Promise<void> {
  await apiRequest<void>(`/api/v1/memories/${id}`, { method: "DELETE" });
}
