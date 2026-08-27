import { useParams } from "react-router-dom";
import { Flag, Landmark, MapPin } from "lucide-react";
import { Logo } from "../components/common/Logo";
import { StatCard } from "../components/common/StatCard";
import { useAppStore } from "../store/useAppStore";
import { computeStats } from "../utils/stats";
import { DestinationCard } from "../components/destinations/DestinationCard";
import { TravelTimeline } from "../components/timeline/TravelTimeline";

export default function PublicJourney() {
  const { handle } = useParams();
  const user = useAppStore((s) => s.user);
  const destinations = useAppStore((s) => s.destinations);
  const trips = useAppStore((s) => s.trips);
  const memories = useAppStore((s) => s.memories);

  const stats = computeStats(destinations, trips, memories);
  const favorites = destinations.filter((d) => d.isFavorite);

  return (
    <div className="min-h-screen bg-paper dark:bg-[#14171a]">
      <header className="flex items-center justify-between px-6 md:px-10 py-5 max-w-5xl mx-auto">
        <Logo />
        <span className="text-xs text-ink-soft dark:text-white/50">
          Public Journey
        </span>
      </header>

      <div className="max-w-5xl mx-auto px-6 md:px-10 pb-16">
        <div className="flex items-center gap-4 mb-8">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover"
          />
          <div>
            <h1 className="font-display text-3xl">
              {(handle ?? user.handle).toUpperCase()}'S JOURNEY
            </h1>
            <p className="text-ink-soft dark:text-white/50 italic">
              “{user.bio}”
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-10 max-w-md">
          <StatCard
            label="Countries"
            value={stats.countries}
            icon={<Flag size={14} />}
          />
          <StatCard
            label="States"
            value={stats.states}
            icon={<Landmark size={14} />}
          />
          <StatCard
            label="Destinations"
            value={stats.destinations}
            icon={<MapPin size={14} />}
          />
        </div>

        {favorites.length > 0 && (
          <>
            <h2 className="font-display text-xl mb-4">Favorite Places</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {favorites.map((d) => (
                <DestinationCard
                  key={d.id}
                  destination={d}
                  onClick={() => {}}
                />
              ))}
            </div>
          </>
        )}

        <h2 className="font-display text-xl mb-4">Travel Timeline</h2>
        <TravelTimeline destinations={destinations} />
      </div>
    </div>
  );
}
