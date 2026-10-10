import { apiRequest } from "./client";
import type { ChecklistItem, TripBudget } from "../types";

interface BackendChecklistItem {
  id: number;
  text: string;
  is_done: boolean;
  position: number;
}

interface BackendBudget {
  lines: { category: string; planned_amount: number; spent: number }[];
  total_planned: number;
  total_spent: number;
}

const toItem = (i: BackendChecklistItem): ChecklistItem => ({
  id: String(i.id),
  text: i.text,
  isDone: i.is_done,
});

const toBudget = (b: BackendBudget): TripBudget => ({
  lines: b.lines.map((l) => ({
    category: l.category,
    planned: l.planned_amount,
    spent: l.spent,
  })),
  totalPlanned: b.total_planned,
  totalSpent: b.total_spent,
});

export async function listChecklist(tripId: string): Promise<ChecklistItem[]> {
  const items = await apiRequest<BackendChecklistItem[]>(
    `/api/v1/trips/${tripId}/checklist`,
  );
  return items.map(toItem);
}

export async function addChecklistItem(
  tripId: string,
  text: string,
): Promise<ChecklistItem> {
  return toItem(
    await apiRequest<BackendChecklistItem>(`/api/v1/trips/${tripId}/checklist`, {
      method: "POST",
      body: { text },
    }),
  );
}

export async function updateChecklistItem(
  tripId: string,
  itemId: string,
  patch: { text?: string; isDone?: boolean },
): Promise<ChecklistItem> {
  const body: Record<string, unknown> = {};
  if (patch.text !== undefined) body.text = patch.text;
  if (patch.isDone !== undefined) body.is_done = patch.isDone;
  return toItem(
    await apiRequest<BackendChecklistItem>(
      `/api/v1/trips/${tripId}/checklist/${itemId}`,
      { method: "PATCH", body },
    ),
  );
}

export async function deleteChecklistItem(
  tripId: string,
  itemId: string,
): Promise<void> {
  await apiRequest<void>(`/api/v1/trips/${tripId}/checklist/${itemId}`, {
    method: "DELETE",
  });
}

export async function getBudget(tripId: string): Promise<TripBudget> {
  return toBudget(
    await apiRequest<BackendBudget>(`/api/v1/trips/${tripId}/budget`),
  );
}

/** Replaces the planned budget with exactly these categories. */
export async function saveBudget(
  tripId: string,
  items: { category: string; planned: number }[],
): Promise<TripBudget> {
  return toBudget(
    await apiRequest<BackendBudget>(`/api/v1/trips/${tripId}/budget`, {
      method: "PUT",
      body: {
        items: items.map((i) => ({
          category: i.category,
          planned_amount: i.planned,
        })),
      },
    }),
  );
}

/** Adds several items at once; ones already on the list are skipped. Returns the full list. */
export async function addChecklistItems(tripId: string, texts: string[]): Promise<ChecklistItem[]> {
  const items = await apiRequest<BackendChecklistItem[]>(`/api/v1/trips/${tripId}/checklist/bulk`, {
    method: "POST",
    body: { texts },
  });
  return items.map(toItem);
}
