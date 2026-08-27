import { motion } from "framer-motion";
import { Banknote, CalendarRange, Compass, Heart, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { getWhatsNext } from "../../utils/recommendations";

export function WhatsNextSection() {
  const destinations = useAppStore((s) => s.destinations);
  const moveToPlanned = useAppStore((s) => s.moveToPlanned);
  const pushToast = useAppStore((s) => s.pushToast);
  const navigate = useNavigate();

  const visitedStates = Array.from(
    new Set(
      destinations
        .filter((d) => d.status === "visited" && d.state)
        .map((d) => d.state),
    ),
  ).slice(0, 3);
  const recommendations = getWhatsNext(destinations, 5);

  if (recommendations.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-xl flex items-center gap-2">
          <Compass size={18} className="text-forest-500" /> What's Next?
        </h2>
      </div>
      {visitedStates.length > 0 && (
        <p className="text-sm text-ink-soft dark:text-white/50 mb-4">
          You've already explored {visitedStates.join(", ")}. Here are
          destinations you might love next.
        </p>
      )}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5 md:mx-0 md:px-0">
        {recommendations.map(
          ({ destination, reason, bestSeason, duration, budget }, i) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="shrink-0 w-72 rounded-3xl overflow-hidden bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft"
            >
              <div className="relative h-32">
                <img
                  src={destination.heroImageUrl}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2.5 left-3.5 text-white">
                  <p className="font-display text-lg leading-tight">
                    {destination.name}
                  </p>
                  <p className="text-[11px] opacity-85">
                    {[destination.state, destination.country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-ink-soft dark:text-white/60 mb-3 line-clamp-2">
                  {reason}
                </p>
                <div className="flex flex-col gap-1.5 text-[11px] text-ink-soft dark:text-white/50 mb-3.5">
                  <span className="flex items-center gap-1.5">
                    <Sun size={11} /> Best season: {bestSeason}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarRange size={11} /> {duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Banknote size={11} /> {budget}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      pushToast(
                        `${destination.name} added to wishlist`,
                        "success",
                      )
                    }
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full border border-ink/15 dark:border-white/20 text-xs font-semibold hover:bg-ink/5 dark:hover:bg-white/5"
                  >
                    <Heart size={11} /> Wishlist
                  </button>
                  <button
                    onClick={() => {
                      moveToPlanned(destination.id);
                      navigate("/app/trips");
                    }}
                    className="flex-1 py-1.5 rounded-full bg-forest-500 text-white text-xs font-semibold hover:bg-forest-600"
                  >
                    Plan Trip
                  </button>
                </div>
              </div>
            </motion.div>
          ),
        )}
      </div>
    </div>
  );
}
