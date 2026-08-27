import { motion } from "framer-motion";
import type { Memory } from "../../types";

export function MemoryCard({
  memory,
  onClick,
  index = 0,
}: {
  memory: Memory;
  onClick: () => void;
  index?: number;
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
      onClick={onClick}
      className="break-inside-avoid mb-3 w-full rounded-2xl overflow-hidden relative group block"
    >
      <img
        src={memory.imageUrl}
        alt={memory.title}
        className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent p-3 text-left opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white text-sm font-semibold truncate">
          {memory.title}
        </p>
        <p className="text-white/70 text-xs">
          {new Date(memory.date).toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </motion.button>
  );
}
