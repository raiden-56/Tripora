import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { FilterBar } from "../components/filters/FilterBar";
import { DestinationCard } from "../components/destinations/DestinationCard";
import { EmptyState } from "../components/common/EmptyState";
import { useAppStore } from "../store/useAppStore";
import { MapPin, Plus } from "lucide-react";

export default function Destinations() {
  const destinations = useAppStore((s) => s.destinations);
  const memories = useAppStore((s) => s.memories);
  const mapFilters = useAppStore((s) => s.mapFilters);
  const setMapFilters = useAppStore((s) => s.setMapFilters);
  const selectDestination = useAppStore((s) => s.selectDestination);
  const openAddDestination = useAppStore((s) => s.openAddDestination);
  const [query, setQuery] = useState("");

  const memoryCounts = useMemo(
    () =>
      memories.reduce<Record<string, number>>((acc, m) => {
        acc[m.destinationId] = (acc[m.destinationId] ?? 0) + 1;
        return acc;
      }, {}),
    [memories],
  );

  const filtered = useMemo(() => {
    let list = destinations;
    if (mapFilters.status === "favorites")
      list = list.filter((d) => d.isFavorite);
    else if (mapFilters.status !== "all")
      list = list.filter((d) => d.status === mapFilters.status);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((d) =>
        [d.name, d.state, d.country, d.city]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q)),
      );
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [destinations, mapFilters, query]);

  return (
    <div>
      <TopBar
        title="Destinations"
        subtitle={`${destinations.length} places across your journey`}
      />
      <div className="px-5 md:px-8 pb-10">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations…"
              className="w-full pl-9 pr-4 py-2.5 rounded-full border border-ink/12 dark:border-white/15 bg-white dark:bg-white/5 text-sm outline-none focus:border-forest-400"
            />
          </div>
          <button
            onClick={() => openAddDestination()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition shrink-0"
          >
            <Plus size={15} /> Add Destination
          </button>
        </div>
        <div className="mb-6">
          <FilterBar
            value={mapFilters.status}
            onChange={(status) => setMapFilters({ status })}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<MapPin size={22} />}
            title="No destinations yet"
            description="Start your journey by adding your first destination."
            actionLabel="Add First Destination"
            onAction={() => openAddDestination()}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((d) => (
              <DestinationCard
                key={d.id}
                destination={d}
                memoryCount={memoryCounts[d.id] ?? 0}
                onClick={() => selectDestination(d.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
