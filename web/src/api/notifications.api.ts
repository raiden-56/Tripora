import { apiRequest } from "./client";
import type { AppNotification } from "../types";

interface BackendNotification {
  id: number;
  message: string;
  type: AppNotification["type"];
  is_read: boolean;
  created_at: string;
}

interface Page<T> {
  data: T[];
  meta: { page: number; page_size: number; total: number; total_pages: number };
}

export async function listNotifications(): Promise<AppNotification[]> {
  const page = await apiRequest<Page<BackendNotification>>(
    "/api/v1/notifications?page_size=30",
  );
  return page.data.map((n) => ({
    id: String(n.id),
    message: n.message,
    type: n.type,
    read: n.is_read,
    createdAt: n.created_at,
  }));
}

export async function unreadCount(): Promise<number> {
  const result = await apiRequest<{ unread: number }>(
    "/api/v1/notifications/unread-count",
  );
  return result.unread;
}

export async function markRead(id: string): Promise<void> {
  await apiRequest(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllRead(): Promise<void> {
  await apiRequest<void>("/api/v1/notifications/read-all", { method: "POST" });
}
