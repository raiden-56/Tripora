export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Guide {
  id: string;
  name: string;
  avatar: string;
  experience: number; // years
  rating: number;
  totalReviews: number;
  languages: string[];
  bio: string;
  pricePerSlot: number;
  availableSlots: TimeSlot[];
  assignedPlaces: string[]; // place IDs
  isFavorite?: boolean;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  image: string;
  location: string;
  category: string;
  guides: string[]; // guide IDs
}

export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  guideId: string;
  guideName: string;
  placeId: string;
  placeName: string;
  slot: TimeSlot;
  totalPrice: number;
  status: "confirmed" | "cancelled" | "completed";
  bookedAt: string;
}

export interface FilterOptions {
  search: string;
  priceRange: [number, number];
  rating: number | null;
  timeSlot: string;
  sortBy: "price-asc" | "price-desc" | "rating" | "";
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  guideId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Analytics {
  totalBookings: number;
  totalRevenue: number;
  mostHiredGuide: { name: string; count: number };
  mostVisitedPlace: { name: string; count: number };
  revenueByMonth: { month: string; revenue: number }[];
  bookingsByMonth: { month: string; count: number }[];
}
