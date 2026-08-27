export type DestinationStatus = "visited" | "planned" | "wishlist";
export type Priority = "high" | "medium" | "low";

export interface DriveFolder {
  id: string;
  name: string;
  url: string;
  fileCount: number;
}

export interface Place {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

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
  googleDriveUrl?: string;
  driveFolder?: DriveFolder;
  places: Place[];
  notes?: string;
  priority?: Priority;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface TripBudget {
  category: string;
  planned: number;
  actual: number;
}

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
  checklist?: ChecklistItem[];
  budget?: TripBudget[];
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
  name: string;
  bio: string;
  avatarUrl: string;
  visibility: JourneyVisibility;
  handle: string;
  interests: string[];
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
