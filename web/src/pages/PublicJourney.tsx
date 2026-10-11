import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Camera,
  Flag,
  Home,
  Landmark,
  Loader2,
  Lock,
  MapPin,
  Plane,
  Star,
} from "lucide-react";
import { Logo } from "../components/common/Logo";
import { StatCard } from "../components/common/StatCard";
import { EmptyState } from "../components/common/EmptyState";
import { StatusBadge } from "../components/common/StatusBadge";
import { TravelMap } from "../components/map/TravelMap";
import { resolveAvatarUrl } from "../utils/avatar";
import { getPublicJourney, type PublicJourney as Journey } from "../api/public.api";
import { ApiError } from "../api/client";
import type { Destination } from "../types";

type LoadResult =
  | { handle: string; kind: "ok"; journey: Journey }
  | { handle: string; kind: "not-found" }
  | { handle: string; kind: "error" };

const DEFAULT_TITLE = "Travel Diaries";

export default function PublicJourney() {
  const { handle = "" } = useParams();
  const [result, setResult] = useState<LoadResult | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!handle) return;
    let cancelled = false;
    getPublicJourney(handle)
      .then((journey) => {
        if (!cancelled) setResult({ handle, kind: "ok", journey });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const notFound = err instanceof ApiError && err.status === 404;
        setResult({ handle, kind: notFound ? "not-found" : "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [handle, reloadKey]);

  // A result for a previous handle (or a pending retry) counts as loading.
  const current =
    !handle
      ? ({ handle, kind: "not-found" } as const)
      : result && result.handle === handle
        ? result
        : null;

  const journeyName = current?.kind === "ok" ? current.journey.name : null;
  useEffect(() => {
    if (!journeyName) return;
    const previous = document.title;
    document.title = `${journeyName}'s journey · Travel Diaries`;
    return () => {
      document.title = previous || DEFAULT_TITLE;
    };
  }, [journeyName]);

  const retry = () => {
    setResult(null);
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-paper dark:bg-[#14171a] text-ink dark:text-white">
      <header className="flex items-center justify-between px-6 md:px-10 py-5 max-w-5xl mx-auto">
        <Link to="/" aria-label="Travel Diaries home">
          <Logo />
        </Link>
        <span className="text-xs text-ink-soft dark:text-white/50">
          Public Journey
        </span>
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-10 pb-16">
        {!current ? (
          <div className="flex justify-center py-24" role="status">
            <Loader2 className="animate-spin text-forest-500" size={24} />
            <span className="sr-only">Loading journey…</span>
          </div>
        ) : current.kind === "not-found" ? (
          <div className="py-12">
            <EmptyState
              icon={<Lock size={24} />}
              title="This journey is private or doesn't exist"
              description="The traveler may have kept their journey private, or the link may be mistyped."
            />
            <div className="flex justify-center mt-6">
              <Link
                to="/"
                className="px-5 py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition"
              >
                Go to Travel Diaries
              </Link>
            </div>
          </div>
        ) : current.kind === "error" ? (
          <div className="py-12 text-center">
            <p className="text-sm text-coral-500 bg-coral-500/10 px-4 py-3 rounded-xl mb-5 inline-block">
              We couldn't load this journey right now. Please try again shortly.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={retry}
                className="px-5 py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition"
              >
                Try again
              </button>
              <Link
                to="/"
                className="px-5 py-2.5 rounded-full border border-ink/12 dark:border-white/15 text-sm font-semibold hover:bg-ink/5 dark:hover:bg-white/5 transition"
              >
                Go home
              </Link>
            </div>
          </div>
        ) : (
          <JourneyView journey={current.journey} />
        )}
      </main>
    </div>
  );
}

function JourneyView({ journey }: { journey: Journey }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visited = useMemo(
    () => journey.destinations.filter((d) => d.status === "visited"),
    [journey.destinations],
  );
  const stats = useMemo(
    () => ({
      destinations: visited.length,
      countries: new Set(visited.map((d) => d.country)).size,
      states: new Set(visited.filter((d) => d.state).map((d) => d.state)).size,
    }),
    [visited],
  );
  const memoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of journey.memories) {
      counts[m.destinationId] = (counts[m.destinationId] ?? 0) + 1;
    }
    return counts;
  }, [journey.memories]);
  const destinationNames = useMemo(
    () => new Map(journey.destinations.map((d) => [d.id, d.name])),
    [journey.destinations],
  );
  const viewMode =
    journey.destinations.length > 0 &&
    journey.destinations.every((d) => d.country.toLowerCase() === "india")
      ? "india"
      : "world";
  const places = useMemo(
    () =>
      [...journey.destinations].sort(
        (a, b) =>
          statusRank(a) - statusRank(b) ||
          (b.visitedFrom ?? "").localeCompare(a.visitedFrom ?? ""),
      ),
    [journey.destinations],
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8"
      >
        <img
          src={resolveAvatarUrl(journey.avatarUrl ?? undefined, journey.name)}
          alt={journey.name}
          className="w-20 h-20 rounded-2xl object-cover shrink-0"
        />
        <div className="min-w-0">
          <h1 className="font-display text-3xl">{journey.name}'s journey</h1>
          <p className="text-sm text-ink-soft dark:text-white/50">
            @{journey.handle}
          </p>
          {journey.bio && (
            <p className="text-ink-soft dark:text-white/60 italic mt-1">
              “{journey.bio}”
            </p>
          )}
          {journey.homeLocation && (
            <p className="text-xs text-ink-soft dark:text-white/50 mt-1.5 flex items-center gap-1">
              <Home size={12} /> {journey.homeLocation}
            </p>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        <StatCard
          label="Visited"
          value={stats.destinations}
          icon={<MapPin size={14} />}
        />
        <StatCard
          label="Countries"
          value={stats.countries}
          icon={<Flag size={14} />}
          delay={0.04}
        />
        <StatCard
          label="States"
          value={stats.states}
          icon={<Landmark size={14} />}
          delay={0.08}
        />
        <StatCard
          label="Memories"
          value={journey.memories.length}
          icon={<Camera size={14} />}
          delay={0.12}
        />
        <StatCard
          label="Trips"
          value={journey.tripsCompleted}
          icon={<Plane size={14} />}
          delay={0.16}
        />
        <StatCard
          label="Travel Days"
          value={journey.travelDays}
          icon={<Calendar size={14} />}
          delay={0.2}
        />
      </div>

      <h2 className="font-display text-xl mb-4">Places</h2>
      {journey.destinations.length === 0 ? (
        <div className="mb-10">
          <EmptyState
            compact
            icon={<MapPin size={20} />}
            title="No places yet"
            description="This traveler hasn't added any destinations yet."
          />
        </div>
      ) : (
        <>
          <div className="relative h-[340px] md:h-[420px] rounded-3xl overflow-hidden border border-ink/8 dark:border-white/10 shadow-soft mb-5">
            <TravelMap
              destinations={journey.destinations}
              viewMode={viewMode}
              selectedId={selectedId}
              memoryCounts={memoryCounts}
              onSelect={setSelectedId}
            />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
            {places.map((d) => (
              <PlaceItem
                key={d.id}
                destination={d}
                memoryCount={memoryCounts[d.id] ?? 0}
                selected={d.id === selectedId}
                onSelect={() => setSelectedId(d.id)}
              />
            ))}
          </div>
        </>
      )}

      <h2 className="font-display text-xl mb-4">Memories</h2>
      {journey.memories.length === 0 ? (
        <EmptyState
          compact
          icon={<Camera size={20} />}
          title="No memories shared yet"
          description="Photos and stories from this journey will appear here."
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {journey.memories.map((m, i) => (
            <motion.figure
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 12) * 0.03 }}
              className="rounded-2xl overflow-hidden bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft"
            >
              {m.imageUrl ? (
                <img
                  src={m.imageUrl}
                  alt={m.title}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover"
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-forest-50 dark:bg-white/5 flex items-center justify-center text-forest-500">
                  <Camera size={22} />
                </div>
              )}
              <figcaption className="p-3">
                <p className="text-sm font-semibold truncate">{m.title}</p>
                <p className="text-xs text-ink-soft dark:text-white/50 mt-0.5 truncate">
                  {[destinationNames.get(m.destinationId), formatDate(m.date)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {m.description && (
                  <p className="text-xs text-ink-soft dark:text-white/60 mt-1.5 line-clamp-2">
                    {m.description}
                  </p>
                )}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      )}

      <div className="mt-14 text-center">
        <p className="text-sm text-ink-soft dark:text-white/50 mb-3">
          Inspired? Start mapping your own travels.
        </p>
        <Link
          to="/signup"
          className="inline-block px-5 py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition"
        >
          Create your Travel Diary
        </Link>
      </div>
    </>
  );
}

function PlaceItem({
  destination: d,
  memoryCount,
  selected,
  onSelect,
}: {
  destination: Destination;
  memoryCount: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex items-center gap-3 p-3 rounded-2xl text-left bg-white dark:bg-[#1c2024] border transition ${
        selected
          ? "border-forest-500 ring-1 ring-forest-500"
          : "border-ink/8 dark:border-white/10 hover:border-forest-500/50"
      }`}
    >
      {d.heroImageUrl ? (
        <img
          src={d.heroImageUrl}
          alt=""
          loading="lazy"
          className="w-14 h-14 rounded-xl object-cover shrink-0"
        />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-forest-50 dark:bg-white/10 flex items-center justify-center text-forest-500 shrink-0">
          <MapPin size={18} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate flex items-center gap-1">
          {d.name}
          {d.isFavorite && (
            <Star
              size={12}
              className="text-amber-500 fill-amber-500 shrink-0"
              aria-label="Favorite"
            />
          )}
        </p>
        <p className="text-xs text-ink-soft dark:text-white/50 truncate">
          {[d.state, d.country].filter(Boolean).join(", ")}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <StatusBadge status={d.status} />
          {memoryCount > 0 && (
            <span className="text-[11px] text-ink-soft dark:text-white/50 flex items-center gap-0.5">
              <Camera size={11} /> {memoryCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function statusRank(d: Destination): number {
  return d.status === "visited" ? 0 : d.status === "planned" ? 1 : 2;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}
