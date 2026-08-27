import { useMemo } from "react";
import { motion } from "framer-motion";
import { Compass, Heart, MapPin } from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { EmptyState } from "../components/common/EmptyState";
import { useAppStore } from "../store/useAppStore";
import type { Destination } from "../types";
import { getBecauseYouLoved } from "../utils/recommendations";

function Row({
  title,
  subtitle,
  items,
  onSelect,
}: {
  title: string;
  subtitle?: string;
  items: Destination[];
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-9">
      <h2 className="font-display text-lg mb-0.5">{title}</h2>
      {subtitle && (
        <p className="text-xs text-ink-soft dark:text-white/50 mb-3.5">
          {subtitle}
        </p>
      )}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5 md:mx-0 md:px-0">
        {items.map((d, i) => (
          <motion.button
            key={d.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.3) }}
            onClick={() => onSelect(d.id)}
            className="shrink-0 w-52 text-left rounded-2xl overflow-hidden bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft hover:shadow-soft-lg transition-shadow"
          >
            <div className="relative h-28">
              <img
                src={d.heroImageUrl}
                alt={d.name}
                className="w-full h-full object-cover"
              />
              {d.isFavorite && (
                <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 dark:bg-black/60 flex items-center justify-center">
                  <Heart size={11} className="text-coral-500 fill-coral-500" />
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold truncate">{d.name}</p>
              <p className="text-[11px] text-ink-soft dark:text-white/50 truncate flex items-center gap-1">
                <MapPin size={10} />
                {[d.state, d.country].filter(Boolean).join(", ")}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default function Discover() {
  const destinations = useAppStore((s) => s.destinations);
  const selectDestination = useAppStore((s) => s.selectDestination);
  const openAddDestination = useAppStore((s) => s.openAddDestination);

  const wishlist = useMemo(
    () => destinations.filter((d) => d.status === "wishlist"),
    [destinations],
  );
  const planned = useMemo(
    () => destinations.filter((d) => d.status === "planned"),
    [destinations],
  );
  const trending = useMemo(
    () => [...destinations].slice().reverse().slice(0, 8),
    [destinations],
  );
  const nearBangalore = useMemo(
    () =>
      destinations.filter(
        (d) =>
          Math.abs(d.latitude - 12.9716) < 5 &&
          Math.abs(d.longitude - 77.5946) < 5,
      ),
    [destinations],
  );
  const weekendTrips = useMemo(
    () =>
      destinations
        .filter((d) => d.country === "India" && d.status !== "visited")
        .slice(0, 6),
    [destinations],
  );
  const roadTrips = useMemo(
    () =>
      destinations.filter((d) =>
        ["Karnataka", "Kerala", "Tamil Nadu", "Maharashtra"].includes(
          d.state ?? "",
        ),
      ),
    [destinations],
  );
  const becauseYouLoved = useMemo(
    () => getBecauseYouLoved(destinations),
    [destinations],
  );

  return (
    <div>
      <TopBar
        title="Discover"
        subtitle="Fresh destinations, curated around your journey."
      />
      <div className="px-5 md:px-8 pb-10">
        {destinations.length === 0 ? (
          <EmptyState
            icon={<Compass size={26} />}
            title="Nothing to discover yet"
            description="Add a few destinations to your journey and we'll surface personalized recommendations here."
            actionLabel="Add Destination"
            onAction={() => openAddDestination()}
          />
        ) : (
          <>
            <Row
              title="Trending"
              subtitle="Popular with travelers like you right now."
              items={trending}
              onSelect={selectDestination}
            />
            <Row
              title="Hidden Gems"
              subtitle="Wishlist-worthy places, off the beaten path."
              items={wishlist}
              onSelect={selectDestination}
            />
            <Row
              title="Weekend Trips"
              subtitle="Perfect for a quick 2–3 day escape."
              items={weekendTrips}
              onSelect={selectDestination}
            />
            <Row
              title="Road Trips"
              subtitle="Great for a scenic drive across South India."
              items={roadTrips}
              onSelect={selectDestination}
            />
            <Row
              title="Best This Season"
              subtitle="Ideal to visit around this time of year."
              items={planned}
              onSelect={selectDestination}
            />
            <Row
              title="Near You"
              subtitle="Close to Bangalore, easy to reach."
              items={nearBangalore}
              onSelect={selectDestination}
            />
            <Row
              title="Popular with Travelers"
              items={[...destinations].reverse().slice(0, 8)}
              onSelect={selectDestination}
            />

            {becauseYouLoved.map((group) => (
              <Row
                key={group.loved.id}
                title={`Because you loved ${group.loved.name}`}
                subtitle="Similar destinations based on your favorites."
                items={group.suggestions}
                onSelect={selectDestination}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
