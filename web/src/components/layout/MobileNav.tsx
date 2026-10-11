import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { LogOut, Menu, X } from "lucide-react";
import { MOBILE_PINNED, NAV_ITEMS } from "./navItems";
import { useAuthStore } from "../../store/useAuthStore";

const PINNED = NAV_ITEMS.filter((item) => MOBILE_PINNED.includes(item.to));
const MORE = NAV_ITEMS.filter((item) => !MOBILE_PINNED.includes(item.to));

export function MobileNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const inMore = MORE.some((item) => pathname.startsWith(item.to));

  // Close the sheet whenever navigation happens.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMoreOpen(false);
  }

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMoreOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 inset-x-0 rounded-t-3xl bg-white dark:bg-[#1c2024] px-4 pt-4 pb-[max(env(safe-area-inset-bottom),16px)]"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-display text-lg">More</h2>
                <button
                  onClick={() => setMoreOpen(false)}
                  aria-label="Close menu"
                  className="text-ink-soft hover:text-ink dark:hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {MORE.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      clsx(
                        "flex flex-col items-center gap-1.5 py-3 rounded-2xl text-[11px] font-medium text-center",
                        isActive
                          ? "bg-forest-500 text-white"
                          : "bg-ink/4 dark:bg-white/5 text-ink-soft dark:text-white/70",
                      )
                    }
                  >
                    <Icon size={20} strokeWidth={2} />
                    {label}
                  </NavLink>
                ))}
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-ink/10 dark:border-white/10 text-sm font-semibold text-coral-500"
              >
                <LogOut size={16} /> Log out
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 dark:bg-[#181b1e]/90 backdrop-blur-lg border-t border-ink/8 dark:border-white/10 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5">
        <div className="flex justify-between">
          {PINNED.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  "flex flex-1 flex-col items-center gap-0.5 py-1.5 rounded-xl text-[11px] font-medium transition-colors",
                  isActive ? "text-forest-500" : "text-ink-soft dark:text-white/50",
                )
              }
            >
              <Icon size={20} strokeWidth={2.1} />
              {label === "Dashboard" ? "Home" : label.replace("Explore ", "")}
            </NavLink>
          ))}
          <button
            onClick={() => setMoreOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            className={clsx(
              "flex flex-1 flex-col items-center gap-0.5 py-1.5 rounded-xl text-[11px] font-medium transition-colors",
              inMore || moreOpen ? "text-forest-500" : "text-ink-soft dark:text-white/50",
            )}
          >
            <Menu size={20} strokeWidth={2.1} />
            More
          </button>
        </div>
      </nav>
    </>
  );
}
