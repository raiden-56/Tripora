import { motion } from "framer-motion";
import { Heart, Plane } from "lucide-react";
import { SectionHeading } from "./shared/SectionHeading";
import { BUCKET_LIST, UPCOMING_PREVIEW } from "./shared/marketingData";
import { StatusBadge } from "../components/common/StatusBadge";

export function UpcomingBucketSection({
  onStartJourney,
}: {
  onStartJourney: () => void;
}) {
  return (
    <section className="py-24 md:py-32 px-6 md:px-10 max-w-6xl mx-auto">
      <SectionHeading
        eyebrow="What's ahead"
        title="Your next chapter is already waiting."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-14 mb-6">
        {UPCOMING_PREVIEW.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.08 }}
            className="p-5 rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft"
          >
            <Plane size={16} className="text-sky-500 mb-3" />
            <p className="font-display text-lg">{t.name}</p>
            <p className="text-xs text-ink-soft dark:text-white/50 mb-3">
              {t.when}
            </p>
            <StatusBadge status={t.status} />
          </motion.div>
        ))}
      </div>
      <div className="text-center mb-20">
        <button
          onClick={onStartJourney}
          className="px-6 py-2.5 rounded-full border border-ink/15 dark:border-white/20 text-sm font-semibold hover:bg-ink/5 dark:hover:bg-white/5 transition"
        >
          Plan Your Next Trip
        </button>
      </div>

      <SectionHeading
        eyebrow="Travel bucket list"
        title="Places you're dreaming about."
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
        {BUCKET_LIST.map((d, i) => (
          <motion.div
            key={d.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl overflow-hidden bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft"
          >
            <img
              src={d.image}
              alt={d.name}
              className="w-full h-28 object-cover"
            />
            <div className="p-3.5">
              <p className="font-semibold text-sm">{d.name}</p>
              <p className="text-[11px] text-ink-soft dark:text-white/50 mb-3">
                Best season: {d.season}
              </p>
              <button
                onClick={onStartJourney}
                className="w-full flex items-center justify-center gap-1 py-1.5 rounded-full bg-amber-400/15 text-amber-600 text-xs font-semibold hover:bg-amber-400/25 transition"
              >
                <Heart size={11} /> Add to Wishlist
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
