import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BedDouble,
  Bus,
  Camera,
  Download,
  MapPin,
  Pencil,
  Plus,
  Route,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import clsx from "clsx";
import * as itineraryApi from "../../api/itinerary.api";
import * as plannerApi from "../../api/planner.api";
import type { Itinerary, ItineraryDay, ItineraryItem, ItineraryKind } from "../../api/itinerary.api";
import { useAppStore } from "../../store/useAppStore";
import { confirmAction } from "../../store/useConfirmStore";
import type { TripRole } from "../../types";
import { EmptyState } from "../common/EmptyState";

const KINDS: { value: ItineraryKind; label: string; icon: typeof MapPin }[] = [
  { value: "activity", label: "Activity", icon: Camera },
  { value: "place", label: "Place", icon: MapPin },
  { value: "food", label: "Food", icon: UtensilsCrossed },
  { value: "transport", label: "Transport", icon: Bus },
  { value: "stay", label: "Stay", icon: BedDouble },
];
const KIND_ICON = Object.fromEntries(KINDS.map((k) => [k.value, k.icon])) as Record<ItineraryKind, typeof MapPin>;
const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function dayLabel(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export function TripItineraryTab({ tripId, role }: { tripId: string; role: TripRole }) {
  const pushToast = useAppStore((s) => s.pushToast);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [importing, setImporting] = useState(false);
  const canEdit = role !== "viewer";

  useEffect(() => {
    let cancelled = false;
    itineraryApi
      .getItinerary(tripId)
      .then((it) => !cancelled && setItinerary(it))
      .catch((err: Error) => {
        if (!cancelled) {
          setItinerary({ days: [], totalCost: 0 });
          pushToast(err.message, "error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tripId, pushToast]);

  const fail = (err: unknown) => pushToast((err as Error).message, "error");
  const reload = () => itineraryApi.getItinerary(tripId).then(setItinerary).catch(fail);

  if (itinerary === null) {
    return <p className="text-sm text-ink-soft dark:text-white/50">Loading itinerary…</p>;
  }

  const hasStops = itinerary.days.some((d) => d.items.length > 0);

  const move = async (day: ItineraryDay, index: number, delta: -1 | 1) => {
    const ids = day.items.map((i) => i.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      setItinerary(await itineraryApi.saveOrder(tripId, [{ dayNumber: day.dayNumber, itemIds: ids }]));
    } catch (err) {
      fail(err);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs text-ink-soft dark:text-white/50">
          {hasStops
            ? `${itinerary.days.reduce((n, d) => n + d.items.length, 0)} stops` +
              (itinerary.totalCost > 0 ? ` · ${rupees(itinerary.totalCost)} planned` : "")
            : "Plan each day of the trip, stop by stop."}
        </p>
        {canEdit && (
          <button
            onClick={() => setImporting((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-ink/12 dark:border-white/15 hover:bg-ink/5 dark:hover:bg-white/5"
          >
            <Download size={12} /> Import from Trip Planner
          </button>
        )}
      </div>

      {importing && (
        <ImportPlan
          tripId={tripId}
          replaceWarning={hasStops}
          onDone={(it) => {
            setItinerary(it);
            setImporting(false);
          }}
        />
      )}

      {!hasStops && !canEdit && (
        <EmptyState
          compact
          icon={<Route size={20} />}
          title="No itinerary yet"
          description="The trip owner hasn't planned the days yet."
        />
      )}

      {itinerary.days.map((day) => (
        <DaySection
          key={day.dayNumber}
          tripId={tripId}
          day={day}
          dayCount={itinerary.days.length}
          canEdit={canEdit}
          onChanged={setItinerary}
          onReload={reload}
          onMove={(index, delta) => move(day, index, delta)}
        />
      ))}
    </div>
  );
}

function DaySection({
  tripId,
  day,
  dayCount,
  canEdit,
  onChanged,
  onReload,
  onMove,
}: {
  tripId: string;
  day: ItineraryDay;
  dayCount: number;
  canEdit: boolean;
  onChanged: (it: Itinerary) => void;
  onReload: () => void;
  onMove: (index: number, delta: -1 | 1) => void;
}) {
  const pushToast = useAppStore((s) => s.pushToast);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(day.title ?? "");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const dayCost = day.items.reduce((sum, i) => sum + (i.cost ?? 0), 0);

  const saveTitle = async () => {
    setEditingTitle(false);
    if (title.trim() === (day.title ?? "")) return;
    try {
      onChanged(await itineraryApi.setDayTitle(tripId, day.dayNumber, title.trim()));
    } catch (err) {
      pushToast((err as Error).message, "error");
      setTitle(day.title ?? "");
    }
  };

  const remove = async (item: ItineraryItem) => {
    if (!(await confirmAction({ title: `Remove "${item.title}"?`, confirmLabel: "Remove", danger: true }))) return;
    try {
      await itineraryApi.deleteItem(tripId, item.id);
      onReload();
    } catch (err) {
      pushToast((err as Error).message, "error");
    }
  };

  return (
    <section>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wide text-forest-600 dark:text-forest-400 shrink-0">
          Day {day.dayNumber}
        </span>
        <span className="text-xs text-ink-soft dark:text-white/50 shrink-0">{dayLabel(day.date)}</span>
        {editingTitle ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveTitle();
              if (e.key === "Escape") {
                setTitle(day.title ?? "");
                setEditingTitle(false);
              }
            }}
            maxLength={200}
            placeholder="Name this day"
            className="flex-1 min-w-0 px-2 py-0.5 rounded-lg border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400"
          />
        ) : (
          <button
            onClick={() => canEdit && setEditingTitle(true)}
            disabled={!canEdit}
            className={clsx(
              "flex-1 min-w-0 text-left text-sm font-semibold truncate",
              !day.title && "text-ink-soft/60 dark:text-white/30 font-normal",
            )}
          >
            {day.title || (canEdit ? "Name this day…" : "")}
          </button>
        )}
        {dayCost > 0 && <span className="text-xs text-ink-soft dark:text-white/50 shrink-0">{rupees(dayCost)}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        {day.items.map((item, index) =>
          editingId === item.id ? (
            <ItemForm
              key={item.id}
              tripId={tripId}
              dayNumber={day.dayNumber}
              dayCount={dayCount}
              item={item}
              onDone={() => {
                setEditingId(null);
                onReload();
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <ItemRow
              key={item.id}
              item={item}
              canEdit={canEdit}
              isFirst={index === 0}
              isLast={index === day.items.length - 1}
              onEdit={() => setEditingId(item.id)}
              onDelete={() => remove(item)}
              onUp={() => onMove(index, -1)}
              onDown={() => onMove(index, 1)}
            />
          ),
        )}
        {canEdit &&
          (adding ? (
            <ItemForm
              tripId={tripId}
              dayNumber={day.dayNumber}
              dayCount={dayCount}
              onDone={() => {
                setAdding(false);
                onReload();
              }}
              onCancel={() => setAdding(false)}
            />
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-ink/15 dark:border-white/15 text-xs font-semibold text-ink-soft hover:border-forest-400 hover:text-forest-600"
            >
              <Plus size={13} /> Add a stop
            </button>
          ))}
      </div>
    </section>
  );
}

function ItemRow({
  item,
  canEdit,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onUp,
  onDown,
}: {
  item: ItineraryItem;
  canEdit: boolean;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onUp: () => void;
  onDown: () => void;
}) {
  const Icon = KIND_ICON[item.kind] ?? Camera;
  return (
    <div className="group flex items-start gap-3 p-3 rounded-xl border border-ink/8 dark:border-white/10">
      <span className="w-7 h-7 rounded-lg bg-forest-500/10 text-forest-600 dark:text-forest-400 flex items-center justify-center shrink-0">
        <Icon size={14} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {item.startTime && <span className="text-ink-soft dark:text-white/50 mr-1.5">{item.startTime}</span>}
          {item.title}
        </p>
        {(item.notes || item.cost != null) && (
          <p className="text-xs text-ink-soft dark:text-white/50 mt-0.5 whitespace-pre-line">
            {[item.cost != null ? rupees(item.cost) : null, item.notes].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
      {canEdit && (
        <div className="flex items-center gap-0.5 shrink-0 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 transition">
          <IconButton label="Move up" onClick={onUp} disabled={isFirst}>
            <ArrowUp size={13} />
          </IconButton>
          <IconButton label="Move down" onClick={onDown} disabled={isLast}>
            <ArrowDown size={13} />
          </IconButton>
          <IconButton label="Edit" onClick={onEdit}>
            <Pencil size={13} />
          </IconButton>
          <IconButton label="Remove" onClick={onDelete} danger>
            <Trash2 size={13} />
          </IconButton>
        </div>
      )}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={clsx(
        "w-7 h-7 rounded-lg flex items-center justify-center text-ink-soft disabled:opacity-25",
        danger ? "hover:text-coral-500" : "hover:text-ink dark:hover:text-white hover:bg-ink/5 dark:hover:bg-white/5",
      )}
    >
      {children}
    </button>
  );
}

function ItemForm({
  tripId,
  dayNumber,
  dayCount,
  item,
  onDone,
  onCancel,
}: {
  tripId: string;
  dayNumber: number;
  dayCount: number;
  item?: ItineraryItem;
  onDone: () => void;
  onCancel: () => void;
}) {
  const pushToast = useAppStore((s) => s.pushToast);
  const [title, setTitle] = useState(item?.title ?? "");
  const [kind, setKind] = useState<ItineraryKind>(item?.kind ?? "activity");
  const [startTime, setStartTime] = useState(item?.startTime ?? "");
  const [cost, setCost] = useState(item?.cost != null ? String(item.cost) : "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [day, setDay] = useState(item?.dayNumber ?? dayNumber);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const input: itineraryApi.ItemInput = {
      dayNumber: day,
      title: title.trim(),
      kind,
      startTime,
      notes,
      cost: cost === "" ? null : Number(cost),
    };
    setSaving(true);
    try {
      if (item) await itineraryApi.updateItem(tripId, item.id, input);
      else await itineraryApi.addItem(tripId, input);
      onDone();
    } catch (err) {
      pushToast((err as Error).message, "error");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-3 rounded-xl border border-forest-400/60 flex flex-col gap-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        placeholder="What's the plan? e.g. Abbey Falls"
        className={inputClass}
      />
      <div className="flex gap-2 flex-wrap">
        <select value={kind} onChange={(e) => setKind(e.target.value as ItineraryKind)} className={clsx(inputClass, "w-auto")} aria-label="Type">
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          aria-label="Start time"
          className={clsx(inputClass, "w-auto")}
        />
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="Cost ₹"
          aria-label="Cost"
          className={clsx(inputClass, "w-28")}
        />
        {item && dayCount > 1 && (
          <select value={day} onChange={(e) => setDay(Number(e.target.value))} className={clsx(inputClass, "w-auto")} aria-label="Day">
            {Array.from({ length: dayCount }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Day {i + 1}
              </option>
            ))}
          </select>
        )}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={2000}
        rows={2}
        placeholder="Notes (optional)"
        className={inputClass}
      />
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-ink/15 dark:border-white/20">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-forest-500 text-white hover:bg-forest-600 disabled:opacity-40"
        >
          {saving ? "Saving…" : item ? "Save" : "Add stop"}
        </button>
      </div>
    </form>
  );
}

function ImportPlan({
  tripId,
  replaceWarning,
  onDone,
}: {
  tripId: string;
  replaceWarning: boolean;
  onDone: (it: Itinerary) => void;
}) {
  const pushToast = useAppStore((s) => s.pushToast);
  const [plans, setPlans] = useState<plannerApi.TripPlan[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    plannerApi
      .listPlans()
      .then(setPlans)
      .catch((err: Error) => {
        setPlans([]);
        pushToast(err.message, "error");
      });
  }, [pushToast]);

  const run = async (planId: string, mode: "replace" | "append") => {
    if (
      mode === "replace" &&
      replaceWarning &&
      !(await confirmAction({
        title: "Replace this itinerary?",
        message: "The current stops and day names are replaced by the plan's.",
        confirmLabel: "Replace",
        danger: true,
      }))
    )
      return;
    setBusy(true);
    try {
      onDone(await itineraryApi.importPlan(tripId, planId, mode));
      pushToast("Plan imported", "success");
    } catch (err) {
      pushToast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  if (plans === null) return <p className="text-xs text-ink-soft">Loading your plans…</p>;
  if (plans.length === 0) {
    return (
      <p className="text-xs text-ink-soft dark:text-white/50 p-3 rounded-xl bg-ink/[0.03] dark:bg-white/5">
        You haven't generated any plans yet — create one in the Trip Planner first.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-ink/[0.03] dark:bg-white/5">
      {plans.map((p) => (
        <div key={p.id} className="flex items-center gap-2 text-sm">
          <span className="flex-1 min-w-0 truncate">
            {p.origin} → {p.destinationName} · {p.days} days
          </span>
          <button
            disabled={busy}
            onClick={() => run(p.id, "replace")}
            className="px-2.5 py-1 rounded-full text-xs font-semibold bg-forest-500 text-white disabled:opacity-40"
          >
            {replaceWarning ? "Replace" : "Use"}
          </button>
          {replaceWarning && (
            <button
              disabled={busy}
              onClick={() => run(p.id, "append")}
              className="px-2.5 py-1 rounded-full text-xs font-semibold border border-ink/15 dark:border-white/20 disabled:opacity-40"
            >
              Add
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-1.5 rounded-lg border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400";
