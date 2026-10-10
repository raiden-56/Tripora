import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarPlus,
  Compass,
  Loader2,
  MapPinned,
  Route,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import clsx from "clsx";
import { TopBar } from "../components/layout/TopBar";
import { EmptyState } from "../components/common/EmptyState";
import * as plannerApi from "../api/planner.api";
import * as itineraryApi from "../api/itinerary.api";
import type { TripPlan } from "../api/planner.api";
import { ApiError } from "../api/client";
import { useAppStore } from "../store/useAppStore";
import { confirmAction } from "../store/useConfirmStore";

const TRAVEL_STYLES = ["Relaxed", "Balanced", "Packed", "Adventure", "Luxury", "Budget"];
const INTEREST_OPTIONS = [
  "Nature", "Food", "Culture", "Adventure", "Nightlife", "Shopping", "History", "Relaxation",
];

const ACTIVITY_ICON: Record<string, React.ReactNode> = {
  food: <UtensilsCrossed size={14} />,
  place: <MapPinned size={14} />,
  activity: <Compass size={14} />,
};

const inputClass =
  "mt-1 w-full rounded-xl border border-ink/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-forest-500";

function emptyForm() {
  return {
    /** null until the user edits it, so the field can follow user.homeLocation once it loads. */
    origin: null as string | null,
    destination: "",
    days: 3,
    people: 1,
    budget: 15000,
    travelStyle: TRAVEL_STYLES[1],
    interests: [] as string[],
  };
}

function formatInr(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

/** "₹a – ₹b", a one-sided label when only one bound is known, or null when neither is. */
function formatBudgetRange(min: number | null, max: number | null): string | null {
  if (min != null && max != null) {
    return min === max ? formatInr(min) : `${formatInr(min)} – ${formatInr(max)}`;
  }
  if (min != null) return `From ${formatInr(min)}`;
  if (max != null) return `Up to ${formatInr(max)}`;
  return null;
}

function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Adds days to a YYYY-MM-DD string in local time (avoids UTC off-by-one shifts). */
function addDaysIso(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  return toIsoDate(new Date(y, m - 1, d + days));
}

/** Short summary of a plan for a trip's notes (the days themselves become the trip's itinerary). */
function buildTripNotes(plan: TripPlan): string {
  const header = [`Itinerary: ${plan.origin} → ${plan.destinationName}`];
  if (plan.routeDescription) header.push(`Route: ${plan.routeDescription}`);
  const budget = formatBudgetRange(plan.estimatedBudgetMin, plan.estimatedBudgetMax);
  if (budget) header.push(`Estimated cost: ${budget}`);
  if (plan.distanceKm != null) {
    header.push(`Distance: ${plan.distanceKm.toLocaleString("en-IN")} km`);
  }
  return header.join("\n");
}

export default function Planner() {
  const pushToast = useAppStore((s) => s.pushToast);
  const homeLocation = useAppStore((s) => s.user.homeLocation);
  const [form, setForm] = useState(emptyForm());
  const [generating, setGenerating] = useState(false);
  const [plans, setPlans] = useState<TripPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [activePlan, setActivePlan] = useState<TripPlan | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const origin = form.origin ?? homeLocation ?? "";

  useEffect(() => {
    plannerApi
      .listPlans()
      .then((data) => {
        setPlans(data);
        setActivePlan((current) => current ?? data[0] ?? null);
      })
      .catch(() => pushToast("Could not load your saved itineraries.", "error"))
      .finally(() => setLoadingPlans(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleInterest(interest: string) {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!origin.trim() || !form.destination.trim()) {
      pushToast("Add both an origin and a destination.", "error");
      return;
    }
    setGenerating(true);
    try {
      const plan = await plannerApi.generatePlan({ ...form, origin: origin.trim() });
      setPlans((p) => [plan, ...p]);
      setActivePlan(plan);
      pushToast("Your itinerary is ready.", "success");
    } catch {
      pushToast("Could not generate an itinerary. Try again.", "error");
    } finally {
      setGenerating(false);
    }
  }

  function removePlanLocally(id: string) {
    const fallback = plans.find((p) => p.id !== id) ?? null;
    setPlans((current) => current.filter((p) => p.id !== id));
    setActivePlan((active) => (active?.id === id ? fallback : active));
  }

  async function handleDelete(plan: TripPlan) {
    const ok = await confirmAction({
      title: "Delete this itinerary?",
      message: `${plan.origin} → ${plan.destinationName} will be removed permanently.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    setDeletingId(plan.id);
    try {
      await plannerApi.deletePlan(plan.id);
      removePlanLocally(plan.id);
      pushToast("Itinerary deleted.", "success");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // Already gone on the server; keep the list in sync.
        removePlanLocally(plan.id);
        pushToast("That itinerary no longer exists.", "info");
      } else {
        pushToast(
          err instanceof ApiError ? err.message : "Could not delete the itinerary.",
          "error",
        );
      }
    } finally {
      setDeletingId(null);
    }
  }

  const budgetLabel = activePlan
    ? formatBudgetRange(activePlan.estimatedBudgetMin, activePlan.estimatedBudgetMax)
    : null;

  return (
    <div>
      <TopBar
        title="Trip Planner"
        subtitle="Tell us where you're headed — we'll draft a day-by-day plan."
      />
      <div className="px-5 md:px-8 pb-10 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <form
          onSubmit={handleGenerate}
          className="rounded-3xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft p-5 h-fit space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-soft dark:text-white/50">
                From
              </label>
              <input
                value={origin}
                onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
                placeholder="Bengaluru"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-soft dark:text-white/50">
                To
              </label>
              <input
                value={form.destination}
                onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                placeholder="Coorg"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-soft dark:text-white/50">
                Days
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={form.days}
                onChange={(e) =>
                  setForm((f) => ({ ...f, days: Number(e.target.value) || 1 }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-soft dark:text-white/50">
                People
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={form.people}
                onChange={(e) =>
                  setForm((f) => ({ ...f, people: Number(e.target.value) || 1 }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-soft dark:text-white/50">
                Budget (₹)
              </label>
              <input
                type="number"
                min={0}
                value={form.budget}
                onChange={(e) =>
                  setForm((f) => ({ ...f, budget: Number(e.target.value) || 0 }))
                }
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft dark:text-white/50">
              Travel style
            </label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {TRAVEL_STYLES.map((style) => (
                <button
                  type="button"
                  key={style}
                  onClick={() => setForm((f) => ({ ...f, travelStyle: style }))}
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-xs font-semibold transition",
                    form.travelStyle === style
                      ? "bg-forest-500 text-white"
                      : "bg-ink/5 dark:bg-white/10 text-ink-soft dark:text-white/60",
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft dark:text-white/50">
              Interests
            </label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-xs font-semibold transition",
                    form.interests.includes(interest)
                      ? "bg-sky-500 text-white"
                      : "bg-ink/5 dark:bg-white/10 text-ink-soft dark:text-white/60",
                  )}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition disabled:opacity-60"
          >
            {generating ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles size={15} /> Generate Itinerary
              </>
            )}
          </button>
        </form>

        <div>
          {plans.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-1">
              {plans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePlan(p)}
                  className={clsx(
                    "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition",
                    activePlan?.id === p.id
                      ? "bg-ink text-white dark:bg-white dark:text-ink border-transparent"
                      : "border-ink/10 dark:border-white/10 text-ink-soft dark:text-white/60",
                  )}
                >
                  {p.origin} → {p.destinationName}
                </button>
              ))}
            </div>
          )}

          {loadingPlans ? (
            <div className="flex items-center justify-center py-20 text-ink-soft dark:text-white/40">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : !activePlan ? (
            <EmptyState
              icon={<Route size={22} />}
              title="No itinerary yet"
              description="Fill in the form to generate your first day-by-day trip plan."
            />
          ) : (
            <div className="rounded-3xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <h2 className="font-display text-2xl mb-1">
                    {activePlan.origin} → {activePlan.destinationName}
                  </h2>
                  {activePlan.routeDescription && (
                    <p className="text-sm text-ink-soft dark:text-white/50">
                      {activePlan.routeDescription}
                    </p>
                  )}
                  <span
                    className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      activePlan.generatedBy === "rules"
                        ? "bg-ink/5 text-ink-soft dark:bg-white/10 dark:text-white/60"
                        : "bg-forest-500/10 text-forest-700 dark:text-forest-300"
                    }`}
                    title={
                      activePlan.generatedBy === "rules"
                        ? "The AI planner wasn't available, so this is a simple template you can edit."
                        : "Written by AI — check opening hours and prices before you go."
                    }
                  >
                    {activePlan.generatedBy === "rules" ? "Basic template plan" : "Planned by AI"}
                  </span>
                </div>
                {(budgetLabel || activePlan.distanceKm != null) && (
                  <div className="flex gap-4 text-sm">
                    {budgetLabel && (
                      <div className="text-right">
                        <p className="text-ink-soft dark:text-white/50 text-xs">
                          Estimated cost
                        </p>
                        <p className="font-semibold">{budgetLabel}</p>
                      </div>
                    )}
                    {activePlan.distanceKm != null && (
                      <div className="text-right">
                        <p className="text-ink-soft dark:text-white/50 text-xs">Distance</p>
                        <p className="font-semibold">
                          {activePlan.distanceKm.toLocaleString("en-IN")} km
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <PlanActions
                  key={activePlan.id}
                  plan={activePlan}
                  deleting={deletingId === activePlan.id}
                  onDelete={() => handleDelete(activePlan)}
                />
              </div>

              <div className="space-y-5">
                {activePlan.daysDetail.map((day) => (
                  <div key={day.dayNumber} className="flex gap-4">
                    <div className="shrink-0 w-9 h-9 rounded-full bg-forest-50 dark:bg-white/10 text-forest-500 flex items-center justify-center text-xs font-bold">
                      {day.dayNumber}
                    </div>
                    <div className="flex-1 pb-5 border-b border-ink/8 dark:border-white/10 last:border-0">
                      <p className="font-semibold text-sm mb-2">{day.title}</p>
                      <ul className="space-y-1.5">
                        {day.activities.map((activity, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-sm text-ink-soft dark:text-white/60"
                          >
                            {ACTIVITY_ICON[activity.kind] ?? <Compass size={14} />}
                            {activity.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** "Save as trip" (inline start-date form) and "Delete" for one plan. Keyed by plan id
 * so its state resets when another plan is selected. */
function PlanActions({
  plan,
  deleting,
  onDelete,
}: {
  plan: TripPlan;
  deleting: boolean;
  onDelete: () => void;
}) {
  const addTrip = useAppStore((s) => s.addTrip);
  const pushToast = useAppStore((s) => s.pushToast);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(() => addDaysIso(toIsoDate(new Date()), 14));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const tripDays = Math.max(1, plan.days || plan.daysDetail.length || 1);
  const endDate = startDate ? addDaysIso(startDate, tripDays - 1) : "";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate) {
      pushToast("Pick a start date for the trip.", "error");
      return;
    }
    setSaving(true);
    try {
      const trip = await addTrip({
        title: `Trip to ${plan.destinationName}`,
        startDate,
        endDate,
        status: "planned",
        destinationIds: [],
        notes: buildTripNotes(plan),
      });
      // addTrip shows its own error toast and returns null on failure.
      if (trip) {
        try {
          await itineraryApi.importPlan(trip.id, plan.id);
          pushToast("Trip saved with a day-by-day itinerary", "success");
        } catch {
          pushToast("Trip saved, but its itinerary couldn't be copied — import it from the trip.", "info");
        }
        setSaved(trip.id);
        setOpen(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {saved ? (
          <button
            type="button"
            onClick={() => navigate(`/app/trips?trip=${saved}`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest-500 text-white text-xs font-semibold hover:bg-forest-600 transition"
          >
            <CalendarPlus size={14} /> View in Trips
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest-500 text-white text-xs font-semibold hover:bg-forest-600 transition"
          >
            <CalendarPlus size={14} /> Save as trip
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-ink/10 dark:border-white/10 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition disabled:opacity-60"
        >
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Delete
        </button>
      </div>

      {open && !saved && (
        <form
          onSubmit={handleSave}
          className="flex flex-wrap items-end gap-3 rounded-2xl border border-ink/8 dark:border-white/10 bg-ink/[0.02] dark:bg-white/5 p-4"
        >
          <div>
            <label
              htmlFor={`trip-start-${plan.id}`}
              className="text-xs font-semibold text-ink-soft dark:text-white/50"
            >
              Start date
            </label>
            <input
              id={`trip-start-${plan.id}`}
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={clsx(inputClass, "dark:[color-scheme:dark]")}
            />
          </div>
          <p className="text-xs text-ink-soft dark:text-white/50 pb-2.5">
            {tripDays} {tripDays === 1 ? "day" : "days"}
            {endDate ? ` · ends ${endDate}` : ""}
          </p>
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-ink-soft dark:text-white/60 hover:bg-ink/5 dark:hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest-500 text-white text-xs font-semibold hover:bg-forest-600 transition disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Save trip
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
