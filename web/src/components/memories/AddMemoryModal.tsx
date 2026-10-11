import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import type { Memory } from "../../types";
import { todayIso } from "../../utils/dates";

interface AddMemoryModalProps {
  open: boolean;
  onClose: () => void;
  /** Destination preselected when adding a new memory. */
  defaultDestinationId?: string;
  /** When provided, the modal edits this memory instead of creating one. */
  memory?: Memory | null;
}

/**
 * Add / edit memory modal. The form is keyed and only mounted while open, so
 * every opening starts from fresh initial state (no reset effect needed).
 */
export function AddMemoryModal({
  open,
  onClose,
  defaultDestinationId,
  memory,
}: AddMemoryModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <MemoryForm
          key={memory ? `edit:${memory.id}` : `new:${defaultDestinationId ?? ""}`}
          onClose={onClose}
          defaultDestinationId={defaultDestinationId}
          memory={memory ?? null}
        />
      )}
    </AnimatePresence>
  );
}

function MemoryForm({
  onClose,
  defaultDestinationId,
  memory,
}: {
  onClose: () => void;
  defaultDestinationId?: string;
  memory: Memory | null;
}) {
  const destinations = useAppStore((s) => s.destinations);
  const addMemory = useAppStore((s) => s.addMemory);
  const updateMemory = useAppStore((s) => s.updateMemory);
  const pushToast = useAppStore((s) => s.pushToast);
  const isEdit = memory !== null;

  const [title, setTitle] = useState(memory?.title ?? "");
  const [description, setDescription] = useState(memory?.description ?? "");
  const [pickedDestinationId, setDestinationId] = useState(
    defaultDestinationId ?? "",
  );
  const [date, setDate] = useState(memory?.date ?? todayIso());
  const [tags, setTags] = useState(memory?.tags.join(", ") ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Falls back to the first destination (also covers destinations loading
  // after the modal opened) without syncing state in an effect.
  const destinationId = pickedDestinationId || destinations[0]?.id || "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (isEdit) {
      if (!trimmedTitle || !date) {
        pushToast("Please add a title and date.", "error");
        return;
      }
      setSaving(true);
      const ok = await updateMemory(memory.id, {
        title: trimmedTitle,
        description: description.trim(),
        date,
        tags: parsedTags,
      });
      setSaving(false);
      if (ok) {
        pushToast("Memory updated", "success");
        onClose();
      }
      return;
    }

    if (!trimmedTitle || !destinationId || !date) {
      pushToast("Please add a title, destination and date.", "error");
      return;
    }
    setSaving(true);
    const created = await addMemory(
      {
        destinationId,
        title: trimmedTitle,
        description: description.trim(),
        date,
        imageUrl: "",
        tags: parsedTags,
      },
      photoFile ?? undefined,
    );
    setSaving(false);
    if (created) {
      pushToast("Memory added", "success");
      onClose();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[1280] bg-ink/40 backdrop-blur-sm flex items-end md:items-center justify-center"
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
        className="w-full md:max-w-md md:rounded-3xl rounded-t-3xl bg-white dark:bg-[#1c2024] shadow-soft-lg max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/8 dark:border-white/10">
          <h2 className="font-display text-lg">
            {isEdit ? "Edit Memory" : "Add Memory"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-ink-soft hover:text-ink dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <label className="block">
            <span className={labelClass}>Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="Sunset at Raja's Seat"
            />
          </label>
          {!isEdit && (
            <label className="block">
              <span className={labelClass}>Destination</span>
              <select
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                className={inputClass}
              >
                {destinations.length === 0 && (
                  <option value="">Add a destination first</option>
                )}
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block">
            <span className={labelClass}>Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Beautiful sunset with the gang."
            />
          </label>
          {!isEdit && (
            <label className="block">
              <span className={labelClass}>Photo (optional)</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                className={inputClass}
              />
            </label>
          )}
          <label className="block">
            <span className={labelClass}>Tags (comma separated)</span>
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
            disabled={saving}
            className="flex-1 py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition disabled:opacity-60"
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Save Memory"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

const labelClass =
  "text-xs font-semibold text-ink-soft dark:text-white/60 mb-1.5 block";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400";
