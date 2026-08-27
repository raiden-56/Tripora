import { useState } from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  Bot,
  MapPinned,
  Route,
  Send,
  Sparkles,
  User as UserIcon,
  Utensils,
} from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { EmptyState } from "../components/common/EmptyState";
import { useAppStore } from "../store/useAppStore";
import type { ChatMessage } from "../types";
import {
  generateAssistantReply,
  generateItinerary,
  SUGGESTED_PROMPTS,
  type GeneratedItinerary,
} from "../utils/aiAssistant";
import { TRAVEL_INTERESTS } from "../data/mockData";

const STYLES = [
  "Adventure",
  "Nature",
  "Relaxed",
  "Culture",
  "Luxury",
  "Budget",
];
const COMPANIONS = ["Solo", "Partner", "Friends", "Family"];

export default function CanvasAI() {
  const [tab, setTab] = useState<"chat" | "planner">("chat");
  return (
    <div>
      <TopBar
        title="Canvas AI"
        subtitle="Your personal travel assistant, powered by your own journey."
      />
      <div className="px-5 md:px-8 pb-10">
        <div className="flex gap-1.5 mb-6 bg-ink/5 dark:bg-white/5 p-1 rounded-full w-fit">
          <button
            onClick={() => setTab("chat")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${tab === "chat" ? "bg-white dark:bg-[#1c2024] shadow-soft" : "text-ink-soft dark:text-white/50"}`}
          >
            Ask Canvas AI
          </button>
          <button
            onClick={() => setTab("planner")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${tab === "planner" ? "bg-white dark:bg-[#1c2024] shadow-soft" : "text-ink-soft dark:text-white/50"}`}
          >
            Create Trip with AI
          </button>
        </div>
        {tab === "chat" ? <ChatPanel /> : <TripPlannerPanel />}
      </div>
    </div>
  );
}

function ChatPanel() {
  const destinations = useAppStore((s) => s.destinations);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m0",
      role: "assistant",
      content:
        "Hi! I'm Canvas AI. Ask me where to go next, or let me plan a trip around your travel history.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const reply = generateAssistantReply(text, destinations);
      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: "assistant", content: reply },
      ]);
      setThinking(false);
    }, 500);
  };

  return (
    <div className="max-w-2xl">
      <div className="rounded-3xl border border-ink/8 dark:border-white/10 bg-white dark:bg-[#1c2024] shadow-soft flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-ink text-white dark:bg-white dark:text-ink" : "bg-forest-50 dark:bg-white/10 text-forest-500"}`}
              >
                {m.role === "user" ? <UserIcon size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${m.role === "user" ? "bg-ink text-white dark:bg-white dark:text-ink" : "bg-ink/5 dark:bg-white/5"}`}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
          {thinking && (
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-forest-50 dark:bg-white/10 text-forest-500">
                <Bot size={14} />
              </div>
              <div className="px-4 py-2.5 rounded-2xl text-sm bg-ink/5 dark:bg-white/5 text-ink-soft">
                Thinking…
              </div>
            </div>
          )}
        </div>
        <div className="p-3 border-t border-ink/8 dark:border-white/10 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask Canvas AI anything about your travels…"
            className="flex-1 px-4 py-2.5 rounded-full border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400"
          />
          <button
            onClick={() => send(input)}
            className="w-10 h-10 rounded-full bg-forest-500 text-white flex items-center justify-center shrink-0 hover:bg-forest-600"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {SUGGESTED_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            className="px-3.5 py-1.5 rounded-full border border-ink/12 dark:border-white/15 text-xs font-medium text-ink-soft dark:text-white/60 hover:border-forest-400 hover:text-ink dark:hover:text-white transition"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function TripPlannerPanel() {
  const destinations = useAppStore((s) => s.destinations);
  const pushToast = useAppStore((s) => s.pushToast);

  const [from, setFrom] = useState("Bangalore");
  const [to, setTo] = useState(destinations[0]?.name ?? "");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(15000);
  const [style, setStyle] = useState<string[]>(["Adventure"]);
  const [companions, setCompanions] = useState("Friends");
  const [interests, setInterests] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);

  const toggle = (
    list: string[],
    setList: (v: string[]) => void,
    value: string,
  ) =>
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );

  const generate = () => {
    const destination = destinations.find((d) => d.name === to);
    setItinerary(
      generateItinerary({
        from,
        to,
        days,
        budget,
        style: style.join(", "),
        destination,
      }),
    );
    pushToast("Your AI itinerary is ready", "success");
  };

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-6">
      <div className="rounded-3xl border border-ink/8 dark:border-white/10 bg-white dark:bg-[#1c2024] shadow-soft p-5 h-fit flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
              Starting location
            </span>
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
              Destination
            </span>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={fieldClass}
            >
              {destinations.length === 0 ? (
                <option value="" disabled>
                  Add a destination first
                </option>
              ) : (
                destinations.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
              Number of days
            </span>
            <input
              type="number"
              min={1}
              max={14}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
              Budget (₹)
            </span>
            <input
              type="number"
              min={1000}
              step={500}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className={fieldClass}
            />
          </label>
        </div>
        <div>
          <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
            Travel style
          </span>
          <div className="flex flex-wrap gap-1.5">
            {STYLES.map((s) => (
              <button
                key={s}
                onClick={() => toggle(style, setStyle, s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${style.includes(s) ? "bg-forest-500 border-forest-500 text-white" : "border-ink/12 dark:border-white/15 text-ink-soft"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
            Travel companions
          </span>
          <select
            value={companions}
            onChange={(e) => setCompanions(e.target.value)}
            className={fieldClass}
          >
            {COMPANIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <div>
          <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
            Interests
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TRAVEL_INTERESTS.slice(0, 8).map((s) => (
              <button
                key={s}
                onClick={() => toggle(interests, setInterests, s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${interests.includes(s) ? "bg-sky-500 border-sky-500 text-white" : "border-ink/12 dark:border-white/15 text-ink-soft"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={generate}
          className="w-full py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition flex items-center justify-center gap-1.5"
        >
          <Sparkles size={15} /> Generate Itinerary
        </button>
      </div>

      <div>
        {!itinerary ? (
          <EmptyState
            icon={<Sparkles size={24} />}
            title="No itinerary yet"
            description="Fill in your trip details and generate a full day-by-day plan."
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid grid-cols-3 gap-3 mb-6">
              <MiniStat
                icon={<Banknote size={14} />}
                label="Estimated Budget"
                value={itinerary.estimatedBudget}
              />
              <MiniStat
                icon={<Route size={14} />}
                label="Distance"
                value={`${itinerary.distanceKm} km`}
              />
              <MiniStat
                icon={<MapPinned size={14} />}
                label="Route"
                value={itinerary.route}
              />
            </div>
            <div className="flex flex-col gap-4">
              {itinerary.days.map((day) => (
                <div
                  key={day.day}
                  className="rounded-2xl border border-ink/8 dark:border-white/10 bg-white dark:bg-[#1c2024] p-5"
                >
                  <p className="text-xs font-semibold text-forest-600 dark:text-forest-400 uppercase tracking-wide mb-1">
                    Day {day.day}
                  </p>
                  <h3 className="font-display text-lg mb-3">{day.title}</h3>
                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-ink-soft mb-1 flex items-center gap-1">
                        <MapPinned size={11} /> Places
                      </p>
                      {day.places.map((p) => (
                        <p key={p} className="text-ink-soft dark:text-white/60">
                          {p}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-ink-soft mb-1">
                        Activities
                      </p>
                      {day.activities.map((a) => (
                        <p key={a} className="text-ink-soft dark:text-white/60">
                          {a}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-ink-soft mb-1 flex items-center gap-1">
                        <Utensils size={11} /> Food
                      </p>
                      {day.food.map((f) => (
                        <p key={f} className="text-ink-soft dark:text-white/60">
                          {f}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10">
      <p className="flex items-center gap-1.5 text-[11px] text-ink-soft dark:text-white/50 mb-1">
        {icon}
        {label}
      </p>
      <p className="text-sm font-semibold truncate">{value}</p>
    </div>
  );
}

const fieldClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400";
