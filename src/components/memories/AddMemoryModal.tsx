import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

export function AddMemoryModal({
  open,
  onClose,
  defaultDestinationId,
}: {
  open: boolean;
  onClose: () => void;
  defaultDestinationId?: string;
}) {
  const destinations = useAppStore((s) => s.destinations);
  const addMemory = useAppStore((s) => s.addMemory);
  const pushToast = useAppStore((s) => s.pushToast);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [destinationId, setDestinationId] = useState(
    defaultDestinationId ?? destinations[0]?.id ?? "",
  );
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setDestinationId(defaultDestinationId ?? destinations[0]?.id ?? "");
      setDate(new Date().toISOString().slice(0, 10));
      setTags("");
    }
  }, [open, defaultDestinationId, destinations]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !destinationId) {
      pushToast("Please add a title and destination.", "error");
      return;
    }
    addMemory({
      id: `mem-${Date.now()}`,
      destinationId,
      title,
      description,
      date,
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(title + Date.now())}/800/900`,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    pushToast("Memory added", "success");
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1200] bg-ink/40 backdrop-blur-sm flex items-end md:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.form
          onClick={(e) => e.stopPropagation()}
          onSubmit={submit}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 26, stiffness: 260 }}
          className="w-full md:max-w-md md:rounded-3xl rounded-t-3xl bg-white dark:bg-[#1c2024] shadow-soft-lg"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink/8 dark:border-white/10">
            <h2 className="font-display text-lg">Add Memory</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-ink-soft hover:text-ink dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
                Title
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="Sunset at Raja's Seat"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
                Destination
              </span>
              <select
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                className={inputClass}
              >
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
                Date
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
                Description
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={inputClass}
                placeholder="Beautiful sunset with the gang."
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
                Tags (comma separated)
              </span>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className={inputClass}
                placeholder="sunset, friends, coorg"
              />
            </label>
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-ink/8 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-ink/15 dark:border-white/20 text-sm font-semibold hover:bg-ink/5 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition"
            >
              Save Memory
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400";
