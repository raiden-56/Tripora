import { useState } from "react";
import { Link } from "react-router-dom";
import { Edit3, Heart, Lock, MapPin, Share2, Trophy } from "lucide-react";
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
  const updateProfile = useAppStore((s) => s.updateProfile);
  const pushToast = useAppStore((s) => s.pushToast);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  // Draft values are copied from the store when editing starts, so a late-loading
  // profile can never be overwritten with blanks.
  const [draft, setDraft] = useState({ name: "", bio: "", homeLocation: "", handle: "" });

  const stats = computeStats(destinations, trips, memories);
  const favorites = destinations.filter((d) => d.isFavorite);
  const travelScore = computeTravelScore(destinations);

  const startEditing = () => {
    setDraft({
      name: user.name || displayName,
      bio: user.bio,
      homeLocation: user.homeLocation,
      handle: user.handle,
    });
    setEditing(true);
  };

  const save = async () => {
    const handle = draft.handle.trim().toLowerCase();
    if (!HANDLE_RE.test(handle)) {
      pushToast(
        "Handles are 3–30 lowercase letters, numbers or dashes, starting and ending with a letter or number.",
        "error",
      );
      return;
    }
    if (!draft.name.trim()) {
      pushToast("Your name can't be empty.", "error");
      return;
    }
    setSaving(true);
    const ok = await updateProfile({
      ...(draft.name.trim() !== user.name ? { name: draft.name.trim() } : {}),
      bio: draft.bio.trim(),
      homeLocation: draft.homeLocation.trim(),
      ...(handle !== user.handle ? { handle } : {}),
    });
    setSaving(false);
    if (ok) {
      setEditing(false);
      pushToast("Profile saved", "success");
    }
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
          <div className="flex-1 w-full">
            {editing ? (
              <div className="flex flex-col gap-2.5 max-w-md">
                <Field label="Name">
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    maxLength={120}
                    className={inputClass}
                  />
                </Field>
                <Field label="Bio">
                  <textarea
                    value={draft.bio}
                    onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                    maxLength={2000}
                    rows={2}
                    placeholder="Mountains over beaches, always."
                    className={inputClass}
                  />
                </Field>
                <Field label="Home city">
                  <input
                    value={draft.homeLocation}
                    onChange={(e) => setDraft({ ...draft, homeLocation: e.target.value })}
                    maxLength={255}
                    placeholder="Bengaluru"
                    className={inputClass}
                  />
                </Field>
                <Field label="Public handle">
                  <div className="flex items-center rounded-xl border border-ink/12 dark:border-white/15 focus-within:border-forest-400">
                    <span className="pl-3.5 text-sm text-ink-soft">/u/</span>
                    <input
                      value={draft.handle}
                      onChange={(e) => setDraft({ ...draft, handle: e.target.value.toLowerCase() })}
                      maxLength={30}
                      className="flex-1 min-w-0 px-1 py-2 bg-transparent text-sm outline-none"
                    />
                  </div>
                </Field>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-1.5 rounded-full border border-ink/15 dark:border-white/20 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="px-4 py-1.5 rounded-full bg-forest-500 text-white text-xs font-semibold hover:bg-forest-600 disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save profile"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl">{displayName}</h2>
                {user.homeLocation && (
                  <p className="flex items-center gap-1 text-xs text-ink-soft dark:text-white/50 mt-0.5">
                    <MapPin size={11} /> {user.homeLocation}
                  </p>
                )}
                <p className="text-ink-soft dark:text-white/50 italic mt-1">
                  {user.bio ? `“${user.bio}”` : "Add a short bio so people know your travel style."}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={startEditing}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-ink/15 dark:border-white/20 text-xs font-semibold hover:bg-ink/5 dark:hover:bg-white/5"
                  >
                    <Edit3 size={12} /> Edit Profile
                  </button>
                  {user.handle && (
                    <Link
                      to={`/u/${user.handle}`}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-ink/15 dark:border-white/20 text-xs font-semibold hover:bg-ink/5 dark:hover:bg-white/5"
                    >
                      <Share2 size={12} /> Public Journey
                    </Link>
                  )}
                  {user.visibility !== "public" && (
                    <Link
                      to="/app/settings"
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-ink-soft hover:text-ink dark:hover:text-white"
                    >
                      <Lock size={11} /> Your journey is {user.visibility} — change in Settings
                    </Link>
                  )}
                </div>
              </>
            )}
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

const HANDLE_RE = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;
const inputClass =
  "w-full px-3.5 py-2 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink-soft mb-1 block">{label}</span>
      {children}
    </label>
  );
}
