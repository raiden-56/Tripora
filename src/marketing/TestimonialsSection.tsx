import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { SectionHeading } from "./shared/SectionHeading";
import { TESTIMONIALS } from "./shared/marketingData";

export function TestimonialsSection() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-10 max-w-6xl mx-auto">
      <SectionHeading
        eyebrow="Demo traveler stories"
        title="Early concept feedback."
        description="TravelCanvas hasn't launched publicly yet — these reflect early demo/product-preview reactions, not verified customer reviews."
      />
      <div className="grid md:grid-cols-3 gap-5 mt-14">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.seed}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-3xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft"
          >
            <Quote size={20} className="text-forest-400 mb-4" />
            <p className="text-sm text-ink-soft dark:text-white/70 mb-5 leading-relaxed">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center gap-2.5">
              <img
                src={`https://picsum.photos/seed/${t.seed}/64/64`}
                alt=""
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-[11px] text-ink-soft dark:text-white/40">
                  Demo / product-preview data
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
