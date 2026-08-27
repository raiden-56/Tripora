import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SectionHeading } from "./shared/SectionHeading";

export function RecapSection({
  onStartJourney,
}: {
  onStartJourney: () => void;
}) {
  return (
    <section className="py-24 md:py-32 px-6 md:px-10 max-w-5xl mx-auto">
      <SectionHeading title="Your year in travel." />
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mt-14 relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-forest-500 via-forest-600 to-sky-600 text-white p-10 md:p-14"
      >
        <Sparkles className="absolute right-8 top-8 opacity-25" size={72} />
        <p className="text-xs uppercase tracking-[0.25em] opacity-80 mb-2">
          Travel Recap
        </p>
        <h3 className="font-display text-5xl md:text-6xl mb-8">MY 2026</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 max-w-lg">
          {[
            { value: "12", label: "States" },
            { value: "37", label: "Destinations" },
            { value: "18", label: "Trips" },
            { value: "1,284", label: "Memories" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl">{s.value}</p>
              <p className="text-xs opacity-75 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <button
          onClick={onStartJourney}
          className="px-6 py-3 rounded-full bg-white text-forest-600 text-sm font-semibold shadow-soft-lg hover:opacity-90 transition"
        >
          Create Your Travel Story
        </button>
      </motion.div>
    </section>
  );
}
