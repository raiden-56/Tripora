import type { Destination } from "../types";

const NEARBY_SUGGESTIONS: Record<string, string[]> = {
  Coorg: ["Gokarna", "Chikmagalur", "Wayanad"],
  Hampi: ["Badami", "Gokarna", "Hospet"],
  Goa: ["Gokarna", "Amboli", "Tarkarli"],
  Munnar: ["Wayanad", "Thekkady", "Vagamon"],
};

function unvisited(destinations: Destination[]) {
  return destinations.filter((d) => d.status !== "visited");
}

function visitedNames(destinations: Destination[]) {
  return destinations.filter((d) => d.status === "visited").map((d) => d.name);
}

/** Rule-based mock assistant — architecture is API-ready for swapping in a real LLM later. */
export function generateAssistantReply(
  query: string,
  destinations: Destination[],
): string {
  const q = query.toLowerCase();
  const visited = visitedNames(destinations);

  if (/road ?trip/.test(q)) {
    const road = destinations.filter(
      (d) =>
        ["Karnataka", "Kerala", "Tamil Nadu", "Maharashtra"].includes(
          d.state ?? "",
        ) && d.status !== "visited",
    );
    return road.length
      ? `For a scenic road trip, consider ${road
          .slice(0, 3)
          .map((d) => d.name)
          .join(
            ", ",
          )} — all reachable by a multi-day drive through South India.`
      : "You've covered most nearby road trip spots! Consider a longer Himalayan road trip through Manali or Spiti Valley.";
  }

  if (/near|close to|around/.test(q) && /bangalore|bengaluru/.test(q)) {
    const near = destinations.filter(
      (d) =>
        Math.abs(d.latitude - 12.9716) < 4 &&
        Math.abs(d.longitude - 77.5946) < 4 &&
        d.status !== "visited",
    );
    return near.length
      ? `Near Bangalore, you might enjoy ${near.map((d) => d.name).join(", ")}.`
      : "You seem to have explored most spots close to Bangalore already — time for a longer trip!";
  }

  if (/not visited|haven't visited|new states|which states/.test(q)) {
    const wishlist = destinations.filter(
      (d) => d.status === "wishlist" && d.country === "India",
    );
    return wishlist.length
      ? `You haven't visited ${wishlist
          .slice(0, 5)
          .map((d) => d.state ?? d.name)
          .join(", ")} yet — great candidates for your next India trip.`
      : "You've made great progress across India! Consider revisiting a favorite state for hidden gems.";
  }

  if (/similar|like my favorite|favourites?/.test(q)) {
    for (const [place, suggestions] of Object.entries(NEARBY_SUGGESTIONS)) {
      if (visited.includes(place)) {
        return `Since you loved ${place}, you might also enjoy ${suggestions.join(", ")} — similar landscapes and vibe.`;
      }
    }
    return "Add a few visited destinations first, and I can recommend similar places you might love.";
  }

  if (/where should i go|suggest|recommend/.test(q) && !/road ?trip/.test(q)) {
    const candidates = unvisited(destinations).filter(
      (d) => d.priority === "high" || d.isFavorite,
    );
    const picks = candidates.length ? candidates : unvisited(destinations);
    return picks.length
      ? `Based on your travel history in ${visited.slice(0, 2).join(" and ") || "India"}, you might love ${picks
          .slice(0, 3)
          .map((d) => d.name)
          .join(", ")} next.`
      : "Add a few destinations to your map, and I can start recommending your next trip!";
  }

  const budgetMatch = q.match(/₹?\s?(\d{3,6})/);
  const daysMatch = q.match(/(\d+)\s*day/);
  if (budgetMatch || daysMatch) {
    const days = daysMatch ? daysMatch[1] : "3";
    const budget = budgetMatch
      ? `₹${Number(budgetMatch[1]).toLocaleString("en-IN")}`
      : "₹15,000";
    const pick = unvisited(destinations)[0]?.name ?? "Coorg";
    return `With ${days} days and a budget around ${budget}, I'd suggest ${pick} — it fits comfortably within that budget and duration. Want a full day-by-day itinerary? Try the "Create Trip with AI" tab.`;
  }

  if (/itinerary|plan a trip|create a trip/.test(q)) {
    return 'I can put together a full day-by-day itinerary — head to the "Create Trip with AI" tab and tell me your destination, days, and budget.';
  }

  return 'I\'m still learning, but based on your travel history I can recommend destinations, plan itineraries, and suggest road trips. Try asking me "Where should I go next?" or "Suggest a road trip."';
}

export interface ItineraryDay {
  day: number;
  title: string;
  places: string[];
  activities: string[];
  food: string[];
}

export interface GeneratedItinerary {
  days: ItineraryDay[];
  estimatedBudget: string;
  distanceKm: number;
  route: string;
}

const ACTIVITY_POOL = [
  "Sunrise viewpoint hike",
  "Local market walk",
  "Waterfall visit",
  "Heritage site tour",
  "Coffee estate walk",
  "Lakeside relaxation",
  "Photography session",
  "Local cuisine tasting",
];
const FOOD_POOL = [
  "Local breakfast at a roadside cafe",
  "Regional thali for lunch",
  "Street food trail",
  "Rooftop dinner with a view",
];

export function generateItinerary(params: {
  from: string;
  to: string;
  days: number;
  budget: number;
  style: string;
  destination?: Destination;
}): GeneratedItinerary {
  const places = params.destination?.places.map((p) => p.name) ?? [
    "City center",
    "Local viewpoint",
    "Heritage site",
  ];
  const days: ItineraryDay[] = Array.from({
    length: Math.max(1, params.days),
  }).map((_, i) => ({
    day: i + 1,
    title:
      i === 0
        ? `Arrival in ${params.to}`
        : i === params.days - 1
          ? `Last day & return to ${params.from}`
          : `Exploring ${params.to}`,
    places: [places[i % places.length], places[(i + 1) % places.length]].filter(
      (v, idx, arr) => arr.indexOf(v) === idx,
    ),
    activities: [
      ACTIVITY_POOL[i % ACTIVITY_POOL.length],
      ACTIVITY_POOL[(i + 3) % ACTIVITY_POOL.length],
    ],
    food: [FOOD_POOL[i % FOOD_POOL.length]],
  }));

  const distanceKm = params.destination
    ? Math.round(Math.random() * 40 + 220)
    : 260;

  return {
    days,
    estimatedBudget: `₹${Math.round(params.budget * 0.92).toLocaleString("en-IN")} – ₹${params.budget.toLocaleString("en-IN")}`,
    distanceKm,
    route: `${params.from} → ${params.to} via NH highway`,
  };
}

export const SUGGESTED_PROMPTS = [
  "Where should I go next?",
  "I have 3 days and ₹10,000.",
  "Suggest places near Bangalore.",
  "What destinations have I not visited?",
  "Suggest a road trip.",
  "Give me destinations similar to my favorite places.",
];
