import { NavLink } from "react-router-dom";
import clsx from "clsx";
import {
  BarChart3,
  Calendar,
  Compass,
  Images,
  LayoutDashboard,
  MapPinned,
  Plane,
  Settings,
  Sparkles,
  Telescope,
  User,
} from "lucide-react";
import { Logo } from "../common/Logo";

const NAV_ITEMS = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/map", label: "Explore Map", icon: Compass },
  { to: "/app/discover", label: "Discover", icon: Telescope },
  { to: "/app/journeys", label: "My Journeys", icon: Plane },
  { to: "/app/destinations", label: "Destinations", icon: MapPinned },
  { to: "/app/memories", label: "Memories", icon: Images },
  { to: "/app/trips", label: "Upcoming Trips", icon: Calendar },
  { to: "/app/ai", label: "Canvas AI", icon: Sparkles },
  { to: "/app/statistics", label: "Travel Statistics", icon: BarChart3 },
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-ink/8 dark:border-white/8 px-3 py-5">
      <div className="px-3 mb-6">
        <Logo />
      </div>
      <nav className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-forest-500 text-white shadow-soft"
                  : "text-ink-soft hover:bg-ink/5 dark:text-white/60 dark:hover:bg-white/8",
              )
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pt-3 border-t border-ink/8 dark:border-white/8 text-xs text-ink-soft dark:text-white/40">
        TravelCanvas &copy; 2026
      </div>
    </aside>
  );
}
