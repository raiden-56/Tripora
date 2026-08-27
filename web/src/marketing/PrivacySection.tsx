import { motion } from "framer-motion";
import { Database, Download, Lock, ShieldCheck, Trash2 } from "lucide-react";
import { SectionHeading } from "./shared/SectionHeading";

const POINTS = [
  {
    icon: Lock,
    title: "Private by default",
    desc: "Your journey is visible only to you unless you choose to share it.",
  },
  {
    icon: ShieldCheck,
    title: "Control what you share",
    desc: "Choose private, friends, or public visibility for your journey and memories.",
  },
  {
    icon: Database,
    title: "Connect your own storage",
    desc: "Your photos stay in your own Google Drive, not on a third-party server.",
  },
  {
    icon: Download,
    title: "Export your data",
    desc: "Download your destinations, trips, and memories any time.",
  },
  {
    icon: Trash2,
    title: "Delete your account",
    desc: "Remove your journey and account completely, whenever you want.",
  },
];

export function PrivacySection() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-10 max-w-4xl mx-auto">
      <SectionHeading title="Your journey belongs to you." />
      <div className="grid sm:grid-cols-2 gap-4 mt-14">
        {POINTS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.06 }}
            className={`p-5 rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft flex gap-3.5 ${i === POINTS.length - 1 ? "sm:col-span-2" : ""}`}
          >
            <div className="w-10 h-10 rounded-xl bg-forest-50 dark:bg-white/10 text-forest-500 flex items-center justify-center shrink-0">
              <p.icon size={17} />
            </div>
            <div>
              <p className="font-semibold text-sm mb-0.5">{p.title}</p>
              <p className="text-xs text-ink-soft dark:text-white/50">
                {p.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
