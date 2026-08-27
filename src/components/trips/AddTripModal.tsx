import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import type { Trip } from "../../types";

export function AddTripModal({
  open,
  onClose,
  editingTrip,
}: {
  open: boolean;
  onClose: () => void;
  editingTrip?: Trip | null;
}) {
  const destinations = useAppStore((s) => s.destinations);
  const addTrip = useAppStore((s) => s.addTrip);
  const updateTrip = useAppStore((s) => s.updateTrip);
  const pushToast = useAppStore((s) => s.pushToast);

  const [title, setTitle] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [driveFolderUrl, setDriveFolderUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editingTrip) {
      setTitle(editingTrip.title);
      setDestinationId(editingTrip.destinationIds[0] ?? "");
      setStartDate(editingTrip.startDate);
      setEndDate(editingTrip.endDate);
      setNotes(editingTrip.notes ?? "");
      setDriveFolderUrl(editingTrip.driveFolderUrl ?? "");
    } else {
      setTitle("");
      setDestinationId(destinations[0]?.id ?? "");
      setStartDate("");
      setEndDate("");
      setNotes("");
      setDriveFolderUrl("");
    }
  }, [open, editingTrip, destinations]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) {
      pushToast("Please fill in trip title and dates.", "error");
      return;
    }
    if (editingTrip) {
      updateTrip(editingTrip.id, {
        title,
        destinationIds: [destinationId],
        startDate,
        endDate,
        notes,
        driveFolderUrl,
      });
      pushToast("Trip updated", "success");
    } else {
      const dest = destinations.find((d) => d.id === destinationId);
      addTrip({
        id: `trip-${Date.now()}`,
        title,
        destinationIds: destinationId ? [destinationId] : [],
        startDate,
        endDate,
        status: "planned",
        coverImageUrl:
          dest?.heroImageUrl ??
          `https://picsum.photos/seed/${encodeURIComponent(title)}/900/650`,
        notes,
        driveFolderUrl,
      });
      pushToast("Trip added", "success");
    }
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
            <h2 className="font-display text-lg">
              {editingTrip ? "Edit Trip" : "Add Trip"}
            </h2>
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
                Trip Title
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="Goa Getaway"
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
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
                  Start Date
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
                  End Date
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
                Notes
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
                Google Drive Folder Link
              </span>
              <input
                value={driveFolderUrl}
                onChange={(e) => setDriveFolderUrl(e.target.value)}
                className={inputClass}
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
              {editingTrip ? "Save Changes" : "Add Trip"}
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400";
