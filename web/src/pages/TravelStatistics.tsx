import { useMemo } from "react";
import {
  BarChart3,
  Camera,
  Flag,
  Landmark,
  MapPin,
  Plane,
  Route,
} from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { StatCard } from "../components/common/StatCard";
import { EmptyState } from "../components/common/EmptyState";
import { BarChart, HorizontalBarList } from "../components/stats/Charts";
import { useAppStore } from "../store/useAppStore";
import { computeStats, groupByYear } from "../utils/stats";

export default function TravelStatistics() {
  const destinations = useAppStore((s) => s.destinations);
  const trips = useAppStore((s) => s.trips);
  const memories = useAppStore((s) => s.memories);

  const stats = computeStats(destinations, trips, memories);
  const byYear = useMemo(() => groupByYear(destinations), [destinations]);

  const byCountry = useMemo(() => {
    const map = new Map<string, number>();
    destinations
      .filter((d) => d.status === "visited")
      .forEach((d) => map.set(d.country, (map.get(d.country) ?? 0) + 1));
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));
  }, [destinations]);

  const mostVisited = useMemo(() => {
    const counts = memories.reduce<Record<string, number>>((acc, m) => {
      acc[m.destinationId] = (acc[m.destinationId] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, value]) => ({
        label: destinations.find((d) => d.id === id)?.name ?? id,
        value,
      }));
  }, [memories, destinations]);

  return (
    <div>
      <TopBar
        title="Travel Statistics"
        subtitle="A closer look at everywhere you've explored."
      />
      <div className="px-5 md:px-8 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard
            label="Countries"
            value={stats.countries}
            icon={<Flag size={16} />}
          />
          <StatCard
            label="States"
            value={stats.states}
            icon={<Landmark size={16} />}
            delay={0.05}
          />
          <StatCard
            label="Destinations"
            value={stats.destinations}
            icon={<MapPin size={16} />}
            delay={0.1}
          />
          <StatCard
            label="Trips Completed"
            value={stats.tripsCompleted}
            icon={<Plane size={16} />}
            delay={0.15}
          />
          <StatCard
            label="Memories"
            value={stats.memories}
            icon={<Camera size={16} />}
            delay={0.2}
          />
          <StatCard
            label="Travel Days"
            value={stats.travelDays}
            icon={<Route size={16} />}
            delay={0.25}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft">
            <h3 className="font-display text-lg mb-4">
              Travel Activity by Year
            </h3>
            {byYear.length > 0 ? (
              <BarChart data={byYear} />
            ) : (
              <EmptyState
                compact
                icon={<BarChart3 size={18} />}
                title="No trip activity yet"
                description="No visited trips recorded yet."
              />
            )}
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft">
            <h3 className="font-display text-lg mb-4">Countries Explored</h3>
            {byCountry.length > 0 ? (
              <HorizontalBarList data={byCountry} />
            ) : (
              <EmptyState
                compact
                icon={<Flag size={18} />}
                title="No countries yet"
                description="No visited destinations recorded yet."
              />
            )}
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft md:col-span-2">
            <h3 className="font-display text-lg mb-4">
              Most Visited Locations (by memories)
            </h3>
            {mostVisited.length > 0 ? (
              <HorizontalBarList data={mostVisited} />
            ) : (
              <EmptyState
                compact
                icon={<Camera size={18} />}
                title="No memories yet"
                description="Add memories to see this chart."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
