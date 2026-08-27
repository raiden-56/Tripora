import { useMemo, useState } from "react";
import { Images, Plus, Search } from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { MemoryCard } from "../components/memories/MemoryCard";
import { MemoryViewer } from "../components/memories/MemoryViewer";
import { AddMemoryModal } from "../components/memories/AddMemoryModal";
import { EmptyState } from "../components/common/EmptyState";
import { useAppStore } from "../store/useAppStore";

type Filter = "all" | "india" | "international";

export default function Memories() {
  const memories = useAppStore((s) => s.memories);
  const destinations = useAppStore((s) => s.destinations);
  const deleteMemory = useAppStore((s) => s.deleteMemory);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const destById = useMemo(
    () => Object.fromEntries(destinations.map((d) => [d.id, d])),
    [destinations],
  );

  const filtered = useMemo(() => {
    let list = [...memories].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    if (filter !== "all") {
      list = list.filter((m) => {
        const dest = destById[m.destinationId];
        return filter === "india"
          ? dest?.country === "India"
          : dest?.country !== "India";
      });
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((m) =>
        [m.title, ...m.tags, destById[m.destinationId]?.name ?? ""].some((v) =>
          v.toLowerCase().includes(q),
        ),
      );
    }
    return list;
  }, [memories, filter, query, destById]);

  return (
    <div>
      <TopBar
        title="Memories"
        subtitle={`${memories.length} moments captured across your journeys`}
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
              placeholder="Search memories…"
              className="w-full pl-9 pr-4 py-2.5 rounded-full border border-ink/12 dark:border-white/15 bg-white dark:bg-white/5 text-sm outline-none focus:border-forest-400"
            />
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition shrink-0"
          >
            <Plus size={15} /> Add Memory
          </button>
        </div>

        <div className="flex gap-1.5 mb-6">
          {(["all", "india", "international"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition capitalize ${
                filter === f
                  ? "bg-ink text-white border-ink dark:bg-white dark:text-ink"
                  : "bg-white dark:bg-white/8 text-ink-soft border-ink/10 dark:border-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Images size={22} />}
            title="No memories here yet"
            description="Add Memory to start building your travel archive."
            actionLabel="Add Memory"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
            {filtered.map((m, i) => (
              <MemoryCard
                key={m.id}
                memory={m}
                index={i}
                onClick={() => setViewerIndex(i)}
              />
            ))}
          </div>
        )}
      </div>

      {viewerIndex !== null && (
        <MemoryViewer
          memories={filtered}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onIndexChange={setViewerIndex}
          onDelete={deleteMemory}
          destinationName={(id) => destById[id]?.name ?? ""}
        />
      )}
      <AddMemoryModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
