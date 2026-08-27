import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  light,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  light?: boolean;
}) {
  return (
    <div
      className={
        align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-xl"
      }
    >
      {eyebrow && (
        <Reveal>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
              light
                ? "bg-white/10 text-white"
                : "bg-forest-50 dark:bg-white/10 text-forest-600 dark:text-forest-400"
            }`}
          >
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2
          className={`font-display text-3xl md:text-[42px] leading-[1.1] tracking-tight ${
            light ? "text-white" : "text-ink dark:text-white"
          }`}
        >
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.1}>
          <p
            className={`mt-4 text-base md:text-lg ${light ? "text-white/70" : "text-ink-soft dark:text-white/60"}`}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
