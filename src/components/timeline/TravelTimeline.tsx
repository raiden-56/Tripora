import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { Destination } from "../../types";

interface TimelineGroup {
  year: string;
  items: Destination[];
}

export function TravelTimeline({
  destinations,
}: {
  destinations: Destination[];
}) {
  const visited = destinations
    .filter((d) => d.visitedFrom)
    .sort(
      (a, b) =>
        new Date(b.visitedFrom!).getTime() - new Date(a.visitedFrom!).getTime(),
    );

  const groups: TimelineGroup[] = [];
  visited.forEach((d) => {
    const year = new Date(d.visitedFrom!).getFullYear().toString();
    let group = groups.find((g) => g.year === year);
    if (!group) {
      group = { year, items: [] };
      groups.push(group);
    }
    group.items.push(d);
  });

  return (
    <div className="relative pl-6">
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-ink/10 dark:bg-white/10" />
      {groups.map((group) => (
        <div key={group.year} className="mb-8">
          <h3 className="font-display text-2xl mb-4 -ml-6 pl-0">
            {group.year}
          </h3>
          <div className="flex flex-col gap-5">
            {group.items.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.05 }}
                className="relative"
              >
                <span className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-forest-500 border-2 border-paper dark:border-[#14171a]" />
                <div className="bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 rounded-2xl p-4 flex gap-3">
                  <img
                    src={d.heroImageUrl}
                    alt={d.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm flex items-center gap-1">
                      <MapPin size={12} className="text-forest-500" />
                      {d.name}
                    </p>
                    <p className="text-xs text-ink-soft dark:text-white/50 mt-0.5">
                      {new Date(d.visitedFrom!).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                      })}
                      {d.visitedTo &&
                        ` → ${new Date(d.visitedTo).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}`}
                    </p>
                    {d.description && (
                      <p className="text-xs text-ink-soft dark:text-white/60 mt-1 line-clamp-2">
                        {d.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
      {groups.length === 0 && (
        <p className="text-sm text-ink-soft">No visited destinations yet.</p>
      )}
    </div>
  );
}
