import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { buildNotifications } from "../../utils/notifications";

const ICONS = {
  info: <Info size={14} className="text-sky-500" />,
  success: <CheckCircle2 size={14} className="text-forest-500" />,
  warning: <AlertTriangle size={14} className="text-amber-500" />,
};

export function NotificationBell() {
  const destinations = useAppStore((s) => s.destinations);
  const trips = useAppStore((s) => s.trips);
  const achievements = useAppStore((s) => s.achievements);
  const notificationsEnabled = useAppStore((s) => s.notificationsEnabled);
  const [open, setOpen] = useState(false);

  const notifications = useMemo(
    () =>
      notificationsEnabled
        ? buildNotifications(destinations, trips, achievements)
        : [],
    [destinations, trips, achievements, notificationsEnabled],
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-white/8 border border-ink/8 dark:border-white/10 text-ink-soft hover:text-ink dark:hover:text-white shadow-soft transition"
        aria-label="Notifications"
      >
        <Bell size={17} />
        {notifications.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-coral-500 text-white text-[9px] font-bold flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 z-50 w-80 max-w-[85vw] bg-white dark:bg-[#1c2024] border border-ink/10 dark:border-white/10 rounded-2xl shadow-soft-lg overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-ink/8 dark:border-white/10">
                <p className="text-sm font-semibold">Notifications</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-ink-soft text-center py-8 px-4">
                    {notificationsEnabled
                      ? "You're all caught up."
                      : "Notifications are turned off in Settings."}
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-2.5 px-4 py-3 border-b border-ink/6 dark:border-white/5 last:border-0"
                    >
                      <span className="mt-0.5 shrink-0">{ICONS[n.type]}</span>
                      <p className="text-xs text-ink-soft dark:text-white/60 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
