import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, History, Plane, Plus } from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { TripCard } from "../components/trips/TripCard";
import { AddTripModal } from "../components/trips/AddTripModal";
import { TripDrawer } from "../components/trips/TripDrawer";
import { EmptyState } from "../components/common/EmptyState";
import { useAppStore } from "../store/useAppStore";
import { confirmAction } from "../store/useConfirmStore";
import { daysUntil, formatDateRange, todayIso } from "../utils/dates";
import type { Trip } from "../types";
import clsx from "clsx";

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-coral-500/15 text-coral-500",
  medium: "bg-amber-400/15 text-amber-600",
  low: "bg-ink/8 text-ink-soft dark:bg-white/10 dark:text-white/50",
};

export default function UpcomingTrips() {
  const destinations = useAppStore((s) => s.destinations);
  const trips = useAppStore((s) => s.trips);
  const deleteTrip = useAppStore((s) => s.deleteTrip);
  const updateTrip = useAppStore((s) => s.updateTrip);
  const pushToast = useAppStore((s) => s.pushToast);
  const [params, setParams] = useSearchParams();
  // ?plan=<destinationId> (from "Plan Trip" elsewhere) and ?start=<date> (from the
  // calendar) open the new-trip form pre-filled.
  const [modalOpen, setModalOpen] = useState(() => params.has("plan") || params.has("start"));
  const [startFor] = useState<string | null>(() => params.get("start"));
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [planFor, setPlanFor] = useState<string | null>(() => params.get("plan"));
  const openTripId = params.get("trip");
  const setOpenTripId = (id: string | null) =>
    setParams(id ? { trip: id } : {}, { replace: true });

  const today = todayIso();
  const byStart = (a: Trip, b: Trip) => a.startDate.localeCompare(b.startDate);
  const planned = trips.filter((t) => t.status === "planned");
  const upcoming = planned.filter((t) => t.endDate >= today).sort(byStart);
  const toWrapUp = planned.filter((t) => t.endDate < today).sort(byStart);
  const past = trips
    .filter((t) => t.status === "visited")
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
  const wishlist = destinations.filter((d) => d.status === "wishlist");
  const nextTrip = upcoming[0];
  const nextTripCountdown = nextTrip ? daysUntil(nextTrip.startDate) : null;

  const namesFor = (t: Trip) =>
    t.destinationIds
      .map((id) => destinations.find((d) => d.id === id)?.name)
      .filter(Boolean)
      .join(", ");

  const openNewTrip = (destinationId: string | null = null) => {
    setEditingTrip(null);
    setPlanFor(destinationId);
    setModalOpen(true);
  };

  const remove = async (trip: Trip) => {
    const ok = await confirmAction({
      title: `Delete "${trip.title}"?`,
      message: "Its checklist, budget, expenses and collaborators are deleted too.",
      confirmLabel: "Delete trip",
      danger: true,
    });
    if (ok && (await deleteTrip(trip.id))) pushToast("Trip deleted", "success");
  };

  const markCompleted = async (trip: Trip) => {
    if (await updateTrip(trip.id, { status: "visited" })) {
      pushToast(`Welcome back from ${trip.title}!`, "success");
    }
  };

  const card = (t: Trip) => (
    <TripCard
      key={t.id}
      trip={t}
      destinationNames={namesFor(t)}
      onEdit={() => {
        setEditingTrip(t);
        setModalOpen(true);
      }}
      onDelete={() => remove(t)}
      onOpen={() => setOpenTripId(t.id)}
    />
  );

  return (
    <div>
      <TopBar title="Trips" subtitle="Plan what's next, look back on where you've been." />
      <div className="px-5 md:px-8 pb-10">
        {nextTrip && (
          <button
            onClick={() => setOpenTripId(nextTrip.id)}
            className="mb-8 rounded-3xl overflow-hidden relative h-56 bg-gradient-to-br from-sky-500 to-sky-600 w-full text-left block"
          >
            {nextTrip.coverImageUrl && (
              <img
                src={nextTrip.coverImageUrl}
                className="absolute inset-0 w-full h-full object-cover opacity-40"
                alt=""
              />
            )}
            <div className="relative h-full flex flex-col justify-end p-6 text-white">
              <p className="text-xs uppercase tracking-wide opacity-80 mb-1">Next Adventure</p>
              <h2 className="font-display text-3xl mb-1">{nextTrip.title}</h2>
              <p className="text-sm opacity-90">
                {formatDateRange(nextTrip.startDate, nextTrip.endDate)}
              </p>
              {nextTripCountdown !== null && (
                <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold w-fit">
                  <Clock size={12} />{" "}
                  {nextTripCountdown <= 0
                    ? "Happening now"
                    : `${nextTripCountdown} day${nextTripCountdown === 1 ? "" : "s"} to go`}
                </span>
              )}
            </div>
          </button>
        )}

        {toWrapUp.length > 0 && (
          <section className="mb-8 rounded-3xl border border-forest-500/30 bg-forest-500/5 p-4 md:p-5">
            <h2 className="font-display text-lg mb-1">Back from these trips?</h2>
            <p className="text-sm text-ink-soft dark:text-white/50 mb-3">
              Mark them completed so they count toward your stats and journey timeline.
            </p>
            <div className="flex flex-col gap-2">
              {toWrapUp.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10"
                >
                  <button onClick={() => setOpenTripId(t.id)} className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-sm truncate">{t.title}</p>
                    <p className="text-xs text-ink-soft dark:text-white/50">
                      {formatDateRange(t.startDate, t.endDate)}
                    </p>
                  </button>
                  {t.role === "owner" && (
                    <button
                      onClick={() => markCompleted(t)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-forest-500 text-white text-xs font-semibold hover:bg-forest-600 shrink-0"
                    >
                      <CheckCircle2 size={13} /> Completed
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl flex items-center gap-2">
            <Plane size={18} /> Upcoming
          </h2>
          <button
            onClick={() => openNewTrip()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition"
          >
            <Plus size={15} /> Add Trip
          </button>
        </div>

        {upcoming.length === 0 ? (
          <div className="mb-10">
            <EmptyState
              icon={<Plane size={22} />}
              title="No upcoming trips"
              description="Plan your next adventure to see it here."
              actionLabel="Add Trip"
              onAction={() => openNewTrip()}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">{upcoming.map(card)}</div>
        )}

        <h2 className="font-display text-xl mb-1">Places I Want To Explore</h2>
        <p className="text-sm text-ink-soft dark:text-white/50 mb-4">
          Your travel bucket list, ready to become a plan.
        </p>

        {wishlist.length === 0 ? (
          <EmptyState
            icon={<Plane size={22} />}
            title="No wishlist destinations"
            description="Add somewhere you've been dreaming about."
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {wishlist.map((d) => (
              <div
                key={d.id}
                className="rounded-2xl overflow-hidden bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft"
              >
                <div className="relative h-28">
                  <img src={d.heroImageUrl} className="w-full h-full object-cover" alt={d.name} />
                  {d.priority && (
                    <span
                      className={clsx(
                        "absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        PRIORITY_STYLES[d.priority],
                      )}
                    >
                      {d.priority}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm">{d.name}</p>
                  <p className="text-xs text-ink-soft dark:text-white/50 mb-3">{d.country}</p>
                  <button
                    onClick={() => openNewTrip(d.id)}
                    className="w-full py-1.5 rounded-full bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition"
                  >
                    Plan a trip
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {past.length > 0 && (
          <>
            <h2 className="font-display text-xl flex items-center gap-2 mb-4">
              <History size={18} /> Past Trips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{past.map(card)}</div>
          </>
        )}
      </div>
      <AddTripModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          if (params.has("plan") || params.has("start")) setParams({}, { replace: true });
        }}
        editingTrip={editingTrip}
        initialDestinationId={planFor}
        initialStartDate={editingTrip ? null : startFor}
      />
      <TripDrawer tripId={openTripId} onClose={() => setOpenTripId(null)} />
    </div>
  );
}
