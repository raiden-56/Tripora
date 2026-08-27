import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { Memory } from "../../types";

interface MemoryViewerProps {
  memories: Memory[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
  onDelete: (id: string) => void;
  destinationName?: (id: string) => string;
}

export function MemoryViewer({
  memories,
  index,
  onClose,
  onIndexChange,
  onDelete,
  destinationName,
}: MemoryViewerProps) {
  const [zoomed, setZoomed] = useState(false);
  const memory = memories[index];
  if (!memory) return null;

  const go = (delta: number) => {
    setZoomed(false);
    const next = (index + delta + memories.length) % memories.length;
    onIndexChange(next);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1300] bg-black/90 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex items-center justify-between px-5 py-4 text-white">
          <div>
            <p className="font-semibold text-sm">{memory.title}</p>
            <p className="text-xs text-white/60">
              {new Date(memory.date).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              {destinationName && ` · ${destinationName(memory.destinationId)}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomed((z) => !z)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
            >
              {zoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
            </button>
            <button
              onClick={() => {
                onDelete(memory.id);
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-coral-500/40 flex items-center justify-center"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 relative flex items-center justify-center px-4 overflow-hidden">
          <button
            onClick={() => go(-1)}
            className="absolute left-3 md:left-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10"
          >
            <ChevronLeft size={20} />
          </button>
          {memory.imageUrl ? (
            <motion.img
              key={memory.id}
              src={memory.imageUrl}
              alt={memory.title}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: zoomed ? 1.6 : 1 }}
              transition={{ duration: 0.25 }}
              className="max-h-[70vh] max-w-full object-contain rounded-xl cursor-zoom-in"
              onClick={() => setZoomed((z) => !z)}
            />
          ) : (
            <div className="w-full max-w-md aspect-[4/5] rounded-xl bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center">
              <span className="text-white/80 text-sm font-medium px-6 text-center">
                No photo attached to this memory
              </span>
            </div>
          )}
          <button
            onClick={() => go(1)}
            className="absolute right-3 md:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="px-6 py-4 text-center">
          <p className="text-white/80 text-sm max-w-lg mx-auto">
            {memory.description}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
            {memory.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-white/60 bg-white/10 px-2.5 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
