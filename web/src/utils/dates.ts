/** Date helpers that work on calendar dates ("YYYY-MM-DD") in the user's local time zone.
 * `toISOString()` is UTC, which is a day off for part of every day in India. */

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return toIsoDate(new Date(y, m - 1, d + days));
}

/** Whole days from today until the given date (negative once it's past). */
export function daysUntil(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const [ty, tm, td] = todayIso().split("-").map(Number);
  return Math.round((target - new Date(ty, tm - 1, td).getTime()) / 86_400_000);
}

const fmt = (iso: string, withYear: boolean) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });
};

/** "3 Dec – 6 Dec 2026", or a single date when start and end match. */
export function formatDateRange(start: string, end: string): string {
  if (!end || start === end) return fmt(start, true);
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  return `${fmt(start, !sameYear)} – ${fmt(end, true)}`;
}

/** A calendar date for display ("05 Mar 2026"); date-only strings are read as local
 * midnight so the shown day never shifts with the time zone. */
export function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}
