import { useEffect, useState } from "react";
import { Check, Clock, Sparkles } from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { listPricingPlans, type PricingPlan } from "../api/pricing.api";

export default function Upgrade() {
  const [plans, setPlans] = useState<PricingPlan[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    listPricingPlans()
      .then(setPlans)
      .catch(() => setError(true));
  }, []);

  return (
    <div>
      <TopBar
        title="Upgrade to Pro"
        subtitle="Unlock deeper AI planning, richer stats, and premium sharing."
      />
      <div className="px-5 md:px-8 pb-10 max-w-3xl">
        <p className="flex items-start gap-2 text-sm text-forest-600 dark:text-forest-400 bg-forest-50 dark:bg-forest-500/10 px-4 py-3 rounded-xl mb-6">
          <Sparkles size={15} className="shrink-0 mt-0.5" />
          <span>
            Paid plans aren't available yet. During early access, every current
            feature is free for everyone — no payment needed.
          </span>
        </p>
        {error && (
          <p className="text-sm text-coral-500 bg-coral-500/10 px-4 py-3 rounded-xl mb-5">
            Unable to load pricing plans right now. Please try again shortly.
          </p>
        )}
        {!plans && !error && (
          <p className="text-sm text-ink-soft dark:text-white/50">
            Loading plans…
          </p>
        )}
        {plans && plans.length === 0 && (
          <p className="text-sm text-ink-soft dark:text-white/50">
            No pricing plans are configured yet.
          </p>
        )}
        {plans && plans.length > 0 && (
          <div className="grid md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.code}
                className={`rounded-3xl p-6 relative ${
                  plan.code === "pro"
                    ? "border-2 border-forest-500 bg-gradient-to-br from-forest-50 to-white dark:from-forest-500/10 dark:to-[#1c2024]"
                    : "border border-ink/8 dark:border-white/10 bg-white dark:bg-[#1c2024]"
                }`}
              >
                {plan.price > 0 && (
                  <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-forest-500 text-white text-[11px] font-semibold flex items-center gap-1">
                    <Sparkles size={11} />{" "}
                    {plan.code === "premium" ? "Best value" : "Popular"}
                  </span>
                )}
                <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-1">
                  {plan.name}
                </p>
                <p className="font-display text-3xl mb-4">
                  ₹{plan.price}
                  {plan.price > 0 && (
                    <span className="text-sm text-ink-soft">
                      /{plan.billing_period}
                    </span>
                  )}
                </p>
                <ul className="flex flex-col gap-2.5 mb-5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-ink-soft dark:text-white/60"
                    >
                      <Check size={14} className="text-forest-500 shrink-0" />{" "}
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.price === 0 ? (
                  <p className="text-xs text-ink-soft dark:text-white/40">
                    You're currently on the Free plan — all current features
                    remain fully usable.
                  </p>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 rounded-full bg-forest-500/40 dark:bg-forest-500/30 text-white text-sm font-semibold cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <Clock size={14} /> Coming soon
                    </button>
                    <p className="text-xs text-ink-soft dark:text-white/40 mt-2 text-center">
                      Checkout isn't live yet — everything is free during early
                      access.
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
