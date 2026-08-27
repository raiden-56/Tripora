import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Globe2, MapPin, Plus } from "lucide-react";
import clsx from "clsx";
import { TravelMap } from "../components/map/TravelMap";
import { IndiaStatesPanel } from "../components/map/IndiaStatesPanel";
import { FilterBar } from "../components/filters/FilterBar";
import { useAppStore } from "../store/useAppStore";

export default function ExploreMap() {
  const destinations = useAppStore((s) => s.destinations);
  const memories = useAppStore((s) => s.memories);
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const mapFilters = useAppStore((s) => s.mapFilters);
  const setMapFilters = useAppStore((s) => s.setMapFilters);
  const selectDestination = useAppStore((s) => s.selectDestination);
  const selectedDestinationId = useAppStore((s) => s.selectedDestinationId);
  const openAddDestination = useAppStore((s) => s.openAddDestination);
  const [searchParams] = useSearchParams();
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const dest = searchParams.get("dest");
    if (dest) selectDestination(dest);
  }, [searchParams, selectDestination]);

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
    if (viewMode === "india") list = list.filter((d) => d.country === "India");
    if (mapFilters.status === "favorites")
      list = list.filter((d) => d.isFavorite);
    else if (mapFilters.status !== "all")
      list = list.filter((d) => d.status === mapFilters.status);
    return list;
  }, [destinations, viewMode, mapFilters]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <TravelMap
        destinations={filtered}
        viewMode={viewMode}
        selectedId={selectedDestinationId}
        memoryCounts={memoryCounts}
        onSelect={(id) => selectDestination(id)}
      />

      <div className="absolute top-4 left-4 right-4 md:left-5 md:right-5 flex flex-col gap-3 z-[400] pointer-events-none">
        <div className="flex items-center gap-3 flex-wrap pointer-events-auto">
          <div className="flex bg-white dark:bg-[#1c2024] rounded-full p-1 shadow-soft-lg border border-ink/8 dark:border-white/10">
            <button
              onClick={() => setViewMode("world")}
              className={clsx(
                "px-4 py-1.5 rounded-full text-sm font-semibold transition flex items-center gap-1.5",
                viewMode === "world"
                  ? "bg-ink text-white dark:bg-white dark:text-ink"
                  : "text-ink-soft",
              )}
            >
              <Globe2 size={14} /> World
            </button>
            <button
              onClick={() => {
                setViewMode("india");
                setPanelOpen(true);
              }}
              className={clsx(
                "px-4 py-1.5 rounded-full text-sm font-semibold transition flex items-center gap-1.5",
                viewMode === "india"
                  ? "bg-ink text-white dark:bg-white dark:text-ink"
                  : "text-ink-soft",
              )}
            >
              <MapPin size={14} /> India
            </button>
          </div>
          <button
            onClick={() => openAddDestination()}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest-500 text-white text-sm font-semibold shadow-soft-lg hover:bg-forest-600 transition"
          >
            <Plus size={15} /> Add Destination
          </button>
        </div>
        <div className="bg-white/90 dark:bg-[#1c2024]/90 backdrop-blur rounded-full px-2 py-2 shadow-soft-lg border border-ink/8 dark:border-white/10 pointer-events-auto w-fit max-w-full">
          <FilterBar
            value={mapFilters.status}
            onChange={(status) => setMapFilters({ status })}
          />
        </div>
      </div>

      {viewMode === "india" && (
        <>
          <div className="hidden md:block absolute top-4 right-4 bottom-4 w-80 bg-white dark:bg-[#1c2024] rounded-3xl shadow-soft-lg border border-ink/8 dark:border-white/10 z-[400] overflow-hidden">
            <IndiaStatesPanel
              destinations={destinations}
              onSelectDestination={selectDestination}
            />
          </div>
          <button
            onClick={() => setPanelOpen(true)}
            className="md:hidden absolute bottom-24 right-4 z-[400] px-4 py-2.5 rounded-full bg-white dark:bg-[#1c2024] shadow-soft-lg border border-ink/10 dark:border-white/10 text-sm font-semibold"
          >
            States
          </button>
          {panelOpen && (
            <div
              className="md:hidden fixed inset-0 z-[900] bg-ink/40 backdrop-blur-sm flex items-end"
              onClick={() => setPanelOpen(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full h-[70vh] bg-white dark:bg-[#1c2024] rounded-t-3xl overflow-hidden"
              >
                <IndiaStatesPanel
                  destinations={destinations}
                  onSelectDestination={(id) => {
                    selectDestination(id);
                    setPanelOpen(false);
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
