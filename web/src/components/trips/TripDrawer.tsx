import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  Calendar,
  Check,
  CloudSun,
  FolderOpen,
  ListChecks,
  MapPin,
  Plus,
  Users,
  X,
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { StatusBadge } from "../common/StatusBadge";
import { EmptyState } from "../common/EmptyState";
import { TripExpensesTab } from "./TripExpensesTab";
import { TripCollaboratorsTab } from "./TripCollaboratorsTab";

type Tab = "overview" | "checklist" | "budget" | "expenses" | "collaborators";

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export function TripDrawer({
  tripId,
  onClose,
}: {
  tripId: string | null;
  onClose: () => void;
}) {
  const trips = useAppStore((s) => s.trips);
  const destinations = useAppStore((s) => s.destinations);
  const toggleChecklistItem = useAppStore((s) => s.toggleChecklistItem);
  const [tab, setTab] = useState<Tab>("overview");

  const trip = trips.find((t) => t.id === tripId);
  const tripDestinations = trip
    ? destinations.filter((d) => trip.destinationIds.includes(d.id))
    : [];

  const close = () => {
    onClose();
    setTab("overview");
  };

  if (!trip) return null;

  const countdown =
    trip.status === "planned" ? daysUntil(trip.startDate) : null;
  const checklistDone = trip.checklist?.filter((c) => c.done).length ?? 0;
  const totalPlanned = trip.budget?.reduce((s, b) => s + b.planned, 0) ?? 0;
  const totalActual = trip.budget?.reduce((s, b) => s + b.actual, 0) ?? 0;

  return (
    <AnimatePresence>
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
          className="absolute right-0 top-0 h-full w-full md:w-[440px] bg-white dark:bg-[#1c2024] shadow-soft-lg overflow-y-auto"
        >
          <div className="relative h-44 shrink-0">
            <img
              src={trip.coverImageUrl}
              alt={trip.title}
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
              <h2 className="font-display text-2xl">{trip.title}</h2>
              <p className="text-sm opacity-90">
                {tripDestinations.map((d) => d.name).join(", ")}
              </p>
            </div>
          </div>

          <div className="px-5 pt-4 flex items-center gap-2 flex-wrap">
            <StatusBadge status={trip.status} />
            <span className="flex items-center gap-1 text-xs text-ink-soft dark:text-white/50">
              <Calendar size={12} />
              {new Date(trip.startDate).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
            {countdown !== null && countdown >= 0 && (
              <span className="text-xs font-semibold text-forest-600 dark:text-forest-400">
                {countdown === 0 ? "Today" : `${countdown} days to go`}
              </span>
            )}
            {trip.role !== "owner" && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 capitalize">
                <Users size={11} /> Shared · {trip.role}
              </span>
            )}
          </div>

          <div className="px-5 mt-4 flex gap-1 border-b border-ink/8 dark:border-white/10 overflow-x-auto">
            {(["overview", "checklist", "budget", "expenses", "collaborators"] as Tab[]).map(
              (t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px capitalize transition ${tab === t ? "border-forest-500 text-forest-600 dark:text-forest-400" : "border-transparent text-ink-soft dark:text-white/50"}`}
                >
                  {t}
                </button>
              ),
            )}
          </div>

          <div className="p-5">
            {tab === "overview" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-ink/8 dark:border-white/10">
                  <CloudSun size={18} className="text-sky-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Weather forecast</p>
                    <p className="text-xs text-ink-soft dark:text-white/50">
                      Available closer to your travel date.
                    </p>
                  </div>
                </div>
                {tripDestinations.length > 0 ? (
                  tripDestinations.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center gap-2.5 p-3.5 rounded-xl border border-ink/8 dark:border-white/10"
                    >
                      <MapPin size={15} className="text-forest-500 shrink-0" />
                      <span className="text-sm font-medium flex-1 truncate">
                        {d.name}
                      </span>
                      <span className="text-xs text-ink-soft dark:text-white/50">
                        {d.places.length} places planned
                      </span>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    compact
                    icon={<MapPin size={20} />}
                    title="No destinations linked"
                    description="This trip isn't linked to any destination yet."
                  />
                )}
                {trip.notes && (
                  <p className="text-sm text-ink-soft dark:text-white/60">
                    {trip.notes}
                  </p>
                )}
                {trip.driveFolderUrl && (
                  <a
                    href={trip.driveFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border border-ink/12 dark:border-white/15 w-fit hover:bg-ink/5 dark:hover:bg-white/5"
                  >
                    <FolderOpen size={12} /> Open Drive Folder
                  </a>
                )}
              </div>
            )}

            {tab === "checklist" && (
              <div>
                {trip.checklist && trip.checklist.length > 0 ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <ListChecks size={14} className="text-forest-500" />
                      <p className="text-xs text-ink-soft dark:text-white/50">
                        {checklistDone}/{trip.checklist.length} complete
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {trip.checklist.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleChecklistItem(trip.id, item.id)}
                          className="flex items-center gap-3 p-3 rounded-xl border border-ink/8 dark:border-white/10 text-left hover:border-forest-400 transition"
                        >
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${item.done ? "bg-forest-500 border-forest-500" : "border-ink/25 dark:border-white/25"}`}
                          >
                            {item.done && (
                              <Check size={12} className="text-white" />
                            )}
                          </span>
                          <span
                            className={`text-sm ${item.done ? "line-through text-ink-soft dark:text-white/40" : ""}`}
                          >
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState
                    compact
                    icon={<ListChecks size={20} />}
                    title="No checklist items"
                    description="No checklist items yet for this trip."
                  />
                )}
              </div>
            )}

            {tab === "budget" && (
              <div>
                {trip.budget && trip.budget.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-2.5 mb-4">
                      <BudgetStat label="Planned" value={totalPlanned} />
                      <BudgetStat label="Actual" value={totalActual} />
                      <BudgetStat
                        label={totalActual <= totalPlanned ? "Saved" : "Over"}
                        value={Math.abs(totalPlanned - totalActual)}
                        accent={
                          totalActual <= totalPlanned
                            ? "text-forest-600"
                            : "text-coral-500"
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      {trip.budget.map((b) => (
                        <div
                          key={b.category}
                          className="flex items-center justify-between p-3 rounded-xl border border-ink/8 dark:border-white/10 text-sm"
                        >
                          <span className="font-medium flex items-center gap-1.5">
                            <Banknote size={13} className="text-ink-soft" />
                            {b.category}
                          </span>
                          <span className="text-ink-soft dark:text-white/50">
                            ₹{b.actual.toLocaleString("en-IN")} / ₹
                            {b.planned.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState
                    compact
                    icon={<Plus size={20} />}
                    title="No budget tracked"
                    description="No budget tracked yet for this trip."
                  />
                )}
              </div>
            )}

            {tab === "expenses" && <TripExpensesTab tripId={trip.id} />}

            {tab === "collaborators" && (
              <TripCollaboratorsTab tripId={trip.id} role={trip.role} />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function BudgetStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="py-2.5 rounded-xl bg-ink/[0.03] dark:bg-white/5 text-center">
      <p className={`font-display text-base ${accent ?? ""}`}>
        ₹{value.toLocaleString("en-IN")}
      </p>
      <p className="text-[11px] text-ink-soft dark:text-white/50">{label}</p>
    </div>
  );
}
