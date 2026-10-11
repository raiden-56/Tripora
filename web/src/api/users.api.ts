import { apiRequest, pickBody } from "./client";
import type { JourneyVisibility } from "../types";

export interface BackendProfile {
  bio: string | null;
  avatar_url: string | null;
  home_location: string | null;
  preferred_travel_style: string | null;
  budget_preference: string | null;
  favorite_activities: string | null;
  trip_duration_preference: string | null;
  group_size_preference: string | null;
  visibility: JourneyVisibility;
  handle: string | null;
  notifications_enabled: boolean;
  onboarding_completed: boolean;
}

export interface BackendUser {
  id: number;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
}

export interface ProfileUpdate {
  bio?: string;
  avatarUrl?: string;
  homeLocation?: string;
  travelStyle?: string;
  /** Saved as a comma-separated list in profile.favorite_activities. */
  interests?: string[];
  visibility?: JourneyVisibility;
  handle?: string;
  notificationsEnabled?: boolean;
  onboardingCompleted?: boolean;
}

export function getMe() {
  return apiRequest<BackendUser>("/api/v1/users/me");
}

export function updateMe(payload: { name: string }) {
  return apiRequest<BackendUser>("/api/v1/users/me", {
    method: "PUT",
    body: { name: payload.name },
  });
}

export function getMyProfile() {
  return apiRequest<BackendProfile>("/api/v1/users/me/profile");
}

export function updateMyProfile(payload: ProfileUpdate) {
  const { interests, ...rest } = payload;
  const body = pickBody(rest, {
    bio: "bio",
    avatarUrl: "avatar_url",
    homeLocation: "home_location",
    travelStyle: "preferred_travel_style",
    visibility: "visibility",
    handle: "handle",
    notificationsEnabled: "notifications_enabled",
    onboardingCompleted: "onboarding_completed",
  });
  if (interests) body.favorite_activities = interests.join(",") || null;
  return apiRequest<BackendProfile>("/api/v1/users/me/profile", {
    method: "PUT",
    body,
  });
}

export function splitInterests(profile: BackendProfile): string[] {
  return (profile.favorite_activities ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Everything the user has stored, as one JSON document. */
export function exportMyData() {
  return apiRequest<Record<string, unknown>>("/api/v1/users/me/export");
}

export function deleteMyAccount(password: string) {
  return apiRequest<void>("/api/v1/users/me", {
    method: "DELETE",
    body: { password },
  });
}
