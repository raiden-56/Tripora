import { motion } from "framer-motion";
import {
  Bot,
  Camera,
  FolderOpen,
  ListChecks,
  Map,
  Sparkles,
  Star,
  Wand2,
} from "lucide-react";
import { SectionHeading } from "./shared/SectionHeading";
import { FEATURES } from "./shared/marketingData";

const ICONS = [Map, Camera, ListChecks, FolderOpen, Star, Wand2, Bot, Sparkles];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-24 md:py-32 px-6 md:px-10 max-w-7xl mx-auto"
    >
      <SectionHeading
        eyebrow="Everything in one place"
        title="Everything your journey needs."
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-14">
        {FEATURES.map((f, i) => {
          const Icon = ICONS[i];
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: (i % 4) * 0.06, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="p-6 rounded-3xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft hover:shadow-soft-lg transition-shadow"
            >
              <div className="w-11 h-11 rounded-2xl bg-forest-50 dark:bg-white/10 text-forest-500 flex items-center justify-center mb-4">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-ink-soft dark:text-white/50">
                {f.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
