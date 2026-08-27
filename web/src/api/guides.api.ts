import { apiRequest } from "./client";

export interface Guide {
  id: number;
  userId: number;
  headline: string;
  about: string | null;
  destinationName: string;
  languages: string[];
  experienceYears: number;
  specialization: string | null;
  pricePerDay: number;
  isVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
}

interface BackendGuide {
  id: number;
  user_id: number;
  headline: string;
  about: string | null;
  destination_name: string;
  languages: string[];
  experience_years: number;
  specialization: string | null;
  price_per_day: number;
  is_verified: boolean;
  rating_avg: number;
  rating_count: number;
}

interface Page<T> {
  data: T[];
  meta: { page: number; page_size: number; total: number; total_pages: number };
}

function toFrontend(g: BackendGuide): Guide {
  return {
    id: g.id,
    userId: g.user_id,
    headline: g.headline,
    about: g.about,
    destinationName: g.destination_name,
    languages: g.languages,
    experienceYears: g.experience_years,
    specialization: g.specialization,
    pricePerDay: g.price_per_day,
    isVerified: g.is_verified,
    ratingAvg: g.rating_avg,
    ratingCount: g.rating_count,
  };
}

export async function searchGuides(
  filters: {
    destinationName?: string;
    minRating?: number;
    maxPrice?: number;
    language?: string;
  } = {},
): Promise<Guide[]> {
  const params = new URLSearchParams({ page_size: "50" });
  if (filters.destinationName)
    params.set("destination_name", filters.destinationName);
  if (filters.minRating) params.set("min_rating", String(filters.minRating));
  if (filters.maxPrice) params.set("max_price", String(filters.maxPrice));
  if (filters.language) params.set("language", filters.language);
  const result = await apiRequest<Page<BackendGuide>>(
    `/api/v1/guides?${params.toString()}`,
  );
  return result.data.map(toFrontend);
}

export async function getGuide(id: number): Promise<Guide> {
  return toFrontend(await apiRequest<BackendGuide>(`/api/v1/guides/${id}`));
}

export async function getMyGuideProfile(): Promise<Guide | null> {
  const result = await apiRequest<BackendGuide | null>(
    "/api/v1/guides/me/profile",
  );
  return result ? toFrontend(result) : null;
}

export async function becomeGuide(payload: {
  headline: string;
  about?: string;
  destinationName: string;
  languages: string[];
  experienceYears: number;
  specialization?: string;
  pricePerDay: number;
}): Promise<Guide> {
  const result = await apiRequest<BackendGuide>("/api/v1/guides", {
    method: "POST",
    body: {
      headline: payload.headline,
      about: payload.about,
      destination_name: payload.destinationName,
      languages: payload.languages,
      experience_years: payload.experienceYears,
      specialization: payload.specialization,
      price_per_day: payload.pricePerDay,
    },
  });
  return toFrontend(result);
}

export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

export interface Booking {
  id: number;
  userId: number;
  guideId: number;
  bookingDate: string;
  bookingTime: string;
  peopleCount: number;
  durationHours: number;
  specialRequirements: string | null;
  status: BookingStatus;
}

interface BackendBooking {
  id: number;
  user_id: number;
  guide_id: number;
  booking_date: string;
  booking_time: string;
  people_count: number;
  duration_hours: number;
  special_requirements: string | null;
  status: BookingStatus;
}

function bookingToFrontend(b: BackendBooking): Booking {
  return {
    id: b.id,
    userId: b.user_id,
    guideId: b.guide_id,
    bookingDate: b.booking_date,
    bookingTime: b.booking_time,
    peopleCount: b.people_count,
    durationHours: b.duration_hours,
    specialRequirements: b.special_requirements,
    status: b.status,
  };
}

export async function requestBooking(
  guideId: number,
  payload: {
    bookingDate: string;
    bookingTime: string;
    peopleCount: number;
    durationHours: number;
    specialRequirements?: string;
  },
): Promise<Booking> {
  const result = await apiRequest<BackendBooking>(
    `/api/v1/guides/${guideId}/booking`,
    {
      method: "POST",
      body: {
        booking_date: payload.bookingDate,
        booking_time: payload.bookingTime,
        people_count: payload.peopleCount,
        duration_hours: payload.durationHours,
        special_requirements: payload.specialRequirements,
      },
    },
  );
  return bookingToFrontend(result);
}

export async function listMyBookings(): Promise<Booking[]> {
  const result = await apiRequest<BackendBooking[]>("/api/v1/bookings");
  return result.map(bookingToFrontend);
}

export async function listBookingsReceived(): Promise<Booking[]> {
  const result = await apiRequest<BackendBooking[]>(
    "/api/v1/bookings/received",
  );
  return result.map(bookingToFrontend);
}

export async function updateBookingStatus(
  bookingId: number,
  status: BookingStatus,
): Promise<Booking> {
  const result = await apiRequest<BackendBooking>(
    `/api/v1/bookings/${bookingId}`,
    { method: "PATCH", body: { status } },
  );
  return bookingToFrontend(result);
}

export async function reviewGuide(
  guideId: number,
  payload: { bookingId: number; rating: number; comment?: string },
) {
  return apiRequest(`/api/v1/guides/${guideId}/reviews`, {
    method: "POST",
    body: {
      booking_id: payload.bookingId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });
}
