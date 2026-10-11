import { apiRequest, pickBody } from "./client";

export type ItineraryKind = "place" | "activity" | "food" | "transport" | "stay";

export interface ItineraryItem {
  id: string;
  dayNumber: number;
  position: number;
  startTime: string | null;
  title: string;
  kind: ItineraryKind;
  notes: string | null;
  cost: number | null;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  title: string | null;
  items: ItineraryItem[];
}

export interface Itinerary {
  days: ItineraryDay[];
  totalCost: number;
}

interface BackendItem {
  id: number;
  day_number: number;
  position: number;
  start_time: string | null;
  title: string;
  kind: ItineraryKind;
  notes: string | null;
  cost: number | null;
}

interface BackendItinerary {
  days: { day_number: number; date: string; title: string | null; items: BackendItem[] }[];
  total_cost: number;
}

const toItem = (i: BackendItem): ItineraryItem => ({
  id: String(i.id),
  dayNumber: i.day_number,
  position: i.position,
  startTime: i.start_time,
  title: i.title,
  kind: i.kind,
  notes: i.notes,
  cost: i.cost,
});

const toItinerary = (b: BackendItinerary): Itinerary => ({
  days: b.days.map((d) => ({
    dayNumber: d.day_number,
    date: d.date,
    title: d.title,
    items: d.items.map(toItem),
  })),
  totalCost: b.total_cost,
});

const base = (tripId: string) => `/api/v1/trips/${tripId}/itinerary`;

export type ItemInput = Partial<Pick<ItineraryItem, "dayNumber" | "title" | "kind" | "startTime" | "notes" | "cost">>;

const itemBody = (input: ItemInput) =>
  pickBody(input, {
    dayNumber: "day_number",
    title: "title",
    kind: "kind",
    startTime: "start_time",
    notes: "notes",
    cost: "cost",
  });

export async function getItinerary(tripId: string): Promise<Itinerary> {
  return toItinerary(await apiRequest<BackendItinerary>(base(tripId)));
}

export async function addItem(tripId: string, input: ItemInput): Promise<ItineraryItem> {
  return toItem(
    await apiRequest<BackendItem>(`${base(tripId)}/items`, { method: "POST", body: itemBody(input) }),
  );
}

export async function updateItem(tripId: string, itemId: string, input: ItemInput): Promise<ItineraryItem> {
  return toItem(
    await apiRequest<BackendItem>(`${base(tripId)}/items/${itemId}`, { method: "PATCH", body: itemBody(input) }),
  );
}

export async function deleteItem(tripId: string, itemId: string): Promise<void> {
  await apiRequest<void>(`${base(tripId)}/items/${itemId}`, { method: "DELETE" });
}

/** Saves the given order: every listed day gets exactly these stops, top to bottom. */
export async function saveOrder(
  tripId: string,
  days: { dayNumber: number; itemIds: string[] }[],
): Promise<Itinerary> {
  return toItinerary(
    await apiRequest<BackendItinerary>(`${base(tripId)}/order`, {
      method: "PUT",
      body: { days: days.map((d) => ({ day_number: d.dayNumber, item_ids: d.itemIds.map(Number) })) },
    }),
  );
}

export async function setDayTitle(tripId: string, dayNumber: number, title: string): Promise<Itinerary> {
  return toItinerary(
    await apiRequest<BackendItinerary>(`${base(tripId)}/days/${dayNumber}`, { method: "PUT", body: { title } }),
  );
}

/** Copies a Trip Planner result into the trip (day N → day N). */
export async function importPlan(
  tripId: string,
  planId: string | number,
  mode: "replace" | "append" = "replace",
): Promise<Itinerary> {
  return toItinerary(
    await apiRequest<BackendItinerary>(`${base(tripId)}/import-plan`, {
      method: "POST",
      body: { plan_id: Number(planId), mode },
    }),
  );
}
