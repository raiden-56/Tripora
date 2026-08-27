import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { SCATTERED_SOURCES } from "./shared/marketingData";
import { SectionHeading } from "./shared/SectionHeading";
import { Logo } from "../components/common/Logo";

const POSITIONS = [
  { top: "4%", left: "8%" },
  { top: "2%", left: "62%" },
  { top: "30%", left: "2%" },
  { top: "28%", left: "82%" },
  { top: "62%", left: "6%" },
  { top: "68%", left: "76%" },
  { top: "88%", left: "30%" },
  { top: "86%", left: "56%" },
];

export function ProblemSection() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-10 max-w-6xl mx-auto">
      <SectionHeading
        title={
          <>
            Your memories are everywhere.
            <br />
            Your journey isn't.
          </>
        }
      />

      <div className="relative h-[380px] md:h-[440px] mt-16">
        {SCATTERED_SOURCES.map((source, i) => (
          <motion.div
            key={source}
            initial={{ opacity: 0, scale: 0.7, x: 0, y: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            style={POSITIONS[i]}
            className="absolute px-4 py-2 rounded-full bg-white dark:bg-[#1c2024] border border-ink/10 dark:border-white/10 shadow-soft text-xs md:text-sm font-semibold text-ink-soft dark:text-white/60"
          >
            {source}
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{
            delay: 0.55,
            duration: 0.6,
            type: "spring",
            stiffness: 140,
            damping: 16,
          }}
          className="absolute inset-0 m-auto w-64 h-40 md:w-72 md:h-44 rounded-3xl bg-gradient-to-br from-forest-500 to-forest-600 shadow-soft-lg flex flex-col items-center justify-center text-white gap-2"
        >
          <Logo light />
          <p className="text-xs text-white/80 flex items-center gap-1 px-6 text-center">
            <MapPin size={11} className="shrink-0" /> One place for your entire
            journey.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
