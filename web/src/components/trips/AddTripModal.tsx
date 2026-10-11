import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import clsx from "clsx";
import { useAppStore } from "../../store/useAppStore";
import type { Trip } from "../../types";

export function AddTripModal({
  open,
  onClose,
  editingTrip,
  initialDestinationId,
}: {
  open: boolean;
  onClose: () => void;
  editingTrip?: Trip | null;
  /** Preselects a destination for a new trip (e.g. "Plan a trip" from the wishlist). */
  initialDestinationId?: string | null;
}) {
  if (!open) return null;
  // Keyed so the form's state is initialised fresh each time it opens for a
  // different trip, and is never reset by unrelated store updates mid-edit.
  return (
    <TripForm
      key={editingTrip?.id ?? `new-${initialDestinationId ?? ""}`}
      onClose={onClose}
      editingTrip={editingTrip ?? null}
      initialDestinationId={initialDestinationId ?? null}
    />
  );
}

function TripForm({
  onClose,
  editingTrip,
  initialDestinationId,
}: {
  onClose: () => void;
  editingTrip: Trip | null;
  initialDestinationId: string | null;
}) {
  const destinations = useAppStore((s) => s.destinations);
  const addTrip = useAppStore((s) => s.addTrip);
  const updateTrip = useAppStore((s) => s.updateTrip);
  const updateDestination = useAppStore((s) => s.updateDestination);
  const pushToast = useAppStore((s) => s.pushToast);

  const [title, setTitle] = useState(editingTrip?.title ?? "");
  const [destinationIds, setDestinationIds] = useState<string[]>(
    editingTrip?.destinationIds ?? (initialDestinationId ? [initialDestinationId] : []),
  );
  const [startDate, setStartDate] = useState(editingTrip?.startDate ?? "");
  const [endDate, setEndDate] = useState(editingTrip?.endDate ?? "");
  const [status, setStatus] = useState<Trip["status"]>(editingTrip?.status ?? "planned");
  const [notes, setNotes] = useState(editingTrip?.notes ?? "");
  const [driveFolderUrl, setDriveFolderUrl] = useState(editingTrip?.driveFolderUrl ?? "");
  const [saving, setSaving] = useState(false);

  const toggleDestination = (id: string) =>
    setDestinationIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) {
      pushToast("Please fill in the trip title and dates.", "error");
      return;
    }
    if (endDate < startDate) {
      pushToast("The trip can't end before it starts.", "error");
      return;
    }
    const payload = {
      title: title.trim(),
      destinationIds,
      startDate,
      endDate,
      status,
      notes,
      driveFolderUrl,
    };
    setSaving(true);
    try {
      if (editingTrip) {
        if (!(await updateTrip(editingTrip.id, payload))) return;
        pushToast("Trip updated", "success");
      } else {
        const cover = destinations.find((d) => d.id === destinationIds[0])?.heroImageUrl;
        const created = await addTrip({ ...payload, coverImageUrl: cover ?? "" });
        if (!created) return;
        // A wishlist place you've now planned (or been to) moves out of the wishlist.
        for (const id of destinationIds) {
          const dest = destinations.find((d) => d.id === id);
          if (dest?.status === "wishlist") await updateDestination(id, { status });
        }
        pushToast("Trip added", "success");
      }
      onClose();
    } finally {
      setSaving(false);
    }
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
          className="w-full md:max-w-md md:rounded-3xl rounded-t-3xl bg-white dark:bg-[#1c2024] shadow-soft-lg max-h-[92vh] flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink/8 dark:border-white/10">
            <h2 className="font-display text-lg">{editingTrip ? "Edit Trip" : "Add Trip"}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-ink-soft hover:text-ink dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-6 flex flex-col gap-4 overflow-y-auto">
            <label className="block">
              <span className={labelClass}>Trip Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={150}
                className={inputClass}
                placeholder="Goa Getaway"
              />
            </label>

            <div>
              <span className={labelClass}>Destinations</span>
              {destinations.length === 0 ? (
                <p className="text-xs text-ink-soft dark:text-white/50">
                  Add destinations to your map first to link them to a trip.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {destinations.map((d) => {
                    const selected = destinationIds.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleDestination(d.id)}
                        aria-pressed={selected}
                        className={clsx(
                          "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition",
                          selected
                            ? "bg-forest-500 border-forest-500 text-white"
                            : "border-ink/12 dark:border-white/15 hover:border-forest-400",
                        )}
                      >
                        {selected && <Check size={11} />}
                        {d.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={labelClass}>Start Date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (!endDate || endDate < e.target.value) setEndDate(e.target.value);
                  }}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>End Date</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <div>
              <span className={labelClass}>Status</span>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["planned", "Planned"],
                    ["visited", "Completed"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatus(value)}
                    aria-pressed={status === value}
                    className={clsx(
                      "py-2 rounded-xl text-sm font-medium border transition",
                      status === value
                        ? "bg-forest-500 border-forest-500 text-white"
                        : "border-ink/12 dark:border-white/15",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className={labelClass}>Notes</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Google Drive Folder Link</span>
              <input
                value={driveFolderUrl}
                onChange={(e) => setDriveFolderUrl(e.target.value)}
                type="url"
                maxLength={500}
                placeholder="https://drive.google.com/drive/folders/…"
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
              disabled={saving}
              className="flex-1 py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition disabled:opacity-50"
            >
              {saving ? "Saving…" : editingTrip ? "Save Changes" : "Add Trip"}
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}

const labelClass = "text-xs font-semibold text-ink-soft mb-1.5 block";
const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400";
