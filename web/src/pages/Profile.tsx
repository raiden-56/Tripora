import { useState } from "react";
import { Edit3, Heart, MapPin, Share2, Trophy } from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { AchievementCard } from "../components/achievements/AchievementCard";
import { DestinationCard } from "../components/destinations/DestinationCard";
import { EmptyState } from "../components/common/EmptyState";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import { computeStats } from "../utils/stats";
import { computeTravelScore } from "../utils/travelScore";
import { resolveAvatarUrl } from "../utils/avatar";

export default function Profile() {
  const user = useAppStore((s) => s.user);
  const authUser = useAuthStore((s) => s.currentUser);
  const displayName = authUser?.name || user.name || "Traveler";
  const destinations = useAppStore((s) => s.destinations);
  const trips = useAppStore((s) => s.trips);
  const memories = useAppStore((s) => s.memories);
  const achievements = useAppStore((s) => s.achievements);
  const selectDestination = useAppStore((s) => s.selectDestination);
  const updateUserBio = useAppStore((s) => s.updateUserBio);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user.bio);

  const stats = computeStats(destinations, trips, memories);
  const favorites = destinations.filter((d) => d.isFavorite);
  const travelScore = computeTravelScore(destinations);

  const toggleEditing = () => {
    if (editing) updateUserBio(bio);
    setEditing((e) => !e);
  };

  return (
    <div>
      <TopBar title="Profile" />
      <div className="px-5 md:px-8 pb-10">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5 mb-8">
          <img
            src={resolveAvatarUrl(user.avatarUrl, displayName)}
            alt={displayName}
            className="w-24 h-24 rounded-3xl object-cover shadow-soft"
          />
          <div className="flex-1">
            <h2 className="font-display text-2xl">
              {displayName.toUpperCase()}
            </h2>
            {editing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 w-full max-w-sm px-3 py-2 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm"
                rows={2}
              />
            ) : (
              <p className="text-ink-soft dark:text-white/50 italic mt-1">
                “{bio}”
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={toggleEditing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-ink/15 dark:border-white/20 text-xs font-semibold hover:bg-ink/5 dark:hover:bg-white/5"
              >
                <Edit3 size={12} /> {editing ? "Save" : "Edit Profile"}
              </button>
              <a
                href="/u/ganesh"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-ink/15 dark:border-white/20 text-xs font-semibold hover:bg-ink/5 dark:hover:bg-white/5"
              >
                <Share2 size={12} /> Public Journey
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <MiniStat label="Countries" value={stats.countries} />
          <MiniStat label="States" value={stats.states} />
          <MiniStat label="Destinations" value={stats.destinations} />
          <MiniStat label="Memories" value={stats.memories} />
        </div>

        <h3 className="font-display text-xl mb-4">My Travel Profile</h3>
        <div className="rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 p-5 mb-10 flex flex-col gap-4">
          {travelScore.map((c) => (
            <div key={c.label}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium">{c.label}</span>
                <span className="text-ink-soft dark:text-white/50">
                  {c.percent}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-ink/8 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-forest-400 to-sky-500 rounded-full"
                  style={{ width: `${c.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {favorites.length > 0 ? (
          <>
            <h3 className="font-display text-xl mb-4 flex items-center gap-2">
              <Heart size={17} className="text-coral-500" /> Favorite
              Destinations
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {favorites.map((d) => (
                <DestinationCard
                  key={d.id}
                  destination={d}
                  onClick={() => selectDestination(d.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="mb-10">
            <h3 className="font-display text-xl mb-4 flex items-center gap-2">
              <Heart size={17} className="text-coral-500" /> Favorite
              Destinations
            </h3>
            <EmptyState
              compact
              icon={<Heart size={20} />}
              title="No favorites yet"
              description="Mark destinations as favorites to see them here."
            />
          </div>
        )}

        <h3 className="font-display text-xl mb-4 flex items-center gap-2">
          <MapPin size={17} /> Achievements
        </h3>
        {achievements.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {achievements.map((a) => (
              <AchievementCard key={a.id} achievement={a} />
            ))}
          </div>
        ) : (
          <EmptyState
            compact
            icon={<Trophy size={20} />}
            title="No achievements yet"
            description="Start adding destinations and memories to unlock achievements."
          />
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 text-center">
      <p className="font-display text-2xl">{value}</p>
      <p className="text-xs text-ink-soft dark:text-white/50">{label}</p>
    </div>
  );
}
