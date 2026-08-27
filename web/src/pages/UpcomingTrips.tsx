import { useState } from "react";
import { Clock, Plane, Plus } from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { TripCard } from "../components/trips/TripCard";
import { AddTripModal } from "../components/trips/AddTripModal";
import { TripDrawer } from "../components/trips/TripDrawer";
import { EmptyState } from "../components/common/EmptyState";
import { useAppStore } from "../store/useAppStore";
import type { Trip } from "../types";
import clsx from "clsx";

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-coral-500/15 text-coral-500",
  medium: "bg-amber-400/15 text-amber-600",
  low: "bg-ink/8 text-ink-soft dark:bg-white/10 dark:text-white/50",
};

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export default function UpcomingTrips() {
  const destinations = useAppStore((s) => s.destinations);
  const trips = useAppStore((s) => s.trips);
  const deleteTrip = useAppStore((s) => s.deleteTrip);
  const moveToPlanned = useAppStore((s) => s.moveToPlanned);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [openTripId, setOpenTripId] = useState<string | null>(null);

  const upcoming = trips
    .filter((t) => t.status === "planned")
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
  const wishlist = destinations.filter((d) => d.status === "wishlist");
  const nextTrip = upcoming[0];
  const nextTripCountdown = nextTrip ? daysUntil(nextTrip.startDate) : null;

  return (
    <div>
      <TopBar
        title="Upcoming Trips"
        subtitle="Your next adventures, planned and ready."
      />
      <div className="px-5 md:px-8 pb-10">
        {nextTrip && (
          <button
            onClick={() => setOpenTripId(nextTrip.id)}
            className="mb-8 rounded-3xl overflow-hidden relative h-56 bg-gradient-to-br from-sky-500 to-sky-600 w-full text-left block"
          >
            <img
              src={nextTrip.coverImageUrl}
              className="absolute inset-0 w-full h-full object-cover opacity-40"
              alt=""
            />
            <div className="relative h-full flex flex-col justify-end p-6 text-white">
              <p className="text-xs uppercase tracking-wide opacity-80 mb-1">
                Next Adventure
              </p>
              <h2 className="font-display text-3xl mb-1">{nextTrip.title}</h2>
              <p className="text-sm opacity-90">
                {new Date(nextTrip.startDate).toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              {nextTripCountdown !== null && nextTripCountdown >= 0 && (
                <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold w-fit">
                  <Clock size={12} />{" "}
                  {nextTripCountdown === 0
                    ? "Today"
                    : `${nextTripCountdown} days to go`}
                </span>
              )}
            </div>
          </button>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl flex items-center gap-2">
            <Plane size={18} /> Planned Trips
          </h2>
          <button
            onClick={() => {
              setEditingTrip(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition"
          >
            <Plus size={15} /> Add Trip
          </button>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            icon={<Plane size={22} />}
            title="No upcoming trips"
            description="Plan your next adventure to see it here."
            actionLabel="Add Trip"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {upcoming.map((t) => (
              <TripCard
                key={t.id}
                trip={t}
                destinationNames={t.destinationIds
                  .map((id) => destinations.find((d) => d.id === id)?.name)
                  .filter(Boolean)
                  .join(", ")}
                onEdit={() => {
                  setEditingTrip(t);
                  setModalOpen(true);
                }}
                onDelete={() => deleteTrip(t.id)}
                onOpen={() => setOpenTripId(t.id)}
              />
            ))}
          </div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wishlist.map((d) => (
              <div
                key={d.id}
                className="rounded-2xl overflow-hidden bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft"
              >
                <div className="relative h-28">
                  <img
                    src={d.heroImageUrl}
                    className="w-full h-full object-cover"
                    alt={d.name}
                  />
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
                  <p className="text-xs text-ink-soft dark:text-white/50 mb-3">
                    {d.country}
                  </p>
                  <button
                    onClick={() => moveToPlanned(d.id)}
                    className="w-full py-1.5 rounded-full bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition"
                  >
                    Add to Planned
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <AddTripModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingTrip={editingTrip}
      />
      <TripDrawer tripId={openTripId} onClose={() => setOpenTripId(null)} />
    </div>
  );
}
