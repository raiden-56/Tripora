import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

const ICONS = {
  success: <CheckCircle2 size={18} className="text-forest-500" />,
  error: <AlertCircle size={18} className="text-coral-500" />,
  info: <Info size={18} className="text-sky-500" />,
};

export function ToastHost() {
  const toasts = useAppStore((s) => s.toasts);
  const dismissToast = useAppStore((s) => s.dismissToast);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-[1000] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
            className="flex items-center gap-2.5 bg-white dark:bg-[#20242a] border border-ink/10 dark:border-white/10 shadow-soft-lg rounded-2xl px-4 py-3"
            onAnimationComplete={() => {
              setTimeout(() => dismissToast(toast.id), 3200);
            }}
          >
            {ICONS[toast.type]}
            <p className="text-sm flex-1">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-ink-soft hover:text-ink dark:hover:text-white"
            >
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
