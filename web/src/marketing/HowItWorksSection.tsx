import { motion } from "framer-motion";
import { MapPin, Camera, CalendarClock, Compass } from "lucide-react";
import { SectionHeading } from "./shared/SectionHeading";

const STEPS = [
  {
    number: "01",
    title: "Map it",
    desc: "Add the places you've visited.",
    icon: MapPin,
  },
  {
    number: "02",
    title: "Remember it",
    desc: "Attach photos, notes and memories.",
    icon: Camera,
  },
  {
    number: "03",
    title: "Plan it",
    desc: "Add future destinations and trips.",
    icon: CalendarClock,
  },
  {
    number: "04",
    title: "Live it",
    desc: "Travel, capture and grow your map.",
    icon: Compass,
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 md:py-32 px-6 md:px-10 max-w-6xl mx-auto"
    >
      <SectionHeading title="How It Works" />
      <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
        <div className="hidden lg:block absolute top-9 left-[12%] right-[12%] h-px bg-ink/10 dark:bg-white/10" />
        {STEPS.map((s, i) => (
          <motion.div
            key={s.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.1 }}
            className="relative text-center"
          >
            <div className="w-[72px] h-[72px] mx-auto rounded-full bg-white dark:bg-[#1c2024] border border-ink/10 dark:border-white/10 shadow-soft flex items-center justify-center text-forest-500 mb-4 relative z-10">
              <s.icon size={24} />
            </div>
            <p className="text-xs font-semibold text-ink-soft dark:text-white/40 mb-1">
              {s.number}
            </p>
            <h3 className="font-display text-xl mb-1.5">{s.title}</h3>
            <p className="text-sm text-ink-soft dark:text-white/50">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
