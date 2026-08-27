import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "./shared/SectionHeading";
import { INDIA_STATES } from "../data/indiaStates";
import { destinations } from "../data/mockData";

const EXPLORED_STATES = [
  "Karnataka",
  "Kerala",
  "Goa",
  "Tamil Nadu",
  "Maharashtra",
  "Rajasthan",
  "Himachal Pradesh",
  "Andaman and Nicobar Islands",
  "Uttarakhand",
  "Delhi",
  "Gujarat",
  "West Bengal",
];

export function ExplorerSection({
  onStartJourney,
}: {
  onStartJourney: () => void;
}) {
  const [mode, setMode] = useState<"india" | "world">("india");
  const pct = Math.round((EXPLORED_STATES.length / INDIA_STATES.length) * 100);
  const countries = new Set(destinations.map((d) => d.country));

  return (
    <section className="py-24 md:py-32 px-6 md:px-10 max-w-6xl mx-auto">
      <div className="flex flex-col items-center">
        <SectionHeading
          title={
            mode === "india"
              ? "How much of India have you explored?"
              : "And there's a whole world waiting."
          }
        />
        <div className="flex gap-1.5 mt-8 bg-ink/5 dark:bg-white/5 p-1 rounded-full">
          <button
            onClick={() => setMode("india")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${mode === "india" ? "bg-white dark:bg-[#1c2024] shadow-soft" : "text-ink-soft dark:text-white/50"}`}
          >
            India Explorer
          </button>
          <button
            onClick={() => setMode("world")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${mode === "world" ? "bg-white dark:bg-[#1c2024] shadow-soft" : "text-ink-soft dark:text-white/50"}`}
          >
            World Explorer
          </button>
        </div>
      </div>

      {mode === "india" ? (
        <motion.div
          key="india"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-14"
        >
          <div className="max-w-md mx-auto mb-10 text-center">
            <p className="font-display text-4xl mb-1">
              {EXPLORED_STATES.length} / {INDIA_STATES.length}
            </p>
            <p className="text-sm text-ink-soft dark:text-white/50 mb-4">
              States &amp; UTs explored — {pct}% of India
            </p>
            <div className="h-2.5 rounded-full bg-ink/8 dark:bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-forest-400 to-forest-600 rounded-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-w-3xl mx-auto">
            {INDIA_STATES.slice(0, 18).map((s, i) => {
              const explored = EXPLORED_STATES.includes(s.name);
              return (
                <motion.span
                  key={s.name}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.03 }}
                  className={`px-2.5 py-2 rounded-xl text-center text-[11px] font-semibold truncate ${
                    explored
                      ? "bg-forest-50 text-forest-600 dark:bg-forest-500/15 dark:text-forest-400"
                      : "bg-ink/[0.03] text-ink-soft dark:bg-white/5 dark:text-white/40"
                  }`}
                >
                  {s.name}
                </motion.span>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={onStartJourney}
              className="px-7 py-3 rounded-full bg-forest-500 text-white text-sm font-semibold shadow-soft hover:bg-forest-600 transition"
            >
              Start Exploring India
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="world"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-14"
        >
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-10 text-center">
            <div>
              <p className="font-display text-3xl">{countries.size}</p>
              <p className="text-xs text-ink-soft dark:text-white/50 mt-0.5">
                Countries
              </p>
            </div>
            <div>
              <p className="font-display text-3xl">2</p>
              <p className="text-xs text-ink-soft dark:text-white/50 mt-0.5">
                Continents
              </p>
            </div>
            <div>
              <p className="font-display text-3xl">37</p>
              <p className="text-xs text-ink-soft dark:text-white/50 mt-0.5">
                Destinations
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap max-w-2xl mx-auto">
            {["India", "Singapore", "Bali", "Dubai", "Europe"].map(
              (place, i) => (
                <motion.div
                  key={place}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <span className="px-4 py-2 rounded-full bg-white dark:bg-[#1c2024] border border-ink/10 dark:border-white/10 shadow-soft text-sm font-semibold">
                    {place}
                  </span>
                  {i < 4 && (
                    <span className="w-6 h-px bg-ink/20 dark:bg-white/20" />
                  )}
                </motion.div>
              ),
            )}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={onStartJourney}
              className="px-7 py-3 rounded-full bg-forest-500 text-white text-sm font-semibold shadow-soft hover:bg-forest-600 transition"
            >
              See Your World Map
            </button>
          </div>
        </motion.div>
      )}
    </section>
  );
}
