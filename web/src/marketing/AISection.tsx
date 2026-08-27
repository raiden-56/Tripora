import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, MapPin, Sparkles, User } from "lucide-react";
import { SectionHeading } from "./shared/SectionHeading";
import { destinations } from "../data/mockData";
import {
  generateItinerary,
  type GeneratedItinerary,
} from "../utils/aiAssistant";

const RECOMMENDATION_CARDS = [
  {
    name: "Chikmagalur",
    why: "Coffee-scented hills right next to Coorg — a natural next stop.",
    season: "Oct – Feb",
    duration: "2–3 days",
    style: "Nature & Coffee",
    image: "https://picsum.photos/seed/chikmagalur-marketing/500/380",
  },
  {
    name: "Wayanad",
    why: "Misty Western Ghats forests, similar to what you loved in Coorg.",
    season: "Oct – May",
    duration: "3 days",
    style: "Wildlife & Nature",
    image: "https://picsum.photos/seed/wayanad-marketing/500/380",
  },
  {
    name: "Gokarna",
    why: "Laid-back coastal cliffs — a different pace from Hampi's ruins.",
    season: "Nov – Mar",
    duration: "2–3 days",
    style: "Beaches",
    image: "https://picsum.photos/seed/gokarna-marketing/500/380",
  },
];

export function AISection({ onStartJourney }: { onStartJourney: () => void }) {
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [generating, setGenerating] = useState(false);
  const coorg = destinations.find((d) => d.id === "coorg");

  const generate = () => {
    setGenerating(true);
    setItinerary(null);
    setTimeout(() => {
      setItinerary(
        generateItinerary({
          from: "Bangalore",
          to: "Coorg",
          days: 3,
          budget: 15000,
          style: "Adventure",
          destination: coorg,
        }),
      );
      setGenerating(false);
    }, 700);
  };

  return (
    <section className="py-24 md:py-32 px-6 md:px-10 max-w-6xl mx-auto">
      <SectionHeading
        eyebrow="Canvas AI"
        title="Your next adventure is closer than you think."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        className="max-w-xl mx-auto mt-14 rounded-3xl border border-ink/8 dark:border-white/10 bg-white dark:bg-[#1c2024] shadow-soft-lg p-6"
      >
        <div className="flex gap-2.5 mb-4 flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-ink text-white dark:bg-white dark:text-ink flex items-center justify-center shrink-0">
            <User size={14} />
          </div>
          <div className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm bg-ink text-white dark:bg-white dark:text-ink">
            I loved Coorg and Hampi. Where should I go next?
          </div>
        </div>
        <div className="flex gap-2.5">
          <div className="w-8 h-8 rounded-full bg-forest-50 dark:bg-white/10 text-forest-500 flex items-center justify-center shrink-0">
            <Bot size={14} />
          </div>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "auto" }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.3 }}
            className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm bg-ink/5 dark:bg-white/5 overflow-hidden whitespace-nowrap"
          >
            Based on your journey, you might love Chikmagalur, Wayanad and
            Gokarna.
          </motion.div>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
        {RECOMMENDATION_CARDS.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="rounded-2xl overflow-hidden bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft"
          >
            <img
              src={c.image}
              alt={c.name}
              className="w-full h-28 object-cover"
            />
            <div className="p-4">
              <p className="font-semibold text-sm mb-1">{c.name}</p>
              <p className="text-xs text-ink-soft dark:text-white/50 mb-3 line-clamp-2">
                {c.why}
              </p>
              <div className="flex flex-wrap gap-1.5 text-[10px] text-ink-soft dark:text-white/50 mb-3">
                <span className="px-2 py-0.5 rounded-full bg-ink/5 dark:bg-white/5">
                  {c.season}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-ink/5 dark:bg-white/5">
                  {c.duration}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-ink/5 dark:bg-white/5">
                  {c.style}
                </span>
              </div>
              <button
                onClick={onStartJourney}
                className="w-full py-1.5 rounded-full bg-forest-500 text-white text-xs font-semibold hover:bg-forest-600"
              >
                Explore Destination
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-24 text-center">
        <SectionHeading
          title={
            <>
              Tell us where.
              <br />
              We'll help you plan.
            </>
          }
        />
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-6 max-w-4xl mx-auto mt-10">
        <div className="rounded-3xl border border-ink/8 dark:border-white/10 bg-white dark:bg-[#1c2024] p-5 shadow-soft flex flex-col gap-3 text-sm h-fit">
          <Row label="Starting point" value="Bangalore" />
          <Row label="Destination" value="Coorg" />
          <Row label="Duration" value="3 days" />
          <Row label="Budget" value="₹15,000" />
          <Row label="Travel style" value="Adventure" />
          <button
            onClick={generate}
            className="mt-2 w-full py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition flex items-center justify-center gap-1.5"
          >
            <Sparkles size={14} /> Generate Trip
          </button>
        </div>

        <div className="rounded-3xl border border-ink/8 dark:border-white/10 bg-white dark:bg-[#1c2024] shadow-soft p-5 min-h-[240px]">
          {!itinerary && !generating && (
            <div className="h-full flex flex-col items-center justify-center text-center py-10 text-ink-soft dark:text-white/40">
              <Sparkles size={20} className="mb-2" />
              <p className="text-sm">
                Click "Generate Trip" to see a live AI itinerary.
              </p>
            </div>
          )}
          {generating && (
            <p className="text-sm text-ink-soft text-center py-16">
              Planning your trip…
            </p>
          )}
          {itinerary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-4"
            >
              {itinerary.days.map((day, i) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3.5 rounded-xl border border-ink/8 dark:border-white/10"
                >
                  <p className="text-xs font-semibold text-forest-600 dark:text-forest-400 mb-1">
                    Day {day.day}
                  </p>
                  <p className="text-sm font-medium mb-1 flex items-center gap-1">
                    <MapPin size={12} />
                    {day.places.join(", ")}
                  </p>
                  <p className="text-xs text-ink-soft dark:text-white/50">
                    {day.activities.join(" · ")}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-ink-soft dark:text-white/40 uppercase tracking-wide">
        {label}
      </p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
