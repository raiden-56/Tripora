import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { destinations } from "../data/mockData";

export function FinalCTASection({
  onStartJourney,
  onExploreDemo,
}: {
  onStartJourney: () => void;
  onExploreDemo: () => void;
}) {
  const bg =
    destinations.find((d) => d.id === "bali")?.heroImageUrl ??
    destinations[0].heroImageUrl;

  return (
    <section className="relative py-32 md:py-44 px-6 md:px-10 overflow-hidden">
      <img
        src={bg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-ink/70" />
      {[...Array(14)].map((_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.5, 0], y: -120 }}
          transition={{
            duration: 6 + (i % 5),
            repeat: Infinity,
            delay: i * 0.6,
            ease: "easeInOut",
          }}
          className="absolute w-1 h-1 rounded-full bg-white/70"
          style={{ left: `${(i * 7.2) % 100}%`, bottom: "10%" }}
        />
      ))}
      <div className="relative max-w-2xl mx-auto text-center text-white">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-5xl md:text-6xl leading-[1.05] mb-6"
        >
          Your next memory
          <br />
          is waiting.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-white/75 text-lg mb-9"
        >
          Start mapping the places that made you who you are.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3"
        >
          <button
            onClick={onStartJourney}
            className="px-7 py-3.5 rounded-full bg-forest-500 text-white text-sm font-semibold shadow-soft-lg hover:bg-forest-600 transition"
          >
            Start Your Journey
          </button>
          <button
            onClick={onExploreDemo}
            className="flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition"
          >
            <PlayCircle size={16} /> Explore Demo
          </button>
        </motion.div>
      </div>
    </section>
  );
}
