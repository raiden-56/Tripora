import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, CheckCircle2, FolderOpen, MapPin, Users, X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { StatusBadge } from "../common/StatusBadge";
import { EmptyState } from "../common/EmptyState";
import { TripExpensesTab } from "./TripExpensesTab";
import { TripCollaboratorsTab } from "./TripCollaboratorsTab";
import { TripChecklistTab } from "./TripChecklistTab";
import { TripWeatherCard } from "./TripWeatherCard";
import { TripBudgetTab } from "./TripBudgetTab";
import { TripItineraryTab } from "./TripItineraryTab";
import { daysUntil, formatDateRange, todayIso } from "../../utils/dates";

type Tab = "overview" | "itinerary" | "checklist" | "budget" | "expenses" | "collaborators";

export function TripDrawer({
  tripId,
  onClose,
}: {
  tripId: string | null;
  onClose: () => void;
}) {
  const trips = useAppStore((s) => s.trips);
  const destinations = useAppStore((s) => s.destinations);
  const updateTrip = useAppStore((s) => s.updateTrip);
  const pushToast = useAppStore((s) => s.pushToast);
  const [tab, setTab] = useState<Tab>("overview");

  const trip = trips.find((t) => t.id === tripId);
  const tripDestinations = useMemo(
    () => (trip ? destinations.filter((d) => trip.destinationIds.includes(d.id)) : []),
    [trip, destinations],
  );

  const close = () => {
    onClose();
    setTab("overview");
  };

  if (!trip) return null;

  const countdown =
    trip.status === "planned" ? daysUntil(trip.startDate) : null;
  // Expenses are owner-only on the server; collaborators see the budget instead.
  const tabs: Tab[] =
    trip.role === "owner"
      ? ["overview", "itinerary", "checklist", "budget", "expenses", "collaborators"]
      : ["overview", "itinerary", "checklist", "budget", "collaborators"];
  const canMarkCompleted =
    trip.role === "owner" && trip.status === "planned" && trip.startDate <= todayIso();

  const markCompleted = async () => {
    if (await updateTrip(trip.id, { status: "visited" })) {
      pushToast("Trip marked as completed", "success");
    }
  };

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
          className="absolute right-0 top-0 h-full w-full md:w-[520px] bg-white dark:bg-[#1c2024] shadow-soft-lg overflow-y-auto"
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
              {formatDateRange(trip.startDate, trip.endDate)}
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
            {tabs.map(
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
                <TripWeatherCard trip={trip} destinations={tripDestinations} />
                {canMarkCompleted && (
                  <button
                    onClick={markCompleted}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-forest-500/10 text-forest-700 dark:text-forest-300 text-sm font-semibold hover:bg-forest-500/15"
                  >
                    <CheckCircle2 size={16} /> Back from this trip? Mark it completed
                  </button>
                )}
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
                        {[d.state, d.country].filter(Boolean).join(", ")}
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
                  <p className="text-sm text-ink-soft dark:text-white/60 whitespace-pre-line">
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

            {tab === "itinerary" && <TripItineraryTab tripId={trip.id} role={trip.role} />}

            {tab === "checklist" && (
              <TripChecklistTab trip={trip} destinations={tripDestinations} />
            )}

            {tab === "budget" && <TripBudgetTab tripId={trip.id} role={trip.role} />}

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
