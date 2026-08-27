import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Edit3,
  ExternalLink,
  FolderOpen,
  MapPin,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { StatusBadge } from "../common/StatusBadge";
import { DriveFolderCard } from "../drive/DriveFolderCard";
import { EmptyState } from "../common/EmptyState";

type Tab = "overview" | "places" | "memories" | "notes" | "files";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "places", label: "Places" },
  { id: "memories", label: "Memories" },
  { id: "notes", label: "Notes" },
  { id: "files", label: "Files" },
];

export function DestinationDrawer() {
  const selectedId = useAppStore((s) => s.selectedDestinationId);
  const destinations = useAppStore((s) => s.destinations);
  const memories = useAppStore((s) => s.memories);
  const selectDestination = useAppStore((s) => s.selectDestination);
  const openAddDestination = useAppStore((s) => s.openAddDestination);
  const deleteDestination = useAppStore((s) => s.deleteDestination);
  const pushToast = useAppStore((s) => s.pushToast);
  const [tab, setTab] = useState<Tab>("overview");

  const destination = destinations.find((d) => d.id === selectedId);
  const destMemories = destination
    ? memories.filter((m) => m.destinationId === destination.id)
    : [];

  const close = () => {
    selectDestination(null);
    setTab("overview");
  };

  return (
    <AnimatePresence>
      {destination && (
        <motion.div
          className="fixed inset-0 z-[1050] bg-ink/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="absolute right-0 top-0 h-full w-full md:w-[480px] bg-white dark:bg-[#1c2024] shadow-soft-lg overflow-y-auto"
          >
            <div className="relative h-56 shrink-0">
              <img
                src={destination.heroImageUrl}
                alt={destination.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <button
                onClick={close}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <p className="text-xs uppercase tracking-wide opacity-80">
                  {destination.city}
                </p>
                <h2 className="font-display text-2xl">{destination.name}</h2>
                <p className="text-sm opacity-90 flex items-center gap-1">
                  <MapPin size={12} />
                  {[destination.state, destination.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>

            <div className="px-5 pt-4 flex items-center gap-2 flex-wrap">
              <StatusBadge status={destination.status} />
              {destination.visitedFrom && (
                <span className="flex items-center gap-1 text-xs text-ink-soft dark:text-white/50">
                  <Calendar size={12} />
                  {new Date(destination.visitedFrom).toLocaleDateString(
                    undefined,
                    { day: "2-digit", month: "short", year: "numeric" },
                  )}
                  {destination.visitedTo &&
                    ` — ${new Date(destination.visitedTo).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}`}
                </span>
              )}
              {destination.rating && (
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                  <Star size={12} className="fill-amber-500 text-amber-500" />{" "}
                  {destination.rating} / 5
                </span>
              )}
            </div>

            <div className="px-5 mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat value={destMemories.length} label="Memories" />
              <Stat value={destination.places.length} label="Places" />
              <Stat
                value={destination.driveFolder ? 1 : 0}
                label="Drive Folder"
              />
            </div>

            <div className="px-5 mt-4 flex gap-2 flex-wrap">
              {destination.googleMapsUrl && (
                <a
                  href={destination.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border border-ink/12 dark:border-white/15 hover:bg-ink/5 dark:hover:bg-white/5"
                >
                  <ExternalLink size={12} /> Open in Maps
                </a>
              )}
              {destination.driveFolder && (
                <a
                  href={destination.driveFolder.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border border-ink/12 dark:border-white/15 hover:bg-ink/5 dark:hover:bg-white/5"
                >
                  <FolderOpen size={12} /> Open Drive
                </a>
              )}
              <button
                onClick={() => openAddDestination(destination.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border border-ink/12 dark:border-white/15 hover:bg-ink/5 dark:hover:bg-white/5"
              >
                <Edit3 size={12} /> Edit
              </button>
              <button
                onClick={() => {
                  deleteDestination(destination.id);
                  pushToast("Destination deleted", "info");
                  close();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border border-coral-500/30 text-coral-500 hover:bg-coral-500/10"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>

            <div className="px-5 mt-5 flex gap-1 border-b border-ink/8 dark:border-white/10 overflow-x-auto no-scrollbar">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`shrink-0 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition ${
                    tab === t.id
                      ? "border-forest-500 text-forest-600 dark:text-forest-400"
                      : "border-transparent text-ink-soft dark:text-white/50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {tab === "overview" && (
                <p className="text-sm text-ink-soft dark:text-white/60 leading-relaxed">
                  {destination.description ?? "No description added yet."}
                </p>
              )}
              {tab === "places" && (
                <div className="flex flex-col gap-2">
                  {destination.places.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl border border-ink/8 dark:border-white/10"
                    >
                      <p className="text-sm font-semibold">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-ink-soft dark:text-white/50 mt-0.5">
                          {p.description}
                        </p>
                      )}
                    </div>
                  ))}
                  {destination.places.length === 0 && (
                    <EmptyState
                      icon={<Plus size={22} />}
                      title="No places yet"
                      description="Add memorable spots you visited here."
                    />
                  )}
                </div>
              )}
              {tab === "memories" && (
                <div className="grid grid-cols-2 gap-2.5">
                  {destMemories.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-xl overflow-hidden aspect-square relative group"
                    >
                      <img
                        src={m.imageUrl}
                        alt={m.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-[11px] text-white font-medium truncate">
                          {m.title}
                        </p>
                      </div>
                    </div>
                  ))}
                  {destMemories.length === 0 && (
                    <div className="col-span-2">
                      <EmptyState
                        icon={<Plus size={22} />}
                        title="No memories here yet"
                        description="Capture this trip's best moments."
                        actionLabel="Add Memory"
                        onAction={() => {}}
                      />
                    </div>
                  )}
                </div>
              )}
              {tab === "notes" && (
                <p className="text-sm text-ink-soft dark:text-white/60 leading-relaxed whitespace-pre-line">
                  {destination.notes || "No notes added yet."}
                </p>
              )}
              {tab === "files" && (
                <div className="flex flex-col gap-2.5">
                  {destination.driveFolder ? (
                    <DriveFolderCard folder={destination.driveFolder} />
                  ) : (
                    <EmptyState
                      icon={<FolderOpen size={22} />}
                      title="No Drive folder linked"
                      description="Connect a Google Drive folder to organize this destination's files."
                      actionLabel="Edit Destination"
                      onAction={() => openAddDestination(destination.id)}
                    />
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="py-2.5 rounded-xl bg-ink/[0.03] dark:bg-white/5">
      <p className="font-display text-lg">{value}</p>
      <p className="text-[11px] text-ink-soft dark:text-white/50">{label}</p>
    </div>
  );
}
