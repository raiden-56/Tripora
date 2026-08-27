import type { Achievement, AppNotification, Destination, Trip } from "../types";

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

/** Derives useful, non-intrusive notifications from the user's actual travel data. */
export function buildNotifications(
  destinations: Destination[],
  trips: Trip[],
  achievements: Achievement[],
): AppNotification[] {
  const notifications: AppNotification[] = [];

  trips
    .filter((t) => t.status === "planned")
    .forEach((t) => {
      const days = daysUntil(t.startDate);
      if (days >= 0 && days <= 14) {
        notifications.push({
          id: `n-trip-${t.id}`,
          message: `Your ${t.title} trip is ${days === 0 ? "today" : `${days} day${days === 1 ? "" : "s"} away`}.`,
          type: "info",
          createdAt: new Date().toISOString(),
          read: false,
        });
      }
    });

  achievements
    .filter((a) => !a.unlocked && a.progress / a.target >= 0.8)
    .forEach((a) => {
      const remaining = Math.max(0, a.target - a.progress);
      notifications.push({
        id: `n-ach-${a.id}`,
        message: `You're ${remaining} away from unlocking "${a.title}".`,
        type: "success",
        createdAt: new Date().toISOString(),
        read: false,
      });
    });

  const recentlyVisitedWithoutMemories = destinations.find(
    (d) =>
      d.status === "visited" &&
      d.places.length > 0 &&
      d.driveFolder === undefined,
  );
  if (recentlyVisitedWithoutMemories) {
    notifications.push({
      id: `n-mem-${recentlyVisitedWithoutMemories.id}`,
      message: `You haven't added memories from your ${recentlyVisitedWithoutMemories.name} trip yet.`,
      type: "warning",
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  const wishlistCount = destinations.filter(
    (d) => d.status === "wishlist",
  ).length;
  if (wishlistCount > 0) {
    notifications.push({
      id: "n-wishlist",
      message: `${wishlistCount} destinations match your travel interests — check Discover.`,
      type: "info",
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  return notifications;
}
