import { motion } from "framer-motion";
import { Camera, Flag, Flame, Globe2, Map, Trophy } from "lucide-react";
import type { Achievement } from "../../types";

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  trophy: Trophy,
  globe: Globe2,
  flag: Flag,
  camera: Camera,
  map: Map,
  flame: Flame,
};

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const Icon = ICONS[achievement.icon] ?? Trophy;
  const pct = Math.min(
    100,
    Math.round((achievement.progress / achievement.target) * 100),
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-2xl border transition ${
        achievement.unlocked
          ? "bg-gradient-to-br from-amber-400/15 to-forest-400/10 border-amber-400/30"
          : "bg-ink/[0.02] dark:bg-white/5 border-ink/8 dark:border-white/10 opacity-60"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${achievement.unlocked ? "bg-amber-400/20 text-amber-600" : "bg-ink/5 dark:bg-white/10 text-ink-soft"}`}
      >
        <Icon size={20} />
      </div>
      <p className="font-semibold text-sm">{achievement.title}</p>
      <p className="text-xs text-ink-soft dark:text-white/50 mt-0.5">
        {achievement.description}
      </p>
      {!achievement.unlocked && (
        <div className="mt-2.5">
          <div className="h-1.5 rounded-full bg-ink/8 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-forest-500 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[11px] text-ink-soft dark:text-white/40 mt-1">
            {achievement.progress}/{achievement.target}
          </p>
        </div>
      )}
    </motion.div>
  );
}
