import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Camera, MapPin, X } from "lucide-react";
import { TravelMap } from "../components/map/TravelMap";
import { SectionHeading } from "./shared/SectionHeading";
import { destinations, memories } from "../data/mockData";
import type { DestinationStatus } from "../types";

const FILTERS: { label: string; value: DestinationStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Visited", value: "visited" },
  { label: "Planned", value: "planned" },
  { label: "Wishlist", value: "wishlist" },
];

export function InteractiveMapShowcase({
  onStartJourney,
}: {
  onStartJourney: () => void;
}) {
  const [filter, setFilter] = useState<DestinationStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? destinations
        : destinations.filter((d) => d.status === filter),
    [filter],
  );

  const memoryCounts = useMemo(
    () =>
      memories.reduce<Record<string, number>>((acc, m) => {
        acc[m.destinationId] = (acc[m.destinationId] ?? 0) + 1;
        return acc;
      }, {}),
    [],
  );

  const selected = destinations.find((d) => d.id === selectedId) ?? null;

  return (
    <section
      id="discover"
      className="py-24 md:py-32 px-6 md:px-10 max-w-7xl mx-auto"
    >
      <SectionHeading
        eyebrow="Live product demo"
        title="See your journey come alive."
      />

      <div className="flex items-center justify-center gap-2 mt-8 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
              filter === f.value
                ? "bg-ink text-white dark:bg-white dark:text-ink border-ink dark:border-white"
                : "border-ink/12 dark:border-white/15 text-ink-soft dark:text-white/60 hover:border-ink/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="relative h-[440px] md:h-[560px] rounded-[2rem] overflow-hidden border border-ink/8 dark:border-white/10 shadow-soft-lg"
      >
        <TravelMap
          destinations={filtered}
          viewMode="world"
          selectedId={selectedId}
          memoryCounts={memoryCounts}
          onSelect={setSelectedId}
        />

        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 z-[500] bg-white dark:bg-[#1c2024] rounded-2xl shadow-soft-lg border border-ink/10 dark:border-white/10 p-4"
          >
            <button
              onClick={() => setSelectedId(null)}
              className="absolute top-3 right-3 text-ink-soft hover:text-ink dark:hover:text-white"
            >
              <X size={15} />
            </button>
            <p className="font-display text-xl uppercase tracking-tight">
              {selected.name}
            </p>
            <p className="text-xs text-ink-soft dark:text-white/50 mb-3 flex items-center gap-1">
              <MapPin size={11} />{" "}
              {[selected.state, selected.country].filter(Boolean).join(", ")}
            </p>
            <div className="flex items-center gap-4 text-xs text-ink-soft dark:text-white/50 mb-4">
              {selected.visitedFrom && selected.visitedTo && (
                <span>
                  {Math.max(
                    1,
                    Math.round(
                      (new Date(selected.visitedTo).getTime() -
                        new Date(selected.visitedFrom).getTime()) /
                        86400000,
                    ) + 1,
                  )}{" "}
                  days
                </span>
              )}
              <span className="flex items-center gap-1">
                <Camera size={11} /> {memoryCounts[selected.id] ?? 0} memories
              </span>
              <span>{selected.places.length} places</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onStartJourney}
                className="flex-1 py-2 rounded-full bg-forest-500 text-white text-xs font-semibold hover:bg-forest-600"
              >
                View Journey
              </button>
              <button
                onClick={() => setFilter("all")}
                className="flex-1 py-2 rounded-full border border-ink/15 dark:border-white/20 text-xs font-semibold hover:bg-ink/5 dark:hover:bg-white/5"
              >
                Open Map
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
