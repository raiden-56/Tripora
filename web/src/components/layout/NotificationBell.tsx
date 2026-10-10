import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCircle2, Info, AlertTriangle, BellOff } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { EmptyState } from "../common/EmptyState";
import * as notificationsApi from "../../api/notifications.api";
import type { AppNotification } from "../../types";

const ICONS = {
  info: <Info size={14} className="text-sky-500" />,
  success: <CheckCircle2 size={14} className="text-forest-500" />,
  warning: <AlertTriangle size={14} className="text-amber-500" />,
};

const POLL_MS = 60_000;

function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function NotificationBell() {
  const notificationsEnabled = useAppStore((s) => s.user.notificationsEnabled);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<AppNotification[] | null>(null);

  const refreshCount = useCallback(() => {
    notificationsApi
      .unreadCount()
      .then(setUnread)
      .catch(() => {
        // The badge is best-effort; a failed poll just keeps the last count.
      });
  }, []);

  useEffect(() => {
    refreshCount();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") refreshCount();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [refreshCount]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (!next) return;
    try {
      setItems(await notificationsApi.listNotifications());
    } catch {
      setItems([]);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setItems((prev) => prev?.map((n) => ({ ...n, read: true })) ?? null);
      setUnread(0);
    } catch {
      useAppStore.getState().pushToast("Couldn't mark notifications as read.", "error");
    }
  };

  const markRead = async (n: AppNotification) => {
    if (n.read) return;
    setItems((prev) => prev?.map((x) => (x.id === n.id ? { ...x, read: true } : x)) ?? null);
    setUnread((c) => Math.max(0, c - 1));
    notificationsApi.markRead(n.id).catch(refreshCount);
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-white/8 border border-ink/8 dark:border-white/10 text-ink-soft hover:text-ink dark:hover:text-white shadow-soft transition"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-coral-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 z-50 w-80 max-w-[85vw] bg-white dark:bg-[#1c2024] border border-ink/10 dark:border-white/10 rounded-2xl shadow-soft-lg overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-ink/8 dark:border-white/10 flex items-center justify-between">
                <p className="text-sm font-semibold">Notifications</p>
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-semibold text-forest-600 dark:text-forest-400"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {items === null ? (
                  <p className="p-4 text-xs text-ink-soft">Loading…</p>
                ) : items.length === 0 ? (
                  <div className="p-3">
                    <EmptyState
                      compact
                      icon={notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                      title={notificationsEnabled ? "You're all caught up" : "Notifications are off"}
                      description={
                        notificationsEnabled
                          ? "Trip invites, bookings and finished stories show up here."
                          : "Turn notifications back on in Settings."
                      }
                    />
                  </div>
                ) : (
                  items.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n)}
                      className={`w-full text-left flex items-start gap-2.5 px-4 py-3 border-b border-ink/6 dark:border-white/5 last:border-0 ${n.read ? "" : "bg-forest-500/5"}`}
                    >
                      <span className="mt-0.5 shrink-0">{ICONS[n.type] ?? ICONS.info}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs text-ink-soft dark:text-white/70 leading-relaxed">
                          {n.message}
                        </span>
                        <span className="block text-[10px] text-ink-soft/70 dark:text-white/40 mt-0.5">
                          {timeAgo(n.createdAt)}
                        </span>
                      </span>
                      {!n.read && (
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-coral-500 shrink-0" aria-label="Unread" />
                      )}
                    </button>
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
