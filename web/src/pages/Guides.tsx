import { useEffect, useState } from "react";
import {
  Search,
  Star,
  MapPin,
  Languages,
  UserPlus,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../components/layout/TopBar";
import { EmptyState } from "../components/common/EmptyState";
import { useAppStore } from "../store/useAppStore";
import { confirmAction } from "../store/useConfirmStore";
import { ApiError } from "../api/client";
import * as guidesApi from "../api/guides.api";
import type { Guide, Booking, BookingStatus } from "../api/guides.api";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400";

const filterClass =
  "px-3.5 py-2.5 rounded-full border border-ink/12 dark:border-white/15 bg-white dark:bg-white/5 text-sm outline-none focus:border-forest-400";

function statusColor(status: BookingStatus) {
  switch (status) {
    case "accepted":
      return "text-forest-600 bg-forest-50 dark:bg-forest-500/15";
    case "rejected":
    case "cancelled":
      return "text-coral-600 bg-coral-50 dark:bg-coral-500/15";
    case "completed":
      return "text-blue-600 bg-blue-50 dark:bg-blue-500/15";
    default:
      return "text-amber-600 bg-amber-50 dark:bg-amber-500/15";
  }
}

/** Today as YYYY-MM-DD in the traveler's local time zone (what `<input type="date">` uses). */
function todayIso() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function Guides() {
  const pushToast = useAppStore((s) => s.pushToast);
  const navigate = useNavigate();

  const [guides, setGuides] = useState<Guide[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bookingGuide, setBookingGuide] = useState<Guide | null>(null);
  const [busyBookingId, setBusyBookingId] = useState<number | null>(null);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set());

  const load = async () => {
    setLoading(true);
    try {
      const [guideList, myBookings] = await Promise.all([
        guidesApi.searchGuides({
          destinationName: query.trim() || undefined,
          language: language.trim() || undefined,
          minRating: minRating ? Number(minRating) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
        }),
        guidesApi.listMyBookings(),
      ]);
      setGuides(guideList);
      setBookings(myBookings);
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : "Could not load guides.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    await load();
  };

  const cancelBooking = async (booking: Booking) => {
    if (
      !(await confirmAction({
        title: "Cancel this booking?",
        danger: true,
        confirmLabel: "Cancel booking",
      }))
    )
      return;
    setBusyBookingId(booking.id);
    try {
      const updated = await guidesApi.updateBookingStatus(
        booking.id,
        "cancelled",
      );
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: updated.status } : b,
        ),
      );
      pushToast("Booking cancelled", "success");
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : "Could not cancel booking.",
        "error",
      );
    } finally {
      setBusyBookingId(null);
    }
  };

  const markReviewed = (bookingId: number) => {
    setReviewedIds((prev) => new Set(prev).add(bookingId));
    setReviewingId(null);
  };

  return (
    <div>
      <TopBar
        title="Hire a Local Guide"
        subtitle="Find verified travel guides for your next trip"
      />
      <div className="px-5 md:px-8 pb-10">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <form
            onSubmit={search}
            className="flex items-center gap-2 flex-1 flex-wrap min-w-[200px]"
          >
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by destination…"
                aria-label="Destination"
                className="w-full pl-9 pr-4 py-2.5 rounded-full border border-ink/12 dark:border-white/15 bg-white dark:bg-white/5 text-sm outline-none focus:border-forest-400"
              />
            </div>
            <input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="Language"
              aria-label="Language"
              className={`${filterClass} w-32`}
            />
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              aria-label="Minimum rating"
              className={filterClass}
            >
              <option value="">Any rating</option>
              <option value="3">3★ & up</option>
              <option value="4">4★ & up</option>
              <option value="4.5">4.5★ & up</option>
            </select>
            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max ₹/day"
              aria-label="Maximum price per day"
              className={`${filterClass} w-32`}
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-full bg-ink text-white dark:bg-white dark:text-ink text-sm font-semibold hover:opacity-90 transition"
            >
              Search
            </button>
          </form>
          <button
            onClick={() => navigate("/app/become-guide")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition shrink-0"
          >
            <UserPlus size={15} /> Become a Guide
          </button>
        </div>

        {bookings.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-lg mb-3">Your Bookings</h2>
            <div className="flex flex-col gap-2">
              {bookings.map((b) => {
                const canCancel =
                  b.status === "pending" || b.status === "accepted";
                const canReview =
                  b.status === "completed" && !b.reviewed && !reviewedIds.has(b.id);
                return (
                  <div
                    key={b.id}
                    className="px-4 py-3 rounded-xl border border-ink/8 dark:border-white/10 bg-white dark:bg-white/5 text-sm"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-semibold">
                          {b.guideName ?? "Your guide"}
                          {b.guideDestination && (
                            <span className="font-normal text-ink-soft dark:text-white/50">
                              {" "}
                              · {b.guideDestination}
                            </span>
                          )}
                        </p>
                        <p className="text-ink-soft dark:text-white/50 text-xs">
                          {b.bookingDate} · {b.bookingTime} · {b.peopleCount}{" "}
                          people · {b.durationHours}h
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColor(b.status)}`}
                        >
                          {b.status}
                        </span>
                        {canCancel && (
                          <button
                            onClick={() => cancelBooking(b)}
                            disabled={busyBookingId === b.id}
                            className="px-3 py-1.5 rounded-full border border-ink/15 dark:border-white/20 text-xs font-semibold disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        )}
                        {canReview && reviewingId !== b.id && (
                          <button
                            onClick={() => setReviewingId(b.id)}
                            className="px-3 py-1.5 rounded-full bg-forest-500 text-white text-xs font-semibold hover:bg-forest-600 transition"
                          >
                            Leave a review
                          </button>
                        )}
                      </div>
                    </div>
                    {canReview && reviewingId === b.id && (
                      <ReviewForm
                        booking={b}
                        onCancel={() => setReviewingId(null)}
                        onReviewed={() => markReviewed(b.id)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-forest-500" size={24} />
          </div>
        ) : guides.length === 0 ? (
          <EmptyState
            icon={<MapPin size={26} />}
            title="No guides found"
            description="Try different filters, or be the first to become a guide there."
            actionLabel="Become a Guide"
            onAction={() => navigate("/app/become-guide")}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.map((g) => (
              <div
                key={g.id}
                className="rounded-2xl border border-ink/8 dark:border-white/10 bg-white dark:bg-white/5 p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg">{g.headline}</h3>
                    <p className="text-xs text-ink-soft dark:text-white/50 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {g.destinationName}
                    </p>
                  </div>
                  {g.isVerified && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-forest-50 text-forest-600 dark:bg-forest-500/15">
                      Verified
                    </span>
                  )}
                </div>
                {g.about && (
                  <p className="text-sm text-ink-soft dark:text-white/60 line-clamp-2">
                    {g.about}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-ink-soft dark:text-white/50">
                  <span className="flex items-center gap-1">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    {g.ratingAvg.toFixed(1)} ({g.ratingCount})
                  </span>
                  {g.languages.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Languages size={12} /> {g.languages.join(", ")}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-semibold text-forest-600 dark:text-forest-400">
                    ₹{g.pricePerDay}/day
                  </span>
                  <button
                    onClick={() => setBookingGuide(g)}
                    className="px-4 py-2 rounded-full bg-ink text-white dark:bg-white dark:text-ink text-xs font-semibold hover:opacity-90 transition"
                  >
                    Request Booking
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {bookingGuide && (
        <BookingModal
          guide={bookingGuide}
          onClose={() => setBookingGuide(null)}
          onBooked={() => {
            setBookingGuide(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function ReviewForm({
  booking,
  onCancel,
  onReviewed,
}: {
  booking: Booking;
  onCancel: () => void;
  onReviewed: () => void;
}) {
  const pushToast = useAppStore((s) => s.pushToast);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      pushToast("Please pick a rating.", "error");
      return;
    }
    setSaving(true);
    try {
      await guidesApi.reviewGuide(booking.guideId, {
        bookingId: booking.id,
        rating,
        comment: comment.trim() || undefined,
      });
      pushToast("Thanks for your review!", "success");
      onReviewed();
    } catch (err) {
      if (err instanceof ApiError && err.code === "ALREADY_REVIEWED") {
        pushToast(err.message, "info");
        onReviewed();
      } else {
        pushToast(
          err instanceof Error ? err.message : "Could not submit your review.",
          "error",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mt-3 pt-3 border-t border-ink/8 dark:border-white/10 flex flex-col gap-3"
    >
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => setRating(n)}
            className="p-0.5"
          >
            <Star
              size={20}
              className={
                n <= rating
                  ? "text-amber-500 fill-amber-500"
                  : "text-ink/25 dark:text-white/25"
              }
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        maxLength={2000}
        placeholder="How was your experience? (optional)"
        className={inputClass}
      />
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-full border border-ink/15 dark:border-white/20 text-xs font-semibold"
        >
          Not now
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-3 py-1.5 rounded-full bg-forest-500 text-white text-xs font-semibold hover:bg-forest-600 transition disabled:opacity-60"
        >
          {saving ? "Submitting…" : "Submit review"}
        </button>
      </div>
    </form>
  );
}

function BookingModal({
  guide,
  onClose,
  onBooked,
}: {
  guide: Guide;
  onClose: () => void;
  onBooked: () => void;
}) {
  const pushToast = useAppStore((s) => s.pushToast);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [people, setPeople] = useState(2);
  const [hours, setHours] = useState(4);
  const [requirements, setRequirements] = useState("");
  const [saving, setSaving] = useState(false);
  const today = todayIso();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      pushToast("Please select a date.", "error");
      return;
    }
    if (date < today) {
      pushToast("Pick a date that isn't in the past.", "error");
      return;
    }
    setSaving(true);
    try {
      await guidesApi.requestBooking(guide.id, {
        bookingDate: date,
        bookingTime: time,
        peopleCount: people,
        durationHours: hours,
        specialRequirements: requirements || undefined,
      });
      pushToast("Booking request sent", "success");
      onBooked();
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : "Could not send booking request.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1200] bg-ink/40 backdrop-blur-sm flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full md:max-w-md md:rounded-3xl rounded-t-3xl bg-white dark:bg-[#1c2024] shadow-soft-lg p-6 flex flex-col gap-4"
      >
        <h2 className="font-display text-lg">Book {guide.headline}</h2>
        <label className="block">
          <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
            Date
          </span>
          <input
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
            Time
          </span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={inputClass}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
              People
            </span>
            <input
              type="number"
              min={1}
              max={50}
              value={people}
              onChange={(e) => setPeople(Number(e.target.value))}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
              Duration (hrs)
            </span>
            <input
              type="number"
              min={1}
              max={24}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className={inputClass}
            />
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
            Special requirements
          </span>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows={2}
            className={inputClass}
          />
        </label>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-ink/15 dark:border-white/20 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition disabled:opacity-60"
          >
            {saving ? "Sending…" : "Send Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
