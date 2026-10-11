import { useEffect, useState } from "react";
import { Check, ListChecks, Plus, Sparkles, Trash2 } from "lucide-react";
import * as planningApi from "../../api/tripPlanning.api";
import * as itineraryApi from "../../api/itinerary.api";
import { getTripWeather, summarize, type WeatherSummary } from "../../api/weather.api";
import { useAppStore } from "../../store/useAppStore";
import type { ChecklistItem, Destination, Trip } from "../../types";
import { EmptyState } from "../common/EmptyState";
import { suggestPacking, type PackingSuggestion } from "../../utils/packing";
import { daysUntil } from "../../utils/dates";

const STARTER_ITEMS = ["Tickets & booking confirmations", "ID / passport", "Phone charger & power bank", "Medicines & first-aid kit", "Cash & cards"];

export function TripChecklistTab({ trip, destinations }: { trip: Trip; destinations: Destination[] }) {
  const tripId = trip.id;
  const pushToast = useAppStore((s) => s.pushToast);
  const [items, setItems] = useState<ChecklistItem[] | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const canEdit = trip.role !== "viewer";

  useEffect(() => {
    let cancelled = false;
    planningApi
      .listChecklist(tripId)
      .then((list) => !cancelled && setItems(list))
      .catch((err: Error) => {
        if (!cancelled) {
          setItems([]);
          pushToast(err.message, "error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tripId, pushToast]);

  const add = async (text: string) => {
    const value = text.trim();
    if (!value) return;
    setSaving(true);
    try {
      const created = await planningApi.addChecklistItem(tripId, value);
      setItems((prev) => [...(prev ?? []), created]);
      setDraft("");
    } catch (err) {
      pushToast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (item: ChecklistItem) => {
    setItems((prev) => prev?.map((i) => (i.id === item.id ? { ...i, isDone: !i.isDone } : i)) ?? null);
    try {
      await planningApi.updateChecklistItem(tripId, item.id, { isDone: !item.isDone });
    } catch (err) {
      setItems((prev) => prev?.map((i) => (i.id === item.id ? item : i)) ?? null);
      pushToast((err as Error).message, "error");
    }
  };

  const remove = async (item: ChecklistItem) => {
    setItems((prev) => prev?.filter((i) => i.id !== item.id) ?? null);
    try {
      await planningApi.deleteChecklistItem(tripId, item.id);
    } catch (err) {
      setItems((prev) => (prev ? [...prev, item] : [item]));
      pushToast((err as Error).message, "error");
    }
  };

  if (items === null) {
    return <p className="text-sm text-ink-soft dark:text-white/50">Loading checklist…</p>;
  }

  const done = items.filter((i) => i.isDone).length;

  return (
    <div>
      {canEdit && !suggesting && (
        <button
          onClick={() => setSuggesting(true)}
          className="mb-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-ink/12 dark:border-white/15 hover:bg-ink/5 dark:hover:bg-white/5"
        >
          <Sparkles size={12} /> Suggest what to pack
        </button>
      )}
      {suggesting && (
        <PackingSuggestions
          trip={trip}
          destinations={destinations}
          existing={items}
          onClose={() => setSuggesting(false)}
          onAdded={(list) => {
            setItems(list);
            setSuggesting(false);
          }}
        />
      )}
      {canEdit && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            add(draft);
          }}
          className="flex gap-2 mb-4"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={200}
            placeholder="Add something to pack or do…"
            className="flex-1 px-3.5 py-2 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400"
          />
          <button
            type="submit"
            disabled={saving || !draft.trim()}
            aria-label="Add item"
            className="w-10 h-10 rounded-full bg-forest-500 text-white flex items-center justify-center hover:bg-forest-600 disabled:opacity-40"
          >
            <Plus size={16} />
          </button>
        </form>
      )}

      {items.length === 0 ? (
        <>
          <EmptyState
            compact
            icon={<ListChecks size={20} />}
            title="Nothing on the checklist yet"
            description={
              canEdit
                ? "Add what to pack or book — everyone on the trip sees the same list."
                : "The trip owner hasn't added anything yet."
            }
          />
          {canEdit && (
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              {STARTER_ITEMS.map((text) => (
                <button
                  key={text}
                  onClick={() => add(text)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-ink/12 dark:border-white/15 hover:border-forest-400"
                >
                  + {text}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3">
            <ListChecks size={14} className="text-forest-500" />
            <p className="text-xs text-ink-soft dark:text-white/50">
              {done}/{items.length} complete
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="group flex items-center gap-3 p-3 rounded-xl border border-ink/8 dark:border-white/10"
              >
                <button
                  onClick={() => canEdit && toggle(item)}
                  disabled={!canEdit}
                  aria-pressed={item.isDone}
                  aria-label={item.isDone ? `Mark "${item.text}" not done` : `Mark "${item.text}" done`}
                  className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${item.isDone ? "bg-forest-500 border-forest-500" : "border-ink/25 dark:border-white/25"}`}
                >
                  {item.isDone && <Check size={12} className="text-white" />}
                </button>
                <span
                  className={`text-sm flex-1 ${item.isDone ? "line-through text-ink-soft dark:text-white/40" : ""}`}
                >
                  {item.text}
                </span>
                {canEdit && (
                  <button
                    onClick={() => remove(item)}
                    aria-label={`Remove "${item.text}"`}
                    className="text-ink-soft hover:text-coral-500 md:opacity-0 md:group-hover:opacity-100 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PackingSuggestions({
  trip,
  destinations,
  existing,
  onClose,
  onAdded,
}: {
  trip: Trip;
  destinations: Destination[];
  existing: ChecklistItem[];
  onClose: () => void;
  onAdded: (items: ChecklistItem[]) => void;
}) {
  const pushToast = useAppStore((s) => s.pushToast);
  const [suggestions, setSuggestions] = useState<PackingSuggestion[] | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Weather and itinerary make the list better, but it still works without them.
      const weather = await Promise.all(
        destinations.slice(0, 3).map((d) =>
          getTripWeather(d.latitude, d.longitude, trip.startDate, trip.endDate)
            .then((w) => (w ? summarize(w) : null))
            .catch(() => null),
        ),
      );
      const itinerary = await itineraryApi.getItinerary(trip.id).catch(() => null);
      const have = new Set(existing.map((i) => i.text.toLowerCase()));
      const list = suggestPacking({
        days: Math.max(1, daysUntil(trip.endDate) - daysUntil(trip.startDate) + 1),
        destinations,
        weather: weather.filter((w): w is WeatherSummary => w !== null),
        activities: itinerary?.days.flatMap((d) => d.items.map((i) => i.title)) ?? [],
      }).filter((s) => !have.has(s.text.toLowerCase()));
      if (!cancelled) {
        setSuggestions(list);
        setPicked(new Set(list.map((s) => s.text)));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [trip, destinations, existing]);

  const add = async () => {
    setAdding(true);
    try {
      onAdded(await planningApi.addChecklistItems(trip.id, [...picked]));
      pushToast(`Added ${picked.size} item${picked.size === 1 ? "" : "s"} to the checklist`, "success");
    } catch (err) {
      pushToast((err as Error).message, "error");
      setAdding(false);
    }
  };

  return (
    <div className="mb-4 p-3 rounded-xl bg-ink/[0.03] dark:bg-white/5">
      {suggestions === null ? (
        <p className="text-xs text-ink-soft">Checking the weather and your itinerary…</p>
      ) : suggestions.length === 0 ? (
        <p className="text-xs text-ink-soft">Your checklist already covers everything we'd suggest.</p>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto">
          {suggestions.map((s) => (
            <label key={s.text} className="flex items-start gap-2.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={picked.has(s.text)}
                onChange={() =>
                  setPicked((prev) => {
                    const next = new Set(prev);
                    if (next.has(s.text)) next.delete(s.text);
                    else next.add(s.text);
                    return next;
                  })
                }
                className="mt-1 accent-forest-500"
              />
              <span className="flex-1">
                {s.text}
                <span className="block text-[11px] text-ink-soft dark:text-white/40">{s.reason}</span>
              </span>
            </label>
          ))}
        </div>
      )}
      <div className="flex gap-2 justify-end mt-3">
        <button onClick={onClose} className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-ink/15 dark:border-white/20">
          Close
        </button>
        {suggestions && suggestions.length > 0 && (
          <button
            onClick={add}
            disabled={adding || picked.size === 0}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-forest-500 text-white hover:bg-forest-600 disabled:opacity-40"
          >
            {adding ? "Adding…" : `Add ${picked.size} item${picked.size === 1 ? "" : "s"}`}
          </button>
        )}
      </div>
    </div>
  );
}
