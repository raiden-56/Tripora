import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { SectionHeading } from "./shared/SectionHeading";

const FREE = [
  "Personal travel map",
  "Destinations & wishlist",
  "Memories & photos",
  "Basic travel statistics",
  "Basic trip planning",
];
const PRO = [
  "AI trip planning",
  "AI travel stories",
  "Advanced statistics",
  "Advanced sharing & recap cards",
  "Unlimited Drive integrations",
];

export function PricingTeaserSection({
  onStartJourney,
}: {
  onStartJourney: () => void;
}) {
  return (
    <section
      id="pricing"
      className="py-24 md:py-32 px-6 md:px-10 max-w-4xl mx-auto"
    >
      <SectionHeading
        eyebrow="Simple pricing"
        title="Start free. Upgrade when you're ready."
      />
      <div className="grid sm:grid-cols-2 gap-5 mt-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-7 rounded-3xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft"
        >
          <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-1">
            Free
          </p>
          <p className="font-display text-3xl mb-5">₹0</p>
          <ul className="flex flex-col gap-2.5 mb-6">
            {FREE.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 text-sm text-ink-soft dark:text-white/60"
              >
                <Check size={14} className="text-forest-500 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={onStartJourney}
            className="w-full py-2.5 rounded-full border border-ink/15 dark:border-white/20 text-sm font-semibold hover:bg-ink/5 dark:hover:bg-white/5 transition"
          >
            Start Free
          </button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="p-7 rounded-3xl border-2 border-forest-500 bg-gradient-to-br from-forest-50 to-white dark:from-forest-500/10 dark:to-[#1c2024] relative"
        >
          <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-forest-500 text-white text-[11px] font-semibold flex items-center gap-1">
            <Sparkles size={11} /> Coming soon
          </span>
          <p className="text-xs font-semibold text-forest-600 dark:text-forest-400 uppercase tracking-wide mb-1">
            Pro
          </p>
          <p className="font-display text-3xl mb-5">
            ₹499<span className="text-sm text-ink-soft">/mo</span>
          </p>
          <ul className="flex flex-col gap-2.5 mb-6">
            {PRO.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-forest-500 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={onStartJourney}
            className="w-full py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition"
          >
            Start Your Journey
          </button>
        </motion.div>
      </div>
    </section>
  );
}
