import { motion } from "framer-motion";
import { Heart, MapPin, Star } from "lucide-react";
import clsx from "clsx";
import type { Destination } from "../../types";
import { StatusBadge } from "../common/StatusBadge";

export function DestinationCard({
  destination,
  onClick,
  memoryCount = 0,
}: {
  destination: Destination;
  onClick: () => void;
  memoryCount?: number;
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      onClick={onClick}
      className="group text-left rounded-3xl overflow-hidden bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft hover:shadow-soft-lg transition-shadow"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={destination.heroImageUrl}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5">
          <StatusBadge
            status={destination.status}
            className="bg-white/90 dark:bg-black/60 backdrop-blur"
          />
        </div>
        {destination.isFavorite && (
          <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur flex items-center justify-center">
            <Heart size={13} className="text-coral-500 fill-coral-500" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base leading-tight">
            {destination.name}
          </h3>
          {destination.rating && (
            <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-600 shrink-0">
              <Star size={12} className="fill-amber-500 text-amber-500" />{" "}
              {destination.rating}
            </span>
          )}
        </div>
        <p className="flex items-center gap-1 text-xs text-ink-soft dark:text-white/50 mt-1">
          <MapPin size={11} />
          {[destination.state, destination.country].filter(Boolean).join(", ")}
        </p>
        <div
          className={clsx(
            "flex items-center justify-between mt-3 pt-3 border-t border-ink/6 dark:border-white/10 text-xs text-ink-soft dark:text-white/50",
          )}
        >
          <span>
            {destination.visitedFrom
              ? new Date(destination.visitedFrom).toLocaleDateString(
                  undefined,
                  { month: "short", year: "numeric" },
                )
              : "Not scheduled"}
          </span>
          <span>{memoryCount} memories</span>
        </div>
      </div>
    </motion.button>
  );
}
