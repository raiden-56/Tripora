import { motion } from "framer-motion";
import { SectionHeading } from "./shared/SectionHeading";
import { AnimatedCounter } from "../components/common/AnimatedCounter";

const STATS = [
  { value: 37, label: "Destinations" },
  { value: 12, label: "States" },
  { value: 4, label: "Countries" },
  { value: 18, label: "Trips" },
  { value: 1284, label: "Memories" },
  { value: 4280, label: "km Travelled", suffix: " km" },
];

export function StatisticsSection() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-10 max-w-6xl mx-auto">
      <SectionHeading
        eyebrow="Travel statistics"
        title="Your travels, measured beautifully."
      />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-14">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.06 }}
            className="p-7 rounded-3xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft text-center"
          >
            <AnimatedCounter
              value={s.value}
              suffix={s.suffix}
              className="font-display text-4xl text-ink dark:text-white"
            />
            <p className="text-sm text-ink-soft dark:text-white/50 mt-1.5">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
