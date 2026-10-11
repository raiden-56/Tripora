import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Camera,
  Copy,
  Info,
  Link2,
  MapPin,
  MessageCircle,
  Share2,
  Star,
  Users2,
} from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { AnimatedCounter } from "../components/common/AnimatedCounter";
import { useAppStore } from "../store/useAppStore";

/** First four characters of an ISO date ("2026-03-14" → "2026"), or null. */
function yearOf(iso: string | undefined | null): string | null {
  if (!iso) return null;
  const y = iso.slice(0, 4);
  return /^\d{4}$/.test(y) ? y : null;
}

export default function YearlyRecap() {
  const user = useAppStore((s) => s.user);
  const destinations = useAppStore((s) => s.destinations);
  const trips = useAppStore((s) => s.trips);
  const memories = useAppStore((s) => s.memories);
  const pushToast = useAppStore((s) => s.pushToast);

  const currentYear = String(new Date().getFullYear());
  const [year, setYear] = useState(currentYear);

  const years = useMemo(() => {
    const set = new Set<string>([currentYear]);
    for (const d of destinations) {
      if (d.status !== "visited") continue;
      const y = yearOf(d.visitedFrom);
      if (y) set.add(y);
    }
    for (const t of trips) {
      const y = yearOf(t.startDate);
      if (y) set.add(y);
    }
    for (const m of memories) {
      const y = yearOf(m.date);
      if (y) set.add(y);
    }
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [destinations, trips, memories, currentYear]);

  const recap = useMemo(() => {
    const visited = destinations.filter(
      (d) => d.status === "visited" && yearOf(d.visitedFrom) === year,
    );
    const states = new Set(visited.filter((d) => d.state).map((d) => d.state));
    const countries = new Set(visited.map((d) => d.country));
    const yearMemories = memories.filter((m) => yearOf(m.date) === year);
    const yearTrips = trips.filter((t) => yearOf(t.startDate) === year);
    const travelDays = visited.reduce((sum, d) => {
      if (!d.visitedFrom || !d.visitedTo) return sum + 1;
      return (
        sum +
        Math.max(
          1,
          Math.round(
            (new Date(d.visitedTo).getTime() -
              new Date(d.visitedFrom).getTime()) /
              86400000,
          ) + 1,
        )
      );
    }, 0);
    const favorite = visited.find((d) => d.isFavorite) ?? visited[0];
    const highestRated = [...visited]
      .filter((d) => d.rating)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];

    return {
      destinations: visited.length,
      states: states.size,
      countries: countries.size,
      memories: yearMemories.length,
      trips: yearTrips.length,
      travelDays,
      favorite,
      highestRated,
    };
  }, [destinations, memories, trips, year]);

  const hasHandle = Boolean(user.handle);
  const isPublic = user.visibility === "public";
  const shareLink = hasHandle
    ? `${window.location.origin}/u/${encodeURIComponent(user.handle)}`
    : "";
  const shareText = `My ${year} in travel: ${recap.destinations} ${
    recap.destinations === 1 ? "destination" : "destinations"
  }, ${recap.countries} ${
    recap.countries === 1 ? "country" : "countries"
  } and ${recap.travelDays} days on the road. Follow my journey on Travel Diaries:`;
  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(shareLink);
      pushToast("Link copied to clipboard", "success");
    } catch {
      pushToast("Couldn't copy the link — please copy it manually.", "error");
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({
        title: `My ${year} in travel`,
        text: shareText,
        url: shareLink,
      });
    } catch (err) {
      // The user dismissing the share sheet is not an error.
      if (err instanceof DOMException && err.name === "AbortError") return;
      pushToast("Couldn't open the share sheet on this device.", "error");
    }
  };

  return (
    <div>
      <TopBar
        title={`My ${year}`}
        subtitle="A beautiful recap of your year in travel."
      />
      <div className="px-5 md:px-8 pb-10 max-w-3xl">
        {years.length > 1 && (
          <div
            className="flex flex-wrap gap-2 mb-5"
            role="group"
            aria-label="Select recap year"
          >
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                aria-pressed={y === year}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  y === year
                    ? "bg-forest-500 text-white"
                    : "border border-ink/12 dark:border-white/15 hover:bg-ink/5 dark:hover:bg-white/5"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        )}

        <motion.div
          key={year}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-forest-500 via-forest-600 to-sky-600 text-white p-8 md:p-10"
        >
          {recap.favorite?.heroImageUrl && (
            <img
              src={recap.favorite.heroImageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
          )}
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.2em] opacity-80 mb-2">
              Travel Recap
            </p>
            <h2 className="font-display text-4xl md:text-5xl mb-6">{year}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
              <RecapStat value={recap.destinations} label="Destinations" />
              <RecapStat value={recap.states} label="States" />
              <RecapStat value={recap.countries} label="Countries" />
              <RecapStat value={recap.memories} label="Memories" />
              <RecapStat value={recap.trips} label="Trips" />
              <RecapStat value={recap.travelDays} label="Travel Days" />
            </div>
            {recap.destinations === 0 && (
              <p className="text-sm opacity-90">
                No visited destinations logged for {year} yet — mark places as
                visited to fill in your recap.
              </p>
            )}
            {recap.favorite && (
              <p className="text-sm opacity-90 flex items-center gap-1.5 mb-1">
                <MapPin size={13} /> Favorite destination:{" "}
                <strong>{recap.favorite.name}</strong>
              </p>
            )}
            {recap.highestRated && (
              <p className="text-sm opacity-90 flex items-center gap-1.5">
                <Star size={13} className="fill-white" /> Highest rated trip:{" "}
                <strong>{recap.highestRated.name}</strong> (
                {recap.highestRated.rating}/5)
              </p>
            )}
          </div>
        </motion.div>

        <div className="rounded-3xl border border-ink/8 dark:border-white/10 bg-white dark:bg-[#1c2024] p-6 mb-6">
          <h3 className="font-display text-lg mb-1">Share My {year}</h3>
          <p className="text-sm text-ink-soft dark:text-white/50 mb-4">
            Let friends discover your travel journey and start their own map.
          </p>

          {!hasHandle ? (
            <Notice>
              You don't have a public handle yet, so there's no link to share.{" "}
              <Link
                to="/app/settings"
                className="font-semibold text-forest-600 dark:text-forest-400 underline"
              >
                Set one up in Settings
              </Link>
              .
            </Notice>
          ) : (
            <>
              {!isPublic && (
                <Notice>
                  Your journey is currently{" "}
                  <strong>{user.visibility}</strong>, so this link will show a
                  "private" page to anyone who opens it. It will work once you
                  make your journey public in{" "}
                  <Link
                    to="/app/settings"
                    className="font-semibold text-forest-600 dark:text-forest-400 underline"
                  >
                    Settings
                  </Link>
                  .
                </Notice>
              )}
              <div className="flex items-center gap-2 mb-4 px-3.5 py-2 rounded-full bg-ink/5 dark:bg-white/5 text-xs text-ink-soft dark:text-white/60 min-w-0">
                <Link2 size={13} className="shrink-0" />
                <span className="truncate">{shareLink}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <ShareButton
                  icon={<MessageCircle size={14} />}
                  label="WhatsApp"
                  onClick={() =>
                    openShareWindow(
                      `https://wa.me/?text=${encodeURIComponent(
                        `${shareText} ${shareLink}`,
                      )}`,
                    )
                  }
                />
                <ShareButton
                  icon={<Link2 size={14} />}
                  label="X"
                  onClick={() =>
                    openShareWindow(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        shareText,
                      )}&url=${encodeURIComponent(shareLink)}`,
                    )
                  }
                />
                <ShareButton
                  icon={<Users2 size={14} />}
                  label="Facebook"
                  onClick={() =>
                    openShareWindow(
                      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        shareLink,
                      )}`,
                    )
                  }
                />
                {canNativeShare && (
                  <ShareButton
                    icon={<Share2 size={14} />}
                    label="More…"
                    onClick={() => void nativeShare()}
                  />
                )}
                <ShareButton
                  icon={<Copy size={14} />}
                  label="Copy Link"
                  onClick={() => void copyLink()}
                />
              </div>
            </>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <RecapCard
            title={`I explored ${recap.states} ${
              recap.states === 1 ? "state" : "states"
            } in ${year}.`}
            sub={`Across ${recap.countries} ${
              recap.countries === 1 ? "country" : "countries"
            }`}
          />
          <RecapCard
            title={`My ${year} travel map.`}
            sub={`${recap.destinations} destinations, ${recap.memories} memories`}
          />
          <RecapCard
            title="My top destination this year."
            sub={recap.favorite?.name ?? "—"}
          />
          <RecapCard
            title={`${recap.travelDays} days on the road.`}
            sub="Total travel days"
          />
        </div>
      </div>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-400/10 px-3.5 py-2.5 rounded-xl mb-4">
      <Info size={14} className="shrink-0 mt-px" />
      <span>{children}</span>
    </p>
  );
}

function RecapStat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <AnimatedCounter value={value} className="font-display text-3xl" />
      <p className="text-xs opacity-75 mt-0.5">{label}</p>
    </div>
  );
}

function ShareButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-ink/12 dark:border-white/15 text-xs font-semibold hover:bg-ink/5 dark:hover:bg-white/5 transition"
    >
      {icon} {label}
    </button>
  );
}

function RecapCard({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-ink/8 dark:border-white/10 bg-white dark:bg-[#1c2024] p-5 flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-amber-400/15 text-amber-600 flex items-center justify-center shrink-0">
        <Camera size={16} />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-ink-soft dark:text-white/50 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
