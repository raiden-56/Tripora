import { motion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";

export function StatCard({
  label,
  value,
  icon,
  delay = 0,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-4 md:p-5 rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-ink-soft dark:text-white/50 uppercase tracking-wide">
          {label}
        </span>
        {icon && <span className="text-forest-500">{icon}</span>}
      </div>
      <AnimatedCounter
        value={value}
        className="font-display text-3xl text-ink dark:text-white"
      />
    </motion.div>
  );
}
