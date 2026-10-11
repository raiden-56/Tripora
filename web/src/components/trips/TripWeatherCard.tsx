import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudSnow, CloudSun, Sun } from "lucide-react";
import { describeWeather, getTripWeather, summarize, type TripWeather } from "../../api/weather.api";
import type { Destination, Trip } from "../../types";

const SOURCE_LABEL = {
  forecast: "Forecast",
  "last-year": "Same dates last year",
  recorded: "Weather during the trip",
} as const;

function WeatherIcon({ code, size = 14 }: { code: number; size?: number }) {
  const label = describeWeather(code);
  if (label === "Clear") return <Sun size={size} className="text-amber-500" />;
  if (label === "Partly cloudy") return <CloudSun size={size} className="text-amber-500" />;
  if (label === "Rain" || label === "Drizzle" || label === "Thunderstorms")
    return <CloudRain size={size} className="text-sky-500" />;
  if (label === "Snow") return <CloudSnow size={size} className="text-sky-400" />;
  return <Cloud size={size} className="text-ink-soft" />;
}

/** Weather for each of the trip's destinations (up to three). */
export function TripWeatherCard({ trip, destinations }: { trip: Trip; destinations: Destination[] }) {
  const places = destinations.slice(0, 3);
  if (places.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {places.map((d) => (
        <PlaceWeather key={d.id} trip={trip} destination={d} />
      ))}
      <a
        href="https://open-meteo.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] text-ink-soft/70 dark:text-white/30 hover:underline w-fit"
      >
        Weather data by Open-Meteo.com
      </a>
    </div>
  );
}

function PlaceWeather({ trip, destination }: { trip: Trip; destination: Destination }) {
  const [state, setState] = useState<{ key: string; weather: TripWeather | null; error: boolean } | null>(null);
  const [open, setOpen] = useState(false);
  const key = `${destination.id}|${trip.startDate}|${trip.endDate}`;

  useEffect(() => {
    let cancelled = false;
    getTripWeather(destination.latitude, destination.longitude, trip.startDate, trip.endDate)
      .then((weather) => !cancelled && setState({ key, weather, error: false }))
      .catch(() => !cancelled && setState({ key, weather: null, error: true }));
    return () => {
      cancelled = true;
    };
  }, [key, destination.latitude, destination.longitude, trip.startDate, trip.endDate]);

  const current = state?.key === key ? state : null;
  const summary = current?.weather ? summarize(current.weather) : null;

  return (
    <div className="p-3.5 rounded-xl border border-ink/8 dark:border-white/10">
      <button
        onClick={() => summary && setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 text-left"
        aria-expanded={open}
      >
        {current?.weather?.days[0] ? (
          <WeatherIcon code={current.weather.days[0].code} size={18} />
        ) : (
          <CloudSun size={18} className="text-sky-500" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{destination.name}</p>
          <p className="text-xs text-ink-soft dark:text-white/50">
            {!current
              ? "Checking the weather…"
              : current.error
                ? "Weather is unavailable right now."
                : !summary
                  ? "No weather data for these dates yet."
                  : `${SOURCE_LABEL[current.weather!.source]}: ${summary.minTemp}° to ${summary.maxTemp}°C` +
                    (summary.wetDays > 0
                      ? ` · rain on ${summary.wetDays} of ${summary.totalDays} days`
                      : " · mostly dry")}
          </p>
        </div>
      </button>
      {open && current?.weather && (
        <div className="flex gap-1.5 overflow-x-auto mt-3 pb-1">
          {current.weather.days.map((day) => (
            <div
              key={day.date}
              title={describeWeather(day.code)}
              className="shrink-0 w-14 py-2 rounded-lg bg-ink/[0.03] dark:bg-white/5 flex flex-col items-center gap-1 text-[10px]"
            >
              <span className="text-ink-soft dark:text-white/50">
                {new Date(`${day.date}T00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
              </span>
              <WeatherIcon code={day.code} />
              <span className="font-semibold">
                {Math.round(day.tMax)}° / {Math.round(day.tMin)}°
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
