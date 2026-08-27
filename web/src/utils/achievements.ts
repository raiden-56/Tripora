import type { Achievement, Destination, Memory, Trip } from "../types";

/**
 * Computes real, per-user achievement progress from actual data instead of
 * hardcoded placeholder numbers. Every `progress` value here is derived
 * directly from the user's destinations/trips/memories.
 */
export function computeAchievements(
  destinations: Destination[],
  trips: Trip[],
  memories: Memory[],
): Achievement[] {
  const visited = destinations.filter((d) => d.status === "visited");
  const countries = new Set(visited.map((d) => d.country)).size;
  const states = new Set(visited.map((d) => d.state).filter(Boolean)).size;
  const completedTrips = trips.filter((t) => t.status === "visited").length;

  const defs: Array<Omit<Achievement, "unlocked">> = [
    {
      id: "a1",
      title: "First Destination",
      description: "Add your first destination",
      icon: "trophy",
      progress: destinations.length,
      target: 1,
    },
    {
      id: "a2",
      title: "5 Destinations",
      description: "Add 5 destinations",
      icon: "trophy",
      progress: destinations.length,
      target: 5,
    },
    {
      id: "a3",
      title: "10 Destinations",
      description: "Add 10 destinations",
      icon: "trophy",
      progress: destinations.length,
      target: 10,
    },
    {
      id: "a4",
      title: "25 Destinations",
      description: "Add 25 destinations",
      icon: "map",
      progress: destinations.length,
      target: 25,
    },
    {
      id: "a5",
      title: "Explorer",
      description: "Visit 5 different countries",
      icon: "globe",
      progress: countries,
      target: 5,
    },
    {
      id: "a6",
      title: "5 States",
      description: "Visit 5 different states",
      icon: "flag",
      progress: states,
      target: 5,
    },
    {
      id: "a7",
      title: "10 States",
      description: "Visit 10 different states",
      icon: "flag",
      progress: states,
      target: 10,
    },
    {
      id: "a8",
      title: "Memory Keeper",
      description: "Save 25 memories",
      icon: "camera",
      progress: memories.length,
      target: 25,
    },
    {
      id: "a9",
      title: "100 Memories",
      description: "Save 100 memories",
      icon: "camera",
      progress: memories.length,
      target: 100,
    },
    {
      id: "a10",
      title: "Wanderer",
      description: "Complete 10 trips",
      icon: "flame",
      progress: completedTrips,
      target: 10,
    },
  ];

  return defs.map((d) => ({ ...d, unlocked: d.progress >= d.target }));
}
