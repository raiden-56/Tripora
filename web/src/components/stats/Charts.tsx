import { motion } from "framer-motion";

export function BarChart({
  data,
  colorClass = "bg-forest-500",
}: {
  data: { label: string; value: number }[];
  colorClass?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((d) => (
        <div
          key={d.label}
          className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
        >
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: `${(d.value / max) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`w-full rounded-t-lg ${colorClass} relative group min-h-[4px]`}
          >
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-ink-soft dark:text-white/60">
              {d.value}
            </span>
          </motion.div>
          <span className="text-[11px] text-ink-soft dark:text-white/50">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function HorizontalBarList({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex flex-col gap-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium">{d.label}</span>
            <span className="text-ink-soft dark:text-white/50">{d.value}</span>
          </div>
          <div className="h-2 rounded-full bg-ink/8 dark:bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(d.value / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-sky-500 rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
