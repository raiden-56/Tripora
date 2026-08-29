import { useEffect, useState } from "react";
import { Compass, Loader2, MapPinned, Route, Sparkles, UtensilsCrossed } from "lucide-react";
import clsx from "clsx";
import { TopBar } from "../components/layout/TopBar";
import { EmptyState } from "../components/common/EmptyState";
import * as plannerApi from "../api/planner.api";
import type { TripPlan } from "../api/planner.api";
import { useAppStore } from "../store/useAppStore";

const TRAVEL_STYLES = ["Relaxed", "Balanced", "Packed", "Adventure", "Luxury", "Budget"];
const INTEREST_OPTIONS = [
  "Nature", "Food", "Culture", "Adventure", "Nightlife", "Shopping", "History", "Relaxation",
];

const ACTIVITY_ICON: Record<string, React.ReactNode> = {
  food: <UtensilsCrossed size={14} />,
  place: <MapPinned size={14} />,
  activity: <Compass size={14} />,
};

function emptyForm() {
  return {
    origin: "",
    destination: "",
    days: 3,
    people: 1,
    budget: 15000,
    travelStyle: TRAVEL_STYLES[1],
    interests: [] as string[],
  };
}

export default function Planner() {
  const pushToast = useAppStore((s) => s.pushToast);
  const [form, setForm] = useState(emptyForm());
  const [generating, setGenerating] = useState(false);
  const [plans, setPlans] = useState<TripPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [activePlan, setActivePlan] = useState<TripPlan | null>(null);

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
    if (!form.origin.trim() || !form.destination.trim()) {
      pushToast("Add both an origin and a destination.", "error");
      return;
    }
    setGenerating(true);
    try {
      const plan = await plannerApi.generatePlan(form);
      setPlans((p) => [plan, ...p]);
      setActivePlan(plan);
      pushToast("Your itinerary is ready.", "success");
    } catch {
      pushToast("Could not generate an itinerary. Try again.", "error");
    } finally {
      setGenerating(false);
    }
  }

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
                value={form.origin}
                onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
                placeholder="Bengaluru"
                className="mt-1 w-full rounded-xl border border-ink/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-forest-500"
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
                className="mt-1 w-full rounded-xl border border-ink/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-forest-500"
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
                className="mt-1 w-full rounded-xl border border-ink/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-forest-500"
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
                className="mt-1 w-full rounded-xl border border-ink/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-forest-500"
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
                className="mt-1 w-full rounded-xl border border-ink/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-forest-500"
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
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-2xl mb-1">
                    {activePlan.origin} → {activePlan.destinationName}
                  </h2>
                  <p className="text-sm text-ink-soft dark:text-white/50">
                    {activePlan.routeDescription}
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-right">
                    <p className="text-ink-soft dark:text-white/50 text-xs">Estimated cost</p>
                    <p className="font-semibold">
                      ₹{activePlan.estimatedBudgetMin?.toLocaleString()} – ₹
                      {activePlan.estimatedBudgetMax?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-ink-soft dark:text-white/50 text-xs">Distance</p>
                    <p className="font-semibold">{activePlan.distanceKm} km</p>
                  </div>
                </div>
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
