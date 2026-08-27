import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CloudUpload,
  FolderSync,
  ImagePlus,
  MapPin,
  SkipForward,
  Sparkles,
} from "lucide-react";
import { Logo } from "../../components/common/Logo";
import { AnimatedCounter } from "../../components/common/AnimatedCounter";
import { destinations, TRAVEL_INTERESTS } from "../../data/mockData";
import { INDIA_STATES } from "../../data/indiaStates";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppStore } from "../../store/useAppStore";

const ALREADY_BEEN_OPTIONS = [
  "India",
  "Karnataka",
  "Kerala",
  "Goa",
  "Tamil Nadu",
  "Maharashtra",
  "Rajasthan",
  ...INDIA_STATES.slice(0, 6).map((s) => s.name),
];
const SUGGESTED = destinations
  .filter((d) => d.status === "wishlist")
  .slice(0, 6);

const STEPS = ["Been there", "Traveler type", "Next up", "Memories", "Ready"];

export default function Onboarding() {
  const navigate = useNavigate();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const pushToast = useAppStore((s) => s.pushToast);

  const [step, setStep] = useState(0);
  const [beenTo, setBeenTo] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [wishlisted, setWishlisted] = useState<string[]>([]);

  const toggle = (
    list: string[],
    setList: (v: string[]) => void,
    value: string,
  ) => {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));

  const finish = () => {
    completeOnboarding();
    navigate("/app", { replace: true });
  };

  return (
    <div className="min-h-screen bg-paper dark:bg-[#14171a] flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-10 py-5 max-w-2xl mx-auto w-full">
        <Logo />
        <span className="text-xs font-semibold text-ink-soft dark:text-white/50">
          Step {step + 1} of {STEPS.length}
        </span>
      </header>

      <div className="max-w-2xl mx-auto w-full px-6 md:px-10">
        <div className="h-1.5 rounded-full bg-ink/8 dark:bg-white/10 overflow-hidden mb-10">
          <motion.div
            className="h-full bg-forest-500 rounded-full"
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 md:px-10 pb-16">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="0"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
            >
              <h1 className="font-display text-3xl mb-2">
                Let's build your travel map
              </h1>
              <p className="text-ink-soft dark:text-white/50 mb-8">
                Where have you already been?
              </p>
              <div className="flex flex-wrap gap-2 mb-10">
                {ALREADY_BEEN_OPTIONS.map((opt) => (
                  <Chip
                    key={opt}
                    active={beenTo.includes(opt)}
                    onClick={() => toggle(beenTo, setBeenTo, opt)}
                  >
                    {opt}
                  </Chip>
                ))}
              </div>
              <ContinueButton onClick={next} />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
            >
              <h1 className="font-display text-3xl mb-2">
                What type of traveler are you?
              </h1>
              <p className="text-ink-soft dark:text-white/50 mb-8">
                Select as many as you like.
              </p>
              <div className="flex flex-wrap gap-2 mb-10">
                {TRAVEL_INTERESTS.map((opt) => (
                  <Chip
                    key={opt}
                    active={interests.includes(opt)}
                    onClick={() => toggle(interests, setInterests, opt)}
                  >
                    {opt}
                  </Chip>
                ))}
              </div>
              <ContinueButton onClick={next} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
            >
              <h1 className="font-display text-3xl mb-2">
                Where do you want to go next?
              </h1>
              <p className="text-ink-soft dark:text-white/50 mb-8">
                Based on your interests, here are a few ideas.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
                {SUGGESTED.map((d) => {
                  const active = wishlisted.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      onClick={() => toggle(wishlisted, setWishlisted, d.id)}
                      className={`relative rounded-2xl overflow-hidden border-2 text-left transition ${active ? "border-forest-500" : "border-transparent"}`}
                    >
                      <img
                        src={d.heroImageUrl}
                        alt={d.name}
                        className="w-full h-24 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-2 left-2.5 text-white text-sm font-semibold">
                        {d.name}
                      </span>
                      {active && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-forest-500 flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <ContinueButton
                label="Add to Wishlist & Continue"
                onClick={next}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="3"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
            >
              <h1 className="font-display text-3xl mb-2">
                Bring your memories with you
              </h1>
              <p className="text-ink-soft dark:text-white/50 mb-8">
                Connect your photos so every trip stays organized.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-10">
                <MemoryOption
                  icon={<FolderSync size={20} />}
                  label="Connect Google Drive"
                  onClick={() => {
                    pushToast("Google Drive connected (mock).", "success");
                    next();
                  }}
                />
                <MemoryOption
                  icon={<ImagePlus size={20} />}
                  label="Upload Photos"
                  onClick={() => {
                    pushToast("Photo upload is mocked in this demo.", "info");
                    next();
                  }}
                />
                <MemoryOption
                  icon={<CloudUpload size={20} />}
                  label="Import Memories"
                  onClick={() => {
                    pushToast("Memories imported (mock).", "success");
                    next();
                  }}
                />
                <MemoryOption
                  icon={<SkipForward size={20} />}
                  label="Skip for now"
                  onClick={next}
                />
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="4"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center pt-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-forest-50 dark:bg-white/10 text-forest-500 flex items-center justify-center mx-auto mb-5">
                <Sparkles size={26} />
              </div>
              <h1 className="font-display text-3xl mb-2">
                Your journey is ready.
              </h1>
              <p className="text-ink-soft dark:text-white/50 mb-10">
                Here's what we've mapped out so far.
              </p>
              <div className="grid grid-cols-4 gap-3 mb-12 max-w-md mx-auto">
                <Stat value={12} label="Destinations" />
                <Stat value={8} label="States" />
                <Stat value={3} label="Upcoming" />
                <Stat value={248} label="Memories" />
              </div>
              <button
                onClick={finish}
                className="px-8 py-3 rounded-full bg-forest-500 text-white text-sm font-semibold shadow-soft-lg hover:bg-forest-600 transition inline-flex items-center gap-2"
              >
                <MapPin size={16} /> Enter My Journey
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
        active
          ? "bg-forest-500 border-forest-500 text-white"
          : "border-ink/12 dark:border-white/15 text-ink-soft dark:text-white/60 hover:border-ink/30"
      }`}
    >
      {children}
    </button>
  );
}

function ContinueButton({
  onClick,
  label = "Continue",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="px-7 py-3 rounded-full bg-forest-500 text-white text-sm font-semibold shadow-soft hover:bg-forest-600 transition"
    >
      {label}
    </button>
  );
}

function MemoryOption({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2.5 p-6 rounded-2xl border border-ink/10 dark:border-white/10 hover:border-forest-400 hover:bg-forest-50/50 dark:hover:bg-white/5 transition"
    >
      <div className="w-11 h-11 rounded-xl bg-forest-50 dark:bg-white/10 text-forest-500 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <AnimatedCounter
        value={value}
        className="font-display text-2xl text-ink dark:text-white"
      />
      <p className="text-[11px] text-ink-soft dark:text-white/50 mt-0.5">
        {label}
      </p>
    </div>
  );
}
