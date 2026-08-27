import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin } from "lucide-react";
import { SectionHeading } from "./shared/SectionHeading";
import { ROAD_TRIP_ROUTE } from "./shared/marketingData";

const PATH_D =
  "M 40 30 C 140 30, 140 110, 240 110 S 340 190, 440 190 S 540 270, 640 270";

export function RoadTripSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 40%"],
  });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const offsetDistance = useTransform(
    scrollYProgress,
    (v) => `${Math.min(100, Math.max(0, v * 100))}%`,
  );

  return (
    <section
      ref={ref}
      className="py-24 md:py-32 px-6 md:px-10 max-w-5xl mx-auto"
    >
      <SectionHeading
        title={
          <>
            Your route.
            <br />
            Your story.
          </>
        }
      />

      <div className="relative mt-16 h-[320px] md:h-[300px]">
        <svg viewBox="0 0 680 300" className="w-full h-full" fill="none">
          <path
            d={PATH_D}
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="1 8"
            strokeLinecap="round"
            className="text-ink/10 dark:text-white/10"
          />
          <motion.path
            d={PATH_D}
            stroke="url(#route-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ pathLength }}
          />
          <defs>
            <linearGradient
              id="route-gradient"
              x1="0"
              y1="0"
              x2="680"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#2f8a4f" />
              <stop offset="1" stopColor="#3576e0" />
            </linearGradient>
          </defs>
        </svg>

        <motion.div
          className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-forest-500 border-2 border-white shadow-lg"
          style={{
            offsetPath: `path("${PATH_D}")`,
            offsetDistance,
            offsetRotate: "0deg",
            top: 0,
            left: 0,
          }}
        />

        <div className="absolute inset-0 grid grid-cols-5">
          {ROAD_TRIP_ROUTE.map((stop, i) => (
            <motion.div
              key={stop}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`flex flex-col items-center text-center ${i % 2 === 0 ? "self-start pt-2" : "self-end pb-2"}`}
            >
              <span className="px-3 py-1.5 rounded-full bg-white dark:bg-[#1c2024] border border-ink/10 dark:border-white/10 shadow-soft text-xs font-semibold flex items-center gap-1">
                <MapPin size={11} className="text-forest-500" /> {stop}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
