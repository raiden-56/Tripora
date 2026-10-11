import { apiRequest } from "./client";
import type { BackendBooking, BackendGuide, Booking, Guide } from "./guides.api";
import { toBooking, toGuide } from "./guides.api";

export type UserRole = "USER" | "GUIDE" | "ADMIN";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  destinations: number;
  trips: number;
}

export interface NamedCount {
  name: string;
  count: number;
}

export interface AdminReport {
  totalUsers: number;
  activeUsers: number;
  newUsers30d: number;
  totalDestinations: number;
  totalTrips: number;
  totalMemories: number;
  totalPhotos: number;
  totalPosts: number;
  totalGuides: number;
  unverifiedGuides: number;
  totalBookings: number;
  activeSubscriptions: number;
  signupsByMonth: NamedCount[];
  popularDestinations: NamedCount[];
  popularStates: NamedCount[];
}

interface BackendAdminUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  destinations: number;
  trips: number;
}

interface Page<T> {
  data: T[];
  meta: { page: number; page_size: number; total: number; total_pages: number };
}

const toUser = (u: BackendAdminUser): AdminUser => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  isActive: u.is_active,
  createdAt: u.created_at,
  destinations: u.destinations,
  trips: u.trips,
});

export async function getReport(): Promise<AdminReport> {
  const r = await apiRequest<Record<string, unknown>>("/api/v1/admin/reports");
  return {
    totalUsers: r.total_users as number,
    activeUsers: r.active_users as number,
    newUsers30d: r.new_users_30d as number,
    totalDestinations: r.total_destinations as number,
    totalTrips: r.total_trips as number,
    totalMemories: r.total_memories as number,
    totalPhotos: r.total_photos as number,
    totalPosts: r.total_posts as number,
    totalGuides: r.total_guides as number,
    unverifiedGuides: r.unverified_guides as number,
    totalBookings: r.total_bookings as number,
    activeSubscriptions: r.active_subscriptions as number,
    signupsByMonth: r.signups_by_month as NamedCount[],
    popularDestinations: r.popular_destinations as NamedCount[],
    popularStates: r.popular_states as NamedCount[],
  };
}

export async function listUsers(params: {
  search?: string;
  role?: UserRole | "";
  page?: number;
}): Promise<{ users: AdminUser[]; total: number; totalPages: number }> {
  const query = new URLSearchParams({ page: String(params.page ?? 1), page_size: "25" });
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.role) query.set("role", params.role);
  const page = await apiRequest<Page<BackendAdminUser>>(`/api/v1/admin/users?${query}`);
  return { users: page.data.map(toUser), total: page.meta.total, totalPages: page.meta.total_pages };
}

export async function updateUser(
  id: number,
  patch: { isActive?: boolean; role?: UserRole },
): Promise<AdminUser> {
  const body: Record<string, unknown> = {};
  if (patch.isActive !== undefined) body.is_active = patch.isActive;
  if (patch.role !== undefined) body.role = patch.role;
  return toUser(await apiRequest<BackendAdminUser>(`/api/v1/admin/users/${id}`, { method: "PATCH", body }));
}

export async function listGuides(): Promise<Guide[]> {
  const guides = await apiRequest<BackendGuide[]>("/api/v1/admin/guides");
  return guides.map(toGuide);
}

export async function setGuideVerified(id: number, isVerified: boolean): Promise<Guide> {
  return toGuide(
    await apiRequest<BackendGuide>(`/api/v1/admin/guides/${id}`, {
      method: "PATCH",
      body: { is_verified: isVerified },
    }),
  );
}

export async function listBookings(): Promise<Booking[]> {
  const bookings = await apiRequest<BackendBooking[]>("/api/v1/admin/bookings?limit=200");
  return bookings.map(toBooking);
}
