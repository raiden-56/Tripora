import { apiRequest } from "./client";

export interface PlannerRequest {
  origin: string;
  destination: string;
  days: number;
  people: number;
  budget: number;
  travelStyle: string;
  interests: string[];
}

export interface TripPlanActivity {
  kind: "place" | "activity" | "food";
  description: string;
}

export interface TripPlanDay {
  dayNumber: number;
  title: string;
  activities: TripPlanActivity[];
}

export type TripPlanStatus = "pending" | "processing" | "completed" | "failed";

export interface TripPlan {
  id: string;
  origin: string;
  destinationName: string;
  days: number;
  people: number;
  budget: number;
  travelStyle: string;
  estimatedBudgetMin: number | null;
  estimatedBudgetMax: number | null;
  distanceKm: number | null;
  routeDescription: string | null;
  status: TripPlanStatus;
  daysDetail: TripPlanDay[];
}

interface BackendTripPlanActivity {
  kind: string;
  description: string;
}

interface BackendTripPlanDay {
  day_number: number;
  title: string;
  activities: BackendTripPlanActivity[];
}

interface BackendTripPlan {
  id: number;
  origin: string;
  destination_name: string;
  days: number;
  people: number;
  budget: number;
  travel_style: string;
  estimated_budget_min: number | null;
  estimated_budget_max: number | null;
  distance_km: number | null;
  route_description: string | null;
  status: TripPlanStatus;
  days_detail: BackendTripPlanDay[];
}

function toFrontend(p: BackendTripPlan): TripPlan {
  return {
    id: String(p.id),
    origin: p.origin,
    destinationName: p.destination_name,
    days: p.days,
    people: p.people,
    budget: p.budget,
    travelStyle: p.travel_style,
    estimatedBudgetMin: p.estimated_budget_min,
    estimatedBudgetMax: p.estimated_budget_max,
    distanceKm: p.distance_km,
    routeDescription: p.route_description,
    status: p.status,
    daysDetail: p.days_detail
      .slice()
      .sort((a, b) => a.day_number - b.day_number)
      .map((d) => ({
        dayNumber: d.day_number,
        title: d.title,
        activities: d.activities.map((a) => ({
          kind: a.kind as TripPlanActivity["kind"],
          description: a.description,
        })),
      })),
  };
}

function toBackend(payload: PlannerRequest) {
  return {
    origin: payload.origin,
    destination: payload.destination,
    days: payload.days,
    people: payload.people,
    budget: payload.budget,
    travel_style: payload.travelStyle,
    interests: payload.interests,
  };
}

export async function generatePlan(payload: PlannerRequest): Promise<TripPlan> {
  const result = await apiRequest<BackendTripPlan>("/api/v1/planner/generate", {
    method: "POST",
    body: toBackend(payload),
  });
  return toFrontend(result);
}

export async function listPlans(): Promise<TripPlan[]> {
  const result = await apiRequest<BackendTripPlan[]>("/api/v1/planner");
  return result.map(toFrontend);
}
