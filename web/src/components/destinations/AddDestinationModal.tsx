import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import type { Destination, DestinationStatus } from "../../types";

interface GeoResult {
  display_name: string;
  lat: string;
  lon: string;
}

const emptyForm = {
  name: "",
  country: "",
  state: "",
  city: "",
  latitude: "",
  longitude: "",
  status: "wishlist" as DestinationStatus,
  visitedFrom: "",
  visitedTo: "",
  rating: "",
  notes: "",
  googleMapsUrl: "",
  googleDriveUrl: "",
};

export function AddDestinationModal() {
  const open = useAppStore((s) => s.addDestinationOpen);
  const editingId = useAppStore((s) => s.editingDestinationId);
  const destinations = useAppStore((s) => s.destinations);
  const closeAddDestination = useAppStore((s) => s.closeAddDestination);
  const addDestination = useAppStore((s) => s.addDestination);
  const updateDestination = useAppStore((s) => s.updateDestination);
  const pushToast = useAppStore((s) => s.pushToast);

  const [form, setForm] = useState(emptyForm);
  const [locationQuery, setLocationQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!open) return;
    const editing = editingId
      ? destinations.find((d) => d.id === editingId)
      : null;
    if (editing) {
      setForm({
        name: editing.name,
        country: editing.country,
        state: editing.state ?? "",
        city: editing.city ?? "",
        latitude: String(editing.latitude),
        longitude: String(editing.longitude),
        status: editing.status,
        visitedFrom: editing.visitedFrom ?? "",
        visitedTo: editing.visitedTo ?? "",
        rating: editing.rating ? String(editing.rating) : "",
        notes: editing.notes ?? "",
        googleMapsUrl: editing.googleMapsUrl ?? "",
        googleDriveUrl: editing.googleDriveUrl ?? "",
      });
    } else {
      setForm(emptyForm);
    }
    setLocationQuery("");
    setResults([]);
  }, [open, editingId, destinations]);

  useEffect(() => {
    if (locationQuery.trim().length < 3) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(locationQuery)}`,
        );
        const data: GeoResult[] = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [locationQuery]);

  if (!open) return null;

  const pickResult = (r: GeoResult) => {
    const parts = r.display_name.split(",").map((p) => p.trim());
    setForm((f) => ({
      ...f,
      name: f.name || parts[0],
      country: parts[parts.length - 1] || f.country,
      state: parts.length > 2 ? parts[parts.length - 3] : f.state,
      city: parts.length > 1 ? parts[1] : f.city,
      latitude: r.lat,
      longitude: r.lon,
    }));
    setLocationQuery(r.display_name);
    setResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.country || !form.latitude || !form.longitude) {
      pushToast("Please fill in name, country and location.", "error");
      return;
    }
    const patch: Partial<Destination> = {
      name: form.name,
      country: form.country,
      state: form.state || undefined,
      city: form.city || undefined,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      status: form.status,
      visitedFrom: form.visitedFrom || undefined,
      visitedTo: form.visitedTo || undefined,
      rating: form.rating ? parseFloat(form.rating) : undefined,
      notes: form.notes || undefined,
      googleMapsUrl: form.googleMapsUrl || undefined,
      googleDriveUrl: form.googleDriveUrl || undefined,
    };

    if (editingId) {
      await updateDestination(editingId, patch);
      pushToast("Destination updated", "success");
    } else {
      const created = await addDestination({
        ...patch,
        isFavorite: false,
        heroImageUrl: `https://picsum.photos/seed/${encodeURIComponent(form.name)}/900/650`,
      });
      if (created) pushToast("Added to your journey", "success");
    }
    closeAddDestination();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1200] bg-ink/40 backdrop-blur-sm flex items-end md:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAddDestination}
      >
        <motion.form
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 26, stiffness: 260 }}
          className="w-full md:max-w-lg md:rounded-3xl rounded-t-3xl bg-white dark:bg-[#1c2024] max-h-[90vh] overflow-y-auto shadow-soft-lg"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink/8 dark:border-white/10 sticky top-0 bg-white dark:bg-[#1c2024] z-10">
            <h2 className="font-display text-lg">
              {editingId ? "Edit Destination" : "Add Destination"}
            </h2>
            <button
              type="button"
              onClick={closeAddDestination}
              className="text-ink-soft hover:text-ink dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-ink-soft mb-1.5 block">
                Search Location
              </label>
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
                />
                <input
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Search a place…"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400"
                />
                {searching && (
                  <Loader2
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-ink-soft"
                  />
                )}
              </div>
              {results.length > 0 && (
                <div className="mt-1.5 border border-ink/10 dark:border-white/10 rounded-xl overflow-hidden">
                  {results.map((r, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => pickResult(r)}
                      className="w-full flex items-start gap-2 px-3 py-2 text-left text-xs hover:bg-ink/5 dark:hover:bg-white/5"
                    >
                      <MapPin
                        size={12}
                        className="mt-0.5 shrink-0 text-forest-500"
                      />
                      {r.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Field label="Destination Name" required>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Country" required>
                <input
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="State">
                <input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="City">
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude" required>
                <input
                  value={form.latitude}
                  onChange={(e) =>
                    setForm({ ...form, latitude: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Longitude" required>
                <input
                  value={form.longitude}
                  onChange={(e) =>
                    setForm({ ...form, longitude: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as DestinationStatus,
                  })
                }
                className={inputClass}
              >
                <option value="visited">Visited</option>
                <option value="planned">Planned</option>
                <option value="wishlist">Wishlist</option>
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Visit Date">
                <input
                  type="date"
                  value={form.visitedFrom}
                  onChange={(e) =>
                    setForm({ ...form, visitedFrom: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="End Date">
                <input
                  type="date"
                  value={form.visitedTo}
                  onChange={(e) =>
                    setForm({ ...form, visitedTo: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Rating">
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className={inputClass}
              />
            </Field>

            <Field label="Notes">
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className={inputClass}
              />
            </Field>

            <Field label="Google Maps Link">
              <input
                value={form.googleMapsUrl}
                onChange={(e) =>
                  setForm({ ...form, googleMapsUrl: e.target.value })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Google Drive Folder Link">
              <input
                value={form.googleDriveUrl}
                onChange={(e) =>
                  setForm({ ...form, googleDriveUrl: e.target.value })
                }
                className={inputClass}
              />
            </Field>
          </div>

          <div className="flex gap-3 px-6 py-4 border-t border-ink/8 dark:border-white/10 sticky bottom-0 bg-white dark:bg-[#1c2024]">
            <button
              type="button"
              onClick={closeAddDestination}
              className="flex-1 py-2.5 rounded-full border border-ink/15 dark:border-white/20 text-sm font-semibold hover:bg-ink/5 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition"
            >
              {editingId ? "Save Changes" : "Add to Journey"}
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
        {label} {required && <span className="text-coral-500">*</span>}
      </span>
      {children}
    </label>
  );
}
