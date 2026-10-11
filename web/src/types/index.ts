export type DestinationStatus = "visited" | "planned" | "wishlist";
export type Priority = "high" | "medium" | "low";

export interface Memory {
  id: string;
  destinationId: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string; // ISO date
  tags: string[];
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  state?: string;
  city?: string;
  latitude: number;
  longitude: number;
  status: DestinationStatus;
  isFavorite: boolean;
  visitedFrom?: string;
  visitedTo?: string;
  rating?: number;
  description?: string;
  heroImageUrl: string;
  googleMapsUrl?: string;
  /** Link to a Google Drive folder with this place's photos/files. */
  googleDriveUrl?: string;
  notes?: string;
  priority?: Priority;
  category?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isDone: boolean;
}

export interface BudgetLine {
  category: string;
  planned: number;
  /** Summed from the trip's recorded expenses in this category. */
  spent: number;
}

export interface TripBudget {
  lines: BudgetLine[];
  totalPlanned: number;
  totalSpent: number;
}

export type TripRole = "owner" | "editor" | "viewer";

export interface Trip {
  id: string;
  title: string;
  destinationIds: string[];
  startDate: string;
  endDate: string;
  status: DestinationStatus;
  coverImageUrl: string;
  notes?: string;
  driveFolderUrl?: string;
  /** The current user's access level on this trip — "owner" unless it's a shared trip. */
  role: TripRole;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

export type JourneyVisibility = "private" | "friends" | "public";

export interface User {
  id: number | null;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  homeLocation: string;
  visibility: JourneyVisibility;
  handle: string;
  /** Travel interests picked during onboarding (stored as profile.favorite_activities). */
  interests: string[];
  travelStyle: string;
  notificationsEnabled: boolean;
}

export interface AuthUser {
  name: string;
  email: string;
  avatarUrl: string;
}

export interface AppNotification {
  id: string;
  message: string;
  type: "info" | "success" | "warning";
  createdAt: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export type ViewMode = "world" | "india";

export interface MapFilters {
  status: DestinationStatus | "all" | "favorites";
  country?: string;
  state?: string;
  year?: string;
}
