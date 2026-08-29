import { apiRequest } from "./client";
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
  visibility: string;
  handle: string | null;
}

export interface BackendUser {
  id: number;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
}

export function getMe() {
  return apiRequest<BackendUser>("/api/v1/users/me");
}

export function getMyProfile() {
  return apiRequest<BackendProfile>("/api/v1/users/me/profile");
}

export function updateMyProfile(
  payload: Partial<{
    bio: string;
    avatarUrl: string;
    visibility: JourneyVisibility;
  }>,
) {
  return apiRequest<BackendProfile>("/api/v1/users/me/profile", {
    method: "PUT",
    body: {
      bio: payload.bio,
      avatar_url: payload.avatarUrl,
      visibility: payload.visibility,
    },
  });
}
