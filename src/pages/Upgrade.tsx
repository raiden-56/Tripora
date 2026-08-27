import { Check, Sparkles } from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { useAppStore } from "../store/useAppStore";

const FREE_FEATURES = [
  "Basic map",
  "Destinations",
  "Wishlist",
  "Basic memories",
  "Basic statistics",
  "Basic trip planning",
];
const PRO_FEATURES = [
  "AI trip planning",
  "AI memory stories",
  "Advanced statistics",
  "Travel books",
  "Advanced map styles",
  "Offline packs",
  "Advanced sharing",
  "Unlimited integrations",
];

export default function Upgrade() {
  const pushToast = useAppStore((s) => s.pushToast);

  return (
    <div>
      <TopBar
        title="Upgrade to Pro"
        subtitle="Unlock deeper AI planning, richer stats, and premium sharing."
      />
      <div className="px-5 md:px-8 pb-10 grid md:grid-cols-2 gap-5 max-w-3xl">
        <div className="rounded-3xl border border-ink/8 dark:border-white/10 bg-white dark:bg-[#1c2024] p-6">
          <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-1">
            Free
          </p>
          <p className="font-display text-3xl mb-4">₹0</p>
          <ul className="flex flex-col gap-2.5">
            {FREE_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 text-sm text-ink-soft dark:text-white/60"
              >
                <Check size={14} className="text-forest-500 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-ink-soft dark:text-white/40">
            You're currently on the Free plan — all current features remain
            fully usable.
          </p>
        </div>

        <div className="rounded-3xl border-2 border-forest-500 bg-gradient-to-br from-forest-50 to-white dark:from-forest-500/10 dark:to-[#1c2024] p-6 relative">
          <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-forest-500 text-white text-[11px] font-semibold flex items-center gap-1">
            <Sparkles size={11} /> Coming soon
          </span>
          <p className="text-xs font-semibold text-forest-600 dark:text-forest-400 uppercase tracking-wide mb-1">
            Pro
          </p>
          <p className="font-display text-3xl mb-4">
            ₹499<span className="text-sm text-ink-soft">/mo</span>
          </p>
          <ul className="flex flex-col gap-2.5 mb-5">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-forest-500 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() =>
              pushToast(
                "Pro plans are launching soon — you'll be notified.",
                "info",
              )
            }
            className="w-full py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition"
          >
            Notify Me
          </button>
        </div>
      </div>
    </div>
  );
}
