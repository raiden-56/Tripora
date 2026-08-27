import { useState } from "react";
import { motion } from "framer-motion";
import { destinations, memories } from "../data/mockData";
import { SectionHeading } from "./shared/SectionHeading";

const GALLERY = memories.slice(0, 10);

export function MemoriesSection() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="py-24 md:py-32 px-6 md:px-10 max-w-6xl mx-auto">
      <SectionHeading
        eyebrow="Memory vault"
        title="Memories belong to places."
        description="Every photo stays connected to the trip and destination it came from."
      />

      <div className="columns-2 md:columns-3 gap-3 mt-14 [column-fill:balance]">
        {GALLERY.map((m, i) => {
          const dest = destinations.find((d) => d.id === m.destinationId);
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: (i % 6) * 0.05 }}
              onMouseEnter={() => setHovered(m.id)}
              onMouseLeave={() => setHovered(null)}
              className="relative mb-3 rounded-2xl overflow-hidden break-inside-avoid"
            >
              <img
                src={m.imageUrl}
                alt={m.title}
                className="w-full h-auto object-cover transition-transform duration-500"
                style={{
                  transform: hovered === m.id ? "scale(1.05)" : "scale(1)",
                }}
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent flex flex-col justify-end p-3.5 transition-opacity duration-300"
                style={{ opacity: hovered === m.id ? 1 : 0 }}
              >
                <p className="text-white text-sm font-semibold">{m.title}</p>
                <p className="text-white/75 text-xs">
                  {dest?.name} ·{" "}
                  {new Date(m.date).toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
