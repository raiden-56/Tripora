import type { Destination, Memory, Trip } from "../types";

export function computeStats(
  destinations: Destination[],
  trips: Trip[],
  memories: Memory[],
) {
  const visited = destinations.filter((d) => d.status === "visited");
  const countries = new Set(visited.map((d) => d.country));
  const states = new Set(visited.filter((d) => d.state).map((d) => d.state));
  const cities = new Set(visited.filter((d) => d.city).map((d) => d.city));
  const upcomingTrips = trips.filter((t) => t.status === "planned");
  const completedTrips = trips.filter((t) => t.status === "visited");

  const travelDays = visited.reduce((sum, d) => {
    if (!d.visitedFrom || !d.visitedTo) return sum + 1;
    const days =
      Math.round(
        (new Date(d.visitedTo).getTime() - new Date(d.visitedFrom).getTime()) /
          86400000,
      ) + 1;
    return sum + Math.max(1, days);
  }, 0);

  return {
    countries: countries.size,
    states: states.size,
    cities: cities.size,
    destinations: destinations.length,
    tripsCompleted: completedTrips.length,
    memories: memories.length,
    upcomingTrips: upcomingTrips.length,
    travelDays,
  };
}

export function groupByYear(destinations: Destination[]) {
  const map = new Map<string, number>();
  destinations
    .filter((d) => d.visitedFrom)
    .forEach((d) => {
      const year = new Date(d.visitedFrom!).getFullYear().toString();
      map.set(year, (map.get(year) ?? 0) + 1);
    });
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, value]) => ({ label, value }));
}
