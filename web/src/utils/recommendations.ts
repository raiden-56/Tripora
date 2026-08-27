import type { Destination } from "../types";

interface RecommendationReason {
  destination: Destination;
  reason: string;
  bestSeason: string;
  duration: string;
  budget: string;
}

const SEASON_BY_REGION: Record<string, string> = {
  Rajasthan: "Oct – Mar",
  Meghalaya: "Sep – Apr",
  Sikkim: "Mar – Jun, Oct – Dec",
  "Andaman and Nicobar Islands": "Nov – Apr",
  Maharashtra: "Jun – Sep (monsoon greens)",
  Ladakh: "May – Sep",
  "Himachal Pradesh": "Mar – Jun, Oct – Feb (snow)",
};

/** Recommends unvisited destinations based on states/countries already explored, favoring similar geography. */
export function getWhatsNext(
  destinations: Destination[],
  limit = 5,
): RecommendationReason[] {
  const visited = destinations.filter((d) => d.status === "visited");
  const visitedStates = new Set(visited.map((d) => d.state).filter(Boolean));
  const visitedCountries = new Set(visited.map((d) => d.country));
  const candidates = destinations.filter(
    (d) => d.status === "wishlist" || d.status === "planned",
  );

  const scored = candidates.map((d) => {
    let score = 0;
    let reason = `A fresh destination to add to your ${d.country === "India" ? "India" : "international"} journey.`;
    if (d.state && visitedStates.has(d.state)) {
      score += 2;
      reason = `You've already explored ${d.state} — more of it awaits.`;
    } else if (d.country === "India" && visitedCountries.has("India")) {
      score += 1;
      reason = `You've explored ${Array.from(visitedStates).slice(0, 3).join(", ")} — expand your India map.`;
    }
    if (d.isFavorite || d.priority === "high") score += 1;
    return { destination: d, score, reason };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ destination, reason }) => ({
      destination,
      reason,
      bestSeason:
        SEASON_BY_REGION[destination.state ?? destination.country] ??
        "Year-round",
      duration: destination.country === "India" ? "3–5 days" : "7–10 days",
      budget:
        destination.country === "India"
          ? "₹12,000 – ₹25,000"
          : "₹80,000 – ₹1,50,000",
    }));
}

interface SimilarGroup {
  loved: Destination;
  suggestions: Destination[];
}

/** Suggests destinations similar to a user's favorite, e.g. nearby/same-state unvisited spots. */
export function getBecauseYouLoved(
  destinations: Destination[],
): SimilarGroup[] {
  const loved = destinations.filter(
    (d) => d.isFavorite && d.status === "visited",
  );
  return loved
    .map((favorite) => {
      const suggestions = destinations
        .filter(
          (d) =>
            d.id !== favorite.id &&
            d.status !== "visited" &&
            (d.state === favorite.state || d.country === favorite.country),
        )
        .slice(0, 3);
      return { loved: favorite, suggestions };
    })
    .filter((group) => group.suggestions.length > 0);
}
