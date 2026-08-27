import { motion } from "framer-motion";
import { SectionHeading } from "./shared/SectionHeading";
import { TIMELINE_MILESTONES } from "./shared/marketingData";

export function TimelineSection() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-10 max-w-6xl mx-auto overflow-hidden">
      <SectionHeading title="Your journey keeps growing." />
      <div className="relative mt-20">
        <div className="hidden md:block absolute top-6 left-[6%] right-[6%] h-px bg-ink/10 dark:bg-white/10" />
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ transformOrigin: "left" }}
          className="hidden md:block absolute top-6 left-[6%] right-[6%] h-px bg-gradient-to-r from-forest-500 to-sky-500"
        />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4">
          {TIMELINE_MILESTONES.map((m, i) => (
            <motion.div
              key={m.year}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12 }}
              className="text-center relative"
            >
              <span className="hidden md:block w-3 h-3 rounded-full bg-forest-500 border-2 border-paper dark:border-[#14171a] mx-auto mb-3 relative z-10" />
              <p className="font-display text-2xl mb-1">{m.year}</p>
              <p className="text-xs text-ink-soft dark:text-white/50">
                {m.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
