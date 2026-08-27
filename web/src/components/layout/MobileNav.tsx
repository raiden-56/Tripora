import { Compass, LayoutDashboard, Plane, Telescope, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

const ITEMS = [
  { to: "/app", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/app/map", label: "Map", icon: Compass },
  { to: "/app/discover", label: "Discover", icon: Telescope },
  { to: "/app/trips", label: "Trips", icon: Plane },
  { to: "/app/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 dark:bg-[#181b1e]/90 backdrop-blur-lg border-t border-ink/8 dark:border-white/10 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5">
      <div className="flex justify-between">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                "flex flex-1 flex-col items-center gap-0.5 py-1.5 rounded-xl text-[11px] font-medium transition-colors",
                isActive
                  ? "text-forest-500"
                  : "text-ink-soft dark:text-white/50",
              )
            }
          >
            <Icon size={20} strokeWidth={2.1} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
