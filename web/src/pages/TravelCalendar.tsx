import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, MapPin, Plane } from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { useAppStore } from "../store/useAppStore";
import * as itineraryApi from "../api/itinerary.api";
import type { ItineraryItem } from "../api/itinerary.api";
import { addDays, formatDateRange, toIsoDate, todayIso } from "../utils/dates";
import type { Destination, Trip } from "../types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TRIP_STYLE: Record<Trip["status"], string> = {
  planned: "bg-sky-500 text-white",
  visited: "bg-forest-500 text-white",
  wishlist: "bg-amber-400 text-ink",
};

interface DayEvent {
  key: string;
  kind: "trip" | "visit";
  label: string;
  trip?: Trip;
  destination?: Destination;
  start: string;
  end: string;
}

/** Monday-first grid of 6 weeks covering the given month. */
function monthGrid(year: number, month: number): string[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday = 0
  const start = toIsoDate(new Date(year, month, 1 - offset));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export default function TravelCalendar() {
  const trips = useAppStore((s) => s.trips);
  const destinations = useAppStore((s) => s.destinations);
  const today = todayIso();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selected, setSelected] = useState<string>(today);

  const days = useMemo(() => monthGrid(cursor.year, cursor.month), [cursor]);

  const events = useMemo<DayEvent[]>(() => {
    const tripEvents: DayEvent[] = trips.map((t) => ({
      key: `t-${t.id}`,
      kind: "trip",
      label: t.title,
      trip: t,
      start: t.startDate,
      end: t.endDate,
    }));
    // Visits recorded on a place but not part of any trip still belong on the calendar.
    const inTrips = new Set(trips.flatMap((t) => t.destinationIds));
    const visitEvents: DayEvent[] = destinations
      .filter((d) => d.visitedFrom && !inTrips.has(d.id))
      .map((d) => ({
        key: `d-${d.id}`,
        kind: "visit",
        label: d.name,
        destination: d,
        start: d.visitedFrom!,
        end: d.visitedTo && d.visitedTo >= d.visitedFrom! ? d.visitedTo : d.visitedFrom!,
      }));
    return [...tripEvents, ...visitEvents].sort((a, b) => a.start.localeCompare(b.start));
  }, [trips, destinations]);

  const eventsOn = (iso: string) => events.filter((e) => e.start <= iso && iso <= e.end);
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const move = (delta: number) =>
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  const goToday = () => {
    const now = new Date();
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
    setSelected(today);
  };

  const monthPrefix = `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}`;
  const nextTrip = trips
    .filter((t) => t.status === "planned" && t.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];

  return (
    <div>
      <TopBar title="Calendar" subtitle="Your trips and travel days, month by month." />
      <div className="px-5 md:px-8 pb-10 grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="rounded-3xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft p-4 md:p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="font-display text-xl">{monthLabel}</h2>
            <div className="flex items-center gap-1.5">
              <button onClick={() => move(-1)} aria-label="Previous month" className="w-9 h-9 rounded-full border border-ink/12 dark:border-white/15 flex items-center justify-center hover:bg-ink/5">
                <ChevronLeft size={16} />
              </button>
              <button onClick={goToday} className="px-3.5 h-9 rounded-full border border-ink/12 dark:border-white/15 text-xs font-semibold hover:bg-ink/5">
                Today
              </button>
              <button onClick={() => move(1)} aria-label="Next month" className="w-9 h-9 rounded-full border border-ink/12 dark:border-white/15 flex items-center justify-center hover:bg-ink/5">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-ink-soft dark:text-white/50 mb-1">
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-ink/8 dark:bg-white/10 rounded-xl overflow-hidden" role="grid" aria-label={monthLabel}>
            {days.map((iso) => {
              const inMonth = iso.startsWith(monthPrefix);
              const dayEvents = eventsOn(iso);
              return (
                <button
                  key={iso}
                  role="gridcell"
                  aria-selected={iso === selected}
                  aria-label={`${iso}${dayEvents.length ? `, ${dayEvents.map((e) => e.label).join(", ")}` : ""}`}
                  onClick={() => setSelected(iso)}
                  className={clsx(
                    "min-h-[64px] md:min-h-[92px] p-1 md:p-1.5 text-left flex flex-col gap-0.5 bg-white dark:bg-[#1c2024] transition",
                    !inMonth && "bg-ink/[0.02] dark:bg-white/[0.02] text-ink-soft/50 dark:text-white/25",
                    iso === selected && "ring-2 ring-inset ring-forest-500",
                  )}
                >
                  <span
                    className={clsx(
                      "text-[11px] font-semibold w-6 h-6 rounded-full flex items-center justify-center",
                      iso === today && "bg-forest-500 text-white",
                    )}
                  >
                    {Number(iso.slice(8))}
                  </span>
                  {dayEvents.slice(0, 2).map((e) => (
                    <span
                      key={e.key}
                      className={clsx(
                        "hidden md:block truncate rounded px-1 text-[10px] font-medium leading-4",
                        e.kind === "trip" ? TRIP_STYLE[e.trip!.status] : "bg-forest-500/15 text-forest-700 dark:text-forest-300",
                        !inMonth && "opacity-50",
                      )}
                    >
                      {e.start === iso || iso.endsWith("-01") || (new Date(`${iso}T00:00`).getDay() === 1) ? e.label : " "}
                    </span>
                  ))}
                  {dayEvents.length > 0 && (
                    <span className="md:hidden flex gap-0.5 mt-auto">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span
                          key={e.key}
                          className={clsx("w-1.5 h-1.5 rounded-full", e.kind === "trip" ? TRIP_STYLE[e.trip!.status].split(" ")[0] : "bg-forest-400")}
                        />
                      ))}
                    </span>
                  )}
                  {dayEvents.length > 2 && (
                    <span className="hidden md:block text-[10px] text-ink-soft">+{dayEvents.length - 2} more</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-ink-soft dark:text-white/50">
            <Legend className="bg-sky-500" label="Planned trip" />
            <Legend className="bg-forest-500" label="Completed trip" />
            <Legend className="bg-forest-500/30" label="Visit to a place" />
          </div>
        </div>

        <DayPanel date={selected} events={eventsOn(selected)} nextTrip={nextTrip} />
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={clsx("w-2.5 h-2.5 rounded-sm", className)} /> {label}
    </span>
  );
}

function DayPanel({ date, events, nextTrip }: { date: string; events: DayEvent[]; nextTrip?: Trip }) {
  const heading = new Date(`${date}T00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return (
    <aside className="rounded-3xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft p-5 h-fit">
      <h3 className="font-display text-lg mb-3">{heading}</h3>
      {events.length === 0 ? (
        <div className="text-sm text-ink-soft dark:text-white/50">
          <p>Nothing on this day.</p>
          {nextTrip && (
            <p className="mt-3">
              Next up:{" "}
              <Link to={`/app/trips?trip=${nextTrip.id}`} className="font-semibold text-forest-600 dark:text-forest-400">
                {nextTrip.title}
              </Link>{" "}
              ({formatDateRange(nextTrip.startDate, nextTrip.endDate)})
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((e) =>
            e.kind === "trip" ? <TripOnDay key={e.key} trip={e.trip!} date={date} /> : <VisitOnDay key={e.key} event={e} />,
          )}
        </div>
      )}
    </aside>
  );
}

function TripOnDay({ trip, date }: { trip: Trip; date: string }) {
  const dayNumber = Math.round(
    (new Date(`${date}T00:00`).getTime() - new Date(`${trip.startDate}T00:00`).getTime()) / 86_400_000,
  ) + 1;
  const [stops, setStops] = useState<{ key: string; items: ItineraryItem[]; title: string | null } | null>(null);
  const key = `${trip.id}|${dayNumber}`;

  useEffect(() => {
    let cancelled = false;
    itineraryApi
      .getItinerary(trip.id)
      .then((it) => {
        const day = it.days.find((d) => d.dayNumber === dayNumber);
        if (!cancelled) setStops({ key, items: day?.items ?? [], title: day?.title ?? null });
      })
      .catch(() => !cancelled && setStops({ key, items: [], title: null }));
    return () => {
      cancelled = true;
    };
  }, [trip.id, dayNumber, key]);

  const current = stops?.key === key ? stops : null;
  return (
    <div>
      <Link to={`/app/trips?trip=${trip.id}`} className="flex items-start gap-2 group">
        <Plane size={15} className="text-sky-500 mt-0.5 shrink-0" />
        <span>
          <span className="block text-sm font-semibold group-hover:underline">{trip.title}</span>
          <span className="block text-xs text-ink-soft dark:text-white/50">
            Day {dayNumber} · {formatDateRange(trip.startDate, trip.endDate)}
          </span>
        </span>
      </Link>
      <div className="mt-2 ml-6">
        {!current ? (
          <p className="text-xs text-ink-soft">Loading the day's plan…</p>
        ) : current.items.length === 0 ? (
          <p className="text-xs text-ink-soft dark:text-white/50">
            No stops planned for this day.{" "}
            <Link to={`/app/trips?trip=${trip.id}`} className="font-semibold text-forest-600 dark:text-forest-400">
              Plan it
            </Link>
          </p>
        ) : (
          <>
            {current.title && <p className="text-xs font-semibold mb-1">{current.title}</p>}
            <ul className="flex flex-col gap-1">
              {current.items.map((i) => (
                <li key={i.id} className="text-xs text-ink-soft dark:text-white/60">
                  {i.startTime && <span className="font-semibold mr-1">{i.startTime}</span>}
                  {i.title}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function VisitOnDay({ event }: { event: DayEvent }) {
  const selectDestination = useAppStore((s) => s.selectDestination);
  return (
    <button onClick={() => selectDestination(event.destination!.id)} className="flex items-start gap-2 text-left group">
      <MapPin size={15} className="text-forest-500 mt-0.5 shrink-0" />
      <span>
        <span className="block text-sm font-semibold group-hover:underline">{event.label}</span>
        <span className="block text-xs text-ink-soft dark:text-white/50">
          Visit · {formatDateRange(event.start, event.end)}
        </span>
      </span>
    </button>
  );
}

