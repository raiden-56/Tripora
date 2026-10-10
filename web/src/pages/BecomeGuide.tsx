import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, Loader2 } from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { useAppStore } from "../store/useAppStore";
import { confirmAction, type ConfirmOptions } from "../store/useConfirmStore";
import * as guidesApi from "../api/guides.api";
import type { Guide, Booking, BookingStatus } from "../api/guides.api";
import { EmptyState } from "../components/common/EmptyState";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400";

type GuideAction = "accepted" | "rejected" | "completed" | "cancelled";

const ACTIONS: Record<
  GuideAction,
  { label: string; primary: boolean; done: string; confirm?: ConfirmOptions }
> = {
  accepted: { label: "Accept", primary: true, done: "Booking accepted" },
  rejected: {
    label: "Decline",
    primary: false,
    done: "Booking declined",
    confirm: {
      title: "Decline this booking?",
      danger: true,
      confirmLabel: "Decline booking",
    },
  },
  completed: {
    label: "Mark completed",
    primary: true,
    done: "Booking marked completed",
  },
  cancelled: {
    label: "Cancel",
    primary: false,
    done: "Booking cancelled",
    confirm: {
      title: "Cancel this booking?",
      danger: true,
      confirmLabel: "Cancel booking",
    },
  },
};

/** What the guide may do next — mirrors the server's allowed transitions. */
const NEXT_ACTIONS: Partial<Record<BookingStatus, GuideAction[]>> = {
  pending: ["accepted", "rejected"],
  accepted: ["completed", "cancelled"],
};

export default function BecomeGuide() {
  const pushToast = useAppStore((s) => s.pushToast);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [existingProfile, setExistingProfile] = useState<Guide | null>(null);
  const [received, setReceived] = useState<Booking[]>([]);

  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [destinationName, setDestinationName] = useState("");
  const [languages, setLanguages] = useState("English");
  const [experienceYears, setExperienceYears] = useState(1);
  const [specialization, setSpecialization] = useState("");
  const [pricePerDay, setPricePerDay] = useState(1500);
  const [saving, setSaving] = useState(false);
  const [busyBookingId, setBusyBookingId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Resolves to null (not an error) when the user has no guide profile yet.
        const profile = await guidesApi.getMyGuideProfile();
        setExistingProfile(profile);
        if (profile) {
          const bookings = await guidesApi.listBookingsReceived();
          setReceived(bookings);
        }
      } catch (err) {
        pushToast(
          err instanceof Error ? err.message : "Could not load your guide profile.",
          "error",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [pushToast]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline || !destinationName || !pricePerDay) {
      pushToast("Please fill in the required fields.", "error");
      return;
    }
    setSaving(true);
    try {
      const profile = await guidesApi.becomeGuide({
        headline,
        about: about || undefined,
        destinationName,
        languages: languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
        experienceYears,
        specialization: specialization || undefined,
        pricePerDay,
      });
      setExistingProfile(profile);
      pushToast("You're now a Travel Diaries guide!", "success");
    } catch (err) {
      pushToast(
        err instanceof Error
          ? err.message
          : "Could not create your guide profile.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const respond = async (bookingId: number, status: GuideAction) => {
    const { confirm, done } = ACTIONS[status];
    if (confirm && !(await confirmAction(confirm))) return;
    setBusyBookingId(bookingId);
    try {
      const updated = await guidesApi.updateBookingStatus(bookingId, status);
      setReceived((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: updated.status } : b,
        ),
      );
      pushToast(done, "success");
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : "Could not update booking.",
        "error",
      );
    } finally {
      setBusyBookingId(null);
    }
  };

  if (loading) {
    return (
      <div>
        <TopBar title="Guide Profile" subtitle="Loading your guide details…" />
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-forest-500" size={24} />
        </div>
      </div>
    );
  }

  if (existingProfile) {
    return (
      <div>
        <TopBar
          title="Your Guide Profile"
          subtitle={existingProfile.headline}
        />
        <div className="px-5 md:px-8 pb-10">
          <div className="rounded-2xl border border-ink/8 dark:border-white/10 bg-white dark:bg-white/5 p-5 mb-6">
            <p className="text-sm text-ink-soft dark:text-white/60">
              {existingProfile.about}
            </p>
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-ink-soft dark:text-white/50">
              <span>{existingProfile.destinationName}</span>
              <span>₹{existingProfile.pricePerDay}/day</span>
              <span>{existingProfile.experienceYears} yrs experience</span>
              <span>
                ★ {existingProfile.ratingAvg.toFixed(1)} (
                {existingProfile.ratingCount})
              </span>
            </div>
          </div>

          <h2 className="font-display text-lg mb-3">Bookings Received</h2>
          {received.length === 0 ? (
            <EmptyState
              compact
              icon={<CalendarCheck size={20} />}
              title="No booking requests yet"
              description="When travelers request you as a guide, they'll show up here."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {received.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-ink/8 dark:border-white/10 bg-white dark:bg-white/5 text-sm"
                >
                  <div>
                    <p className="font-semibold">
                      {b.travelerName ?? "Traveler"}
                    </p>
                    <p className="text-ink-soft dark:text-white/50 text-xs">
                      {b.bookingDate} · {b.bookingTime} · {b.peopleCount}{" "}
                      people · {b.durationHours}h
                    </p>
                    {b.specialRequirements && (
                      <p className="text-xs text-ink-soft dark:text-white/50 mt-1">
                        {b.specialRequirements}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-ink/5 dark:bg-white/10 capitalize">
                      {b.status}
                    </span>
                    {(NEXT_ACTIONS[b.status] ?? []).map((action) => (
                      <button
                        key={action}
                        onClick={() => respond(b.id, action)}
                        disabled={busyBookingId === b.id}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold disabled:opacity-60 ${
                          ACTIONS[action].primary
                            ? "bg-forest-500 text-white hover:bg-forest-600 transition"
                            : "border border-ink/15 dark:border-white/20"
                        }`}
                      >
                        {ACTIONS[action].label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar
        title="Become a Guide"
        subtitle="Share your local expertise and start earning"
      />
      <div className="px-5 md:px-8 pb-10">
        <form
          onSubmit={submit}
          className="max-w-lg flex flex-col gap-4 rounded-2xl border border-ink/8 dark:border-white/10 bg-white dark:bg-white/5 p-6"
        >
          <label className="block">
            <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
              Headline *
            </span>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className={inputClass}
              placeholder="Coorg coffee estate & trekking expert"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
              Destination *
            </span>
            <input
              value={destinationName}
              onChange={(e) => setDestinationName(e.target.value)}
              className={inputClass}
              placeholder="Coorg"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
              About
            </span>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
                Languages
              </span>
              <input
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                className={inputClass}
                placeholder="English, Hindi"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
                Experience (years)
              </span>
              <input
                type="number"
                min={0}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className={inputClass}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
              Specialization
            </span>
            <input
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className={inputClass}
              placeholder="Trekking, food tours…"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
              Price per day (₹) *
            </span>
            <input
              type="number"
              min={0}
              value={pricePerDay}
              onChange={(e) => setPricePerDay(Number(e.target.value))}
              className={inputClass}
            />
          </label>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/app/guides")}
              className="flex-1 py-2.5 rounded-full border border-ink/15 dark:border-white/20 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition disabled:opacity-60"
            >
              {saving ? "Submitting…" : "Become a Guide"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
