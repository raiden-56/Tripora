import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Camera, Compass, MapPin, Sparkles } from "lucide-react";
import { destinations, memories } from "../data/mockData";

const STEPS = [
  {
    title: "Where you've been",
    icon: MapPin,
    desc: "Every visited destination drops onto your map, building a living record of everywhere you've explored.",
  },
  {
    title: "What you remember",
    icon: Camera,
    desc: "Photos and memories attach directly to each place — so a destination is never just a pin.",
  },
  {
    title: "Where you're going",
    icon: Compass,
    desc: "Planned trips and your wishlist live on the same map, right alongside where you've already been.",
  },
  {
    title: "What's next",
    icon: Sparkles,
    desc: "Canvas AI studies your journey and surfaces destinations you'll actually love next.",
  },
];

const STEP_MARKERS = [
  destinations.filter((d) => d.status === "visited").slice(0, 6),
  destinations.filter((d) => d.status === "visited").slice(0, 3),
  destinations.filter((d) => d.status === "planned").slice(0, 4),
  destinations.filter((d) => d.status === "wishlist").slice(0, 4),
];

const DOT_POSITIONS = [
  { top: "18%", left: "24%" },
  { top: "30%", left: "62%" },
  { top: "52%", left: "18%" },
  { top: "60%", left: "70%" },
  { top: "74%", left: "40%" },
  { top: "20%", left: "80%" },
];

function StepPanel({
  index,
  active,
  onEnter,
}: {
  index: number;
  active: boolean;
  onEnter: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  const step = STEPS[index];
  const Icon = step.icon;

  useEffect(() => {
    if (inView) onEnter();
  }, [inView, onEnter]);

  return (
    <div
      ref={ref}
      data-story-step={index}
      className="min-h-[70vh] flex items-center py-10"
    >
      <motion.div
        animate={{ opacity: active || inView ? 1 : 0.35 }}
        transition={{ duration: 0.4 }}
        className="max-w-md"
      >
        <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-forest-50 dark:bg-white/10 text-forest-500 mb-5">
          <Icon size={20} />
        </span>
        <p className="text-xs font-semibold text-ink-soft dark:text-white/40 mb-2">
          Step 0{index + 1}
        </p>
        <h3 className="font-display text-3xl mb-3 text-ink dark:text-white">
          {step.title}
        </h3>
        <p className="text-ink-soft dark:text-white/60 text-base">
          {step.desc}
        </p>
      </motion.div>
    </div>
  );
}

export function MapStorySection() {
  const [activeStep, setActiveStep] = useState(0);
  const memoryImages = memories.slice(0, 6);

  return (
    <section
      id="product"
      className="max-w-6xl mx-auto px-6 md:px-10 py-24 md:py-32"
    >
      <div className="grid lg:grid-cols-2 gap-16">
        <div className="hidden lg:block sticky top-28 h-[520px] rounded-[2rem] overflow-hidden border border-ink/8 dark:border-white/10 shadow-soft-lg bg-forest-50/40 dark:bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-forest-50 via-paper to-sky-50 dark:from-white/5 dark:via-transparent dark:to-sky-500/10" />
          <AnimatePresence mode="wait">
            {activeStep === 1 ? (
              <motion.div
                key="memories"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 grid grid-cols-3 gap-2 p-6"
              >
                {memoryImages.map((m, i) => (
                  <motion.img
                    key={m.id}
                    src={m.imageUrl}
                    alt=""
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={`markers-${activeStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                {STEP_MARKERS[activeStep].map((d, i) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: -14, scale: 0.4 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: i * 0.1,
                      type: "spring",
                      stiffness: 220,
                      damping: 16,
                    }}
                    style={DOT_POSITIONS[i % DOT_POSITIONS.length]}
                    className="absolute flex flex-col items-center gap-1"
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg ${
                        d.status === "visited"
                          ? "bg-forest-500"
                          : d.status === "planned"
                            ? "bg-sky-500"
                            : "bg-amber-500"
                      }`}
                    />
                    <span className="px-2 py-0.5 rounded-full bg-white/90 dark:bg-[#1c2024]/90 text-[10px] font-semibold shadow-soft whitespace-nowrap">
                      {d.name}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          {STEPS.map((_, i) => (
            <StepPanel
              key={i}
              index={i}
              active={activeStep === i}
              onEnter={() => setActiveStep(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
