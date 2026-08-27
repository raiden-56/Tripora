import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SectionHeading } from "./shared/SectionHeading";
import { FAQ_ITEMS } from "./shared/marketingData";

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24 md:py-32 px-6 md:px-10 max-w-3xl mx-auto">
      <SectionHeading title="Frequently asked questions" />
      <div className="mt-14 flex flex-col gap-2.5">
        {FAQ_ITEMS.map((item, i) => (
          <div
            key={item.q}
            className="rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 overflow-hidden"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-medium text-sm md:text-base">{item.q}</span>
              <motion.span
                animate={{ rotate: open === i ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="shrink-0 text-ink-soft dark:text-white/50"
              >
                <ChevronDown size={17} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-4 text-sm text-ink-soft dark:text-white/60 leading-relaxed">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
