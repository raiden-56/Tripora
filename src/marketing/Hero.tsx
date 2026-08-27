import { motion } from "framer-motion";
import { Compass, PlayCircle } from "lucide-react";
import { TravelMap } from "../components/map/TravelMap";
import { heroDestinations } from "./shared/marketingData";
import { memories } from "../data/mockData";
import { AnimatedCounter } from "../components/common/AnimatedCounter";

const FLOATING_CARDS = [
  { label: "37 destinations", top: "8%", left: "4%", delay: 0.6 },
  { label: "12 states explored", top: "14%", right: "3%", delay: 0.8 },
  { label: "1,284 memories", bottom: "20%", left: "2%", delay: 1.0 },
  { label: "Next trip: Goa", bottom: "8%", right: "6%", delay: 1.2 },
];

export function Hero({ onStartJourney }: { onStartJourney: () => void }) {
  const memoryCounts = memories.reduce<Record<string, number>>((acc, m) => {
    acc[m.destinationId] = (acc[m.destinationId] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section
      id="top"
      className="relative pt-28 md:pt-36 pb-20 px-6 md:px-10 max-w-7xl mx-auto"
    >
      <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 dark:bg-white/10 text-forest-600 dark:text-forest-400 text-xs font-semibold mb-6"
          >
            <Compass size={12} /> Your personal travel memory map
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-5xl md:text-7xl leading-[1.02] tracking-tight text-ink dark:text-white mb-6"
          >
            Your journey,
            <br />
            beautifully mapped.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-ink-soft dark:text-white/60 text-lg max-w-md mb-9"
          >
            Every destination you've visited. Every memory you've captured.
            Every adventure still waiting for you.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-wrap gap-3 mb-12"
          >
            <button
              onClick={onStartJourney}
              className="px-7 py-3.5 rounded-full bg-forest-500 text-white text-sm font-semibold shadow-soft-lg hover:bg-forest-600 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Start Your Journey
            </button>
            <a
              href="#product"
              className="flex items-center gap-2 px-7 py-3.5 rounded-full border border-ink/15 dark:border-white/20 text-sm font-semibold hover:bg-ink/5 dark:hover:bg-white/5 transition"
            >
              <PlayCircle size={16} /> Explore the Journey
            </a>
          </motion.div>
          <div className="flex gap-9">
            {[
              { value: 4, label: "Countries" },
              { value: 37, label: "Destinations" },
              { value: 1284, label: "Memories" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
              >
                <AnimatedCounter
                  value={s.value}
                  className="font-display text-3xl text-ink dark:text-white"
                />
                <p className="text-xs text-ink-soft dark:text-white/50 mt-0.5">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-[420px] md:h-[520px] rounded-[2rem] overflow-hidden shadow-soft-lg border border-ink/8 dark:border-white/10"
        >
          <TravelMap
            destinations={heroDestinations}
            viewMode="world"
            selectedId={null}
            memoryCounts={memoryCounts}
            onSelect={() => {}}
          />
          <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 rounded-[2rem]" />
          {FLOATING_CARDS.map((c) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: c.delay,
                type: "spring",
                stiffness: 200,
                damping: 18,
              }}
              style={{
                top: c.top,
                left: c.left,
                right: c.right,
                bottom: c.bottom,
              }}
              className="absolute z-[400] px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-[#1c2024]/90 backdrop-blur shadow-soft-lg text-xs font-semibold text-ink dark:text-white pointer-events-none"
            >
              {c.label}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
