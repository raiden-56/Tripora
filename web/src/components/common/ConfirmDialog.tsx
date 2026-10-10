import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useConfirmStore } from "../../store/useConfirmStore";

/** Renders the question asked through `confirmAction()`; mounted once in AppLayout. */
export function ConfirmDialog() {
  const open = useConfirmStore((s) => s.open);
  const settle = useConfirmStore((s) => s.settle);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") settle(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, settle]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1300] bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => settle(false)}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1c2024] shadow-soft-lg p-6"
          >
            <div className="flex items-start gap-3">
              {open.danger && (
                <span className="shrink-0 w-9 h-9 rounded-full bg-coral-500/10 text-coral-500 flex items-center justify-center">
                  <AlertTriangle size={17} />
                </span>
              )}
              <div className="min-w-0">
                <h2 id="confirm-title" className="font-display text-lg leading-snug">
                  {open.title}
                </h2>
                {open.message && (
                  <p className="text-sm text-ink-soft mt-1.5">{open.message}</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => settle(false)}
                className="flex-1 py-2.5 rounded-full border border-ink/15 dark:border-white/20 text-sm font-semibold hover:bg-ink/5 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => settle(true)}
                className={`flex-1 py-2.5 rounded-full text-white text-sm font-semibold transition ${
                  open.danger
                    ? "bg-coral-500 hover:bg-coral-400"
                    : "bg-forest-500 hover:bg-forest-600"
                }`}
              >
                {open.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
