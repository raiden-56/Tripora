import { motion } from "framer-motion";
import { SectionHeading } from "./shared/SectionHeading";
import { USE_CASES } from "./shared/marketingData";

export function UseCasesSection() {
  return (
    <section className="py-24 md:py-32 max-w-7xl mx-auto">
      <div className="px-6 md:px-10">
        <SectionHeading
          eyebrow="Made for every kind of traveler"
          title="Wherever you travel, however you travel."
        />
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar mt-12 px-6 md:px-10 pb-2 snap-x snap-mandatory">
        {USE_CASES.map((u, i) => (
          <motion.div
            key={u.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.06 }}
            className="relative shrink-0 w-64 h-80 rounded-3xl overflow-hidden snap-start"
          >
            <img
              src={u.image}
              alt={u.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <h3 className="font-display text-xl mb-1">{u.title}</h3>
              <p className="text-xs opacity-85">{u.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
