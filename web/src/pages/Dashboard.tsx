import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Flag,
  Landmark,
  MapPin,
  Plane,
  Plus,
  Sparkles,
} from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { StatCard } from "../components/common/StatCard";
import { EmptyState } from "../components/common/EmptyState";
import { useAppStore } from "../store/useAppStore";
import { computeStats } from "../utils/stats";
import { DestinationCard } from "../components/destinations/DestinationCard";
import { TripCard } from "../components/trips/TripCard";
import { WhatsNextSection } from "../components/dashboard/WhatsNextSection";

export default function Dashboard() {
  const destinations = useAppStore((s) => s.destinations);
  const trips = useAppStore((s) => s.trips);
  const memories = useAppStore((s) => s.memories);
  const selectDestination = useAppStore((s) => s.selectDestination);
  const openAddDestination = useAppStore((s) => s.openAddDestination);
  const navigate = useNavigate();

  const stats = computeStats(destinations, trips, memories);
  const recentVisited = [...destinations]
    .filter((d) => d.status === "visited")
    .sort(
      (a, b) =>
        new Date(b.visitedFrom ?? 0).getTime() -
        new Date(a.visitedFrom ?? 0).getTime(),
    )
    .slice(0, 4);
  const upcoming = trips
    .filter((t) => t.status === "planned")
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )
    .slice(0, 3);
  const memoryCounts = memories.reduce<Record<string, number>>((acc, m) => {
    acc[m.destinationId] = (acc[m.destinationId] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <TopBar
        title="Your Journey"
        subtitle="Every place you've been. Every place you're going."
      />

      <div className="px-5 md:px-8 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard
            label="Countries"
            value={stats.countries}
            icon={<Flag size={16} />}
          />
          <StatCard
            label="States"
            value={stats.states}
            icon={<Landmark size={16} />}
            delay={0.05}
          />
          <StatCard
            label="Destinations"
            value={stats.destinations}
            icon={<MapPin size={16} />}
            delay={0.1}
          />
          <StatCard
            label="Memories"
            value={stats.memories}
            icon={<Camera size={16} />}
            delay={0.15}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-forest-500 to-forest-600 text-white p-6 md:p-8"
        >
          <Sparkles className="absolute right-6 top-6 opacity-30" size={64} />
          <p className="text-xs uppercase tracking-wide opacity-80 mb-1">
            Explore the map
          </p>
          <h2 className="font-display text-2xl md:text-3xl mb-2 max-w-md">
            My entire travel life, in one beautiful map.
          </h2>
          <p className="text-sm opacity-85 max-w-md mb-5">
            See where you've been, plan what's next, and relive every memory.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => navigate("/app/map")}
              className="px-4 py-2.5 rounded-full bg-white text-forest-600 text-sm font-semibold hover:opacity-90"
            >
              Open Explore Map
            </button>
            <button
              onClick={() => openAddDestination()}
              className="px-4 py-2.5 rounded-full border border-white/40 text-white text-sm font-semibold hover:bg-white/10 flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Destination
            </button>
          </div>
        </motion.div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Recent Journeys</h2>
          <button
            onClick={() => navigate("/app/destinations")}
            className="text-sm font-semibold text-forest-600 dark:text-forest-400"
          >
            View all
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {recentVisited.length > 0 ? (
            recentVisited.map((d) => (
              <DestinationCard
                key={d.id}
                destination={d}
                memoryCount={memoryCounts[d.id] ?? 0}
                onClick={() => selectDestination(d.id)}
              />
            ))
          ) : (
            <div className="col-span-2 md:col-span-4">
              <EmptyState
                compact
                icon={<MapPin size={20} />}
                title="No visited destinations yet"
                description="Add a destination and mark it as visited to see it here."
                actionLabel="Add Destination"
                onAction={() => openAddDestination()}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl flex items-center gap-2">
            <Plane size={18} className="text-sky-500" /> Upcoming Trips
          </h2>
          <button
            onClick={() => navigate("/app/journeys")}
            className="text-sm font-semibold text-forest-600 dark:text-forest-400"
          >
            View all
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {upcoming.length > 0 ? (
            upcoming.map((t) => (
              <TripCard
                key={t.id}
                trip={t}
                destinationNames={t.destinationIds
                  .map((id) => destinations.find((d) => d.id === id)?.name)
                  .filter(Boolean)
                  .join(", ")}
                onEdit={() => navigate("/app/journeys")}
                onDelete={() => {}}
              />
            ))
          ) : (
            <div className="md:col-span-3">
              <EmptyState
                compact
                icon={<Plane size={20} />}
                title="No upcoming trips planned"
                description="Plan a trip to start counting down to your next adventure."
                actionLabel="Plan a Trip"
                onAction={() => navigate("/app/trips")}
              />
            </div>
          )}
        </div>

        <WhatsNextSection />
      </div>
    </div>
  );
}
