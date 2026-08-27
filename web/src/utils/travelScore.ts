import type { Destination } from "../types";

export interface TravelScoreCategory {
  label: string;
  percent: number;
}

const MOUNTAIN_STATES = [
  "Himachal Pradesh",
  "Uttarakhand",
  "Sikkim",
  "Ladakh",
  "Meghalaya",
];
const BEACH_STATES = ["Goa", "Kerala", "Andaman and Nicobar Islands"];
const CULTURE_STATES = ["Rajasthan", "Tamil Nadu", "Karnataka"];

function clampPercent(value: number) {
  return Math.max(8, Math.min(98, Math.round(value)));
}

/** Derives a lightweight "travel personality" score from the user's destinations — deterministic, no external AI call. */
export function computeTravelScore(
  destinations: Destination[],
): TravelScoreCategory[] {
  const visited = destinations.filter((d) => d.status === "visited");
  const wishlist = destinations.filter(
    (d) => d.status === "wishlist" || d.status === "planned",
  );
  const total = Math.max(1, destinations.length);

  const adventure =
    visited.filter((d) => d.places.length >= 2).length +
    wishlist.filter((d) => d.priority === "high").length;
  const nature = visited.filter(
    (d) =>
      MOUNTAIN_STATES.includes(d.state ?? "") ||
      d.description?.toLowerCase().includes("waterfall") ||
      d.description?.toLowerCase().includes("nature"),
  ).length;
  const roadTrip = visited.filter((d) =>
    ["Karnataka", "Kerala", "Tamil Nadu", "Maharashtra"].includes(
      d.state ?? "",
    ),
  ).length;
  const culture = visited.filter(
    (d) =>
      CULTURE_STATES.includes(d.state ?? "") ||
      d.places.some((p) => /temple|fort|palace|heritage/i.test(p.name)),
  ).length;
  const beach = visited.filter((d) =>
    BEACH_STATES.includes(d.state ?? ""),
  ).length;

  return [
    {
      label: "Adventure Explorer",
      percent: clampPercent((adventure / total) * 240),
    },
    { label: "Nature Lover", percent: clampPercent((nature / total) * 260) },
    { label: "Road Tripper", percent: clampPercent((roadTrip / total) * 220) },
    {
      label: "Culture Explorer",
      percent: clampPercent((culture / total) * 200),
    },
    { label: "Beach Bum", percent: clampPercent((beach / total) * 260) },
  ].sort((a, b) => b.percent - a.percent);
}
