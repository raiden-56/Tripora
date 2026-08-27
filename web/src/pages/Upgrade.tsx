import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { useAppStore } from "../store/useAppStore";
import { listPricingPlans, type PricingPlan } from "../api/pricing.api";

export default function Upgrade() {
  const pushToast = useAppStore((s) => s.pushToast);
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
                  <button
                    onClick={() =>
                      pushToast(
                        `${plan.name} plan checkout is launching soon — you'll be notified.`,
                        "info",
                      )
                    }
                    className="w-full py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition"
                  >
                    Notify Me
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
