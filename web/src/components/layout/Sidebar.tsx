import { NavLink, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { LogOut } from "lucide-react";
import { Logo } from "../common/Logo";
import { navItemsFor } from "./navItems";
import { useAppStore } from "../../store/useAppStore";
import { useAuthStore } from "../../store/useAuthStore";

export function Sidebar() {
  const logout = useAuthStore((s) => s.logout);
  const role = useAppStore((s) => s.user.role);
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-ink/8 dark:border-white/8 px-3 py-5">
      <div className="px-3 mb-6">
        <Logo />
      </div>
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {navItemsFor(role).map(({ to, label, icon: Icon, end }) => (
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
      <div className="px-3 pt-3 border-t border-ink/8 dark:border-white/8 flex items-center justify-between text-xs text-ink-soft dark:text-white/40">
        <span>Travel Diaries &copy; {new Date().getFullYear()}</span>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex items-center gap-1 font-semibold hover:text-coral-500"
        >
          <LogOut size={13} /> Log out
        </button>
      </div>
    </aside>
  );
}
