import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Copy,
  Images,
  Link2,
  MapPin,
  MessageCircle,
  Star,
  Users2,
} from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { AnimatedCounter } from "../components/common/AnimatedCounter";
import { useAppStore } from "../store/useAppStore";

export default function YearlyRecap() {
  const destinations = useAppStore((s) => s.destinations);
  const trips = useAppStore((s) => s.trips);
  const memories = useAppStore((s) => s.memories);
  const pushToast = useAppStore((s) => s.pushToast);

  const year = "2026";
  const recap = useMemo(() => {
    const visited = destinations.filter(
      (d) => d.status === "visited" && d.visitedFrom?.startsWith(year),
    );
    const states = new Set(visited.filter((d) => d.state).map((d) => d.state));
    const countries = new Set(visited.map((d) => d.country));
    const yearMemories = memories.filter((m) => m.date.startsWith(year));
    const yearTrips = trips.filter((t) => t.startDate.startsWith(year));
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
    const highestRated = [...visited].sort(
      (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
    )[0];

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
  }, [destinations, memories, trips]);

  const shareLink = `https://travelcanvas.app/journey/ganesh/${year}`;

  const share = (channel: string) => {
    if (channel === "Copy Link") {
      navigator.clipboard?.writeText(shareLink).catch(() => {});
      pushToast("Link copied to clipboard", "success");
      return;
    }
    pushToast(`Sharing to ${channel} is mocked in this demo.`, "info");
  };

  return (
    <div>
      <TopBar
        title={`My ${year}`}
        subtitle="A beautiful recap of your year in travel."
      />
      <div className="px-5 md:px-8 pb-10 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-forest-500 via-forest-600 to-sky-600 text-white p-8 md:p-10"
        >
          {recap.favorite && (
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
            Let friends discover your travel year and start their own map.
          </p>
          <div className="flex flex-wrap gap-2">
            <ShareButton
              icon={<MessageCircle size={14} />}
              label="WhatsApp"
              onClick={() => share("WhatsApp")}
            />
            <ShareButton
              icon={<Images size={14} />}
              label="Instagram"
              onClick={() => share("Instagram")}
            />
            <ShareButton
              icon={<Link2 size={14} />}
              label="X"
              onClick={() => share("X")}
            />
            <ShareButton
              icon={<Users2 size={14} />}
              label="Facebook"
              onClick={() => share("Facebook")}
            />
            <ShareButton
              icon={<Copy size={14} />}
              label="Copy Link"
              onClick={() => share("Copy Link")}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <RecapCard
            title={`I've explored ${recap.states} states in India.`}
            sub="India Explorer"
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
