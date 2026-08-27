import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Smaller, denser layout for use inside tabs, drawers, and dropdowns. */
  compact?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-ink/15 dark:border-white/15 bg-white/50 dark:bg-white/5 ${
        compact ? "py-8 px-4" : "py-16 px-6 rounded-3xl"
      }`}
    >
      <div
        className={`rounded-2xl bg-forest-50 dark:bg-white/10 flex items-center justify-center text-forest-500 ${
          compact ? "w-11 h-11 mb-3" : "w-16 h-16 mb-4"
        }`}
      >
        {icon}
      </div>
      <h3
        className={
          compact
            ? "font-display text-base mb-1"
            : "font-display text-xl mb-1.5"
        }
      >
        {title}
      </h3>
      {description && (
        <p
          className={`text-ink-soft dark:text-white/60 max-w-sm text-sm ${
            compact ? "mb-3" : "mb-5"
          }`}
        >
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`rounded-full bg-ink text-white dark:bg-white dark:text-ink font-semibold hover:opacity-90 transition ${
            compact ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm"
          }`}
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
