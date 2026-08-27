import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, MapPin } from "lucide-react";
import { INDIA_STATES } from "../../data/indiaStates";
import type { Destination } from "../../types";
import { StatusBadge } from "../common/StatusBadge";

export function IndiaStatesPanel({
  destinations,
  onSelectDestination,
}: {
  destinations: Destination[];
  onSelectDestination: (id: string) => void;
}) {
  const [activeState, setActiveState] = useState<string | null>(null);

  const byState = useMemo(() => {
    const map = new Map<string, Destination[]>();
    destinations
      .filter((d) => d.country === "India" && d.state)
      .forEach((d) => {
        const list = map.get(d.state!) ?? [];
        list.push(d);
        map.set(d.state!, list);
      });
    return map;
  }, [destinations]);

  const exploredCount = useMemo(
    () =>
      INDIA_STATES.filter((s) =>
        (byState.get(s.name) ?? []).some((d) => d.status === "visited"),
      ).length,
    [byState],
  );

  const activeDestinations = activeState
    ? (byState.get(activeState) ?? [])
    : [];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-ink/8 dark:border-white/10">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-semibold">India Exploration</p>
          <p className="text-xs text-ink-soft dark:text-white/50">
            {exploredCount} / {INDIA_STATES.length} States
          </p>
        </div>
        <div className="h-2 rounded-full bg-ink/8 dark:bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(exploredCount / INDIA_STATES.length) * 100}%`,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-forest-400 to-forest-600 rounded-full"
          />
        </div>
      </div>

      {activeState ? (
        <div className="flex-1 overflow-y-auto p-4">
          <button
            onClick={() => setActiveState(null)}
            className="text-xs text-ink-soft hover:text-ink dark:hover:text-white mb-3"
          >
            &larr; All states
          </button>
          <h3 className="font-display text-lg mb-1">{activeState}</h3>
          <p className="text-xs text-ink-soft dark:text-white/50 mb-4">
            {activeDestinations.length} destinations &middot;{" "}
            {activeDestinations.filter((d) => d.status === "visited").length}{" "}
            visited
          </p>
          <div className="flex flex-col gap-2">
            {activeDestinations.map((d) => (
              <button
                key={d.id}
                onClick={() => onSelectDestination(d.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-ink/8 dark:border-white/10 hover:border-forest-400 text-left transition"
              >
                <MapPin size={14} className="text-forest-500 shrink-0" />
                <span className="flex-1 text-sm font-medium truncate">
                  {d.name}
                </span>
                <StatusBadge status={d.status} />
              </button>
            ))}
            {activeDestinations.length === 0 && (
              <p className="text-sm text-ink-soft">
                No destinations yet in this state.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-2 content-start">
          {INDIA_STATES.map((s) => {
            const list = byState.get(s.name) ?? [];
            const explored = list.some((d) => d.status === "visited");
            return (
              <button
                key={s.name}
                onClick={() => setActiveState(s.name)}
                className={`flex items-center justify-between gap-1 px-3 py-2 rounded-xl text-xs font-medium border transition text-left ${
                  explored
                    ? "bg-forest-50 border-forest-100 text-forest-600 dark:bg-forest-500/15 dark:border-forest-500/20 dark:text-forest-400"
                    : "bg-ink/[0.02] border-ink/8 text-ink-soft dark:bg-white/5 dark:border-white/10 dark:text-white/50"
                }`}
              >
                <span className="truncate">{s.name}</span>
                {list.length > 0 && (
                  <ChevronRight size={13} className="shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
