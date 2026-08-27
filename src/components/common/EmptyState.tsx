import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-3xl border border-dashed border-ink/15 dark:border-white/15 bg-white/50 dark:bg-white/5"
    >
      <div className="w-16 h-16 rounded-2xl bg-forest-50 dark:bg-white/10 flex items-center justify-center text-forest-500 mb-4">
        {icon}
      </div>
      <h3 className="font-display text-xl mb-1.5">{title}</h3>
      <p className="text-ink-soft dark:text-white/60 max-w-sm mb-5 text-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-full bg-ink text-white dark:bg-white dark:text-ink text-sm font-semibold hover:opacity-90 transition"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
