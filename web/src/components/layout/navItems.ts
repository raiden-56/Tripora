import {
  BarChart3,
  Calendar,
  CalendarHeart,
  Camera,
  Compass,
  Crown,
  Images,
  LayoutDashboard,
  MapPinned,
  Plane,
  Route,
  Settings,
  Sparkles,
  Telescope,
  User,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

/** Every page of the signed-in app, in sidebar order (the mobile "More" sheet uses it too). */
export const NAV_ITEMS: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/map", label: "Explore Map", icon: Compass },
  { to: "/app/discover", label: "Discover", icon: Telescope },
  { to: "/app/journeys", label: "My Journeys", icon: Plane },
  { to: "/app/destinations", label: "Destinations", icon: MapPinned },
  { to: "/app/memories", label: "Memories", icon: Images },
  { to: "/app/photos", label: "Photo Hub", icon: Camera },
  { to: "/app/community", label: "Community", icon: Users },
  { to: "/app/trips", label: "Trips", icon: Calendar },
  { to: "/app/planner", label: "Trip Planner", icon: Route },
  { to: "/app/guides", label: "Hire a Guide", icon: UserPlus },
  { to: "/app/ai", label: "Canvas AI", icon: Sparkles },
  { to: "/app/statistics", label: "Travel Statistics", icon: BarChart3 },
  { to: "/app/recap", label: "Yearly Recap", icon: CalendarHeart },
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/settings", label: "Settings", icon: Settings },
  { to: "/app/upgrade", label: "Plans", icon: Crown },
];

/** The handful pinned to the mobile bottom bar; everything else lives under "More". */
export const MOBILE_PINNED = ["/app", "/app/map", "/app/trips", "/app/memories"];
