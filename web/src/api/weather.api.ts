/** Trip weather from Open-Meteo (free, no API key, called straight from the browser).
 *
 * - Trips starting within the forecast window get the real forecast.
 * - Trips further out get the same calendar dates from last year, labelled as such —
 *   a useful "what's it usually like" without pretending to be a forecast.
 * - Past trips get the weather that actually happened.
 */

import { addDays, daysUntil, todayIso } from "../utils/dates";

const FORECAST_DAYS = 16;
const ARCHIVE_LAG_DAYS = 5; // the archive trails today by a few days

export type WeatherSource = "forecast" | "last-year" | "recorded";

export interface WeatherDay {
  date: string;
  tMax: number;
  tMin: number;
  precipitationMm: number;
  code: number;
}

export interface TripWeather {
  source: WeatherSource;
  days: WeatherDay[];
}

interface OpenMeteoDaily {
  daily?: {
    time: string[];
    temperature_2m_max: (number | null)[];
    temperature_2m_min: (number | null)[];
    precipitation_sum: (number | null)[];
    weather_code: (number | null)[];
  };
}

const cache = new Map<string, Promise<TripWeather | null>>();

function shiftYear(iso: string, years: number) {
  const [y, m, d] = iso.split("-");
  return `${Number(y) + years}-${m}-${d === "29" && m === "02" ? "28" : d}`;
}

async function fetchDaily(host: string, lat: number, lng: number, start: string, end: string) {
  const params = new URLSearchParams({
    latitude: lat.toFixed(3),
    longitude: lng.toFixed(3),
    start_date: start,
    end_date: end,
    timezone: "auto",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
  });
  const res = await fetch(`https://${host}/v1/${host.startsWith("archive") ? "archive" : "forecast"}?${params}`);
  if (!res.ok) throw new Error(`Weather service returned ${res.status}`);
  const body = (await res.json()) as OpenMeteoDaily;
  const daily = body.daily;
  if (!daily) return [];
  return daily.time
    .map((date, i) => ({
      date,
      tMax: daily.temperature_2m_max[i],
      tMin: daily.temperature_2m_min[i],
      precipitationMm: daily.precipitation_sum[i] ?? 0,
      code: daily.weather_code[i] ?? 0,
    }))
    .filter((d): d is WeatherDay => d.tMax != null && d.tMin != null);
}

/** Weather for a trip at one place, or null when none applies (e.g. a trip > 1 year out with no data). */
export function getTripWeather(
  lat: number,
  lng: number,
  startDate: string,
  endDate: string,
): Promise<TripWeather | null> {
  const key = [lat.toFixed(2), lng.toFixed(2), startDate, endDate, todayIso()].join("|");
  const hit = cache.get(key);
  if (hit) return hit;

  const request = (async (): Promise<TripWeather | null> => {
    const today = todayIso();
    const startsIn = daysUntil(startDate);
    const endsIn = daysUntil(endDate);

    if (endsIn <= -ARCHIVE_LAG_DAYS) {
      const days = await fetchDaily("archive-api.open-meteo.com", lat, lng, startDate, endDate);
      return { source: "recorded", days };
    }
    if (startsIn < FORECAST_DAYS && endsIn >= 0) {
      const from = startsIn < 0 ? today : startDate;
      const to = endsIn >= FORECAST_DAYS ? addDays(today, FORECAST_DAYS - 1) : endDate;
      const days = await fetchDaily("api.open-meteo.com", lat, lng, from, to);
      return { source: "forecast", days };
    }
    const days = await fetchDaily(
      "archive-api.open-meteo.com",
      lat,
      lng,
      shiftYear(startDate, -1),
      shiftYear(endDate, -1),
    );
    return days.length ? { source: "last-year", days } : null;
  })();

  cache.set(key, request);
  request.catch(() => cache.delete(key)); // let a later render retry after a failure
  return request;
}

/** WMO weather code → short label. */
export function describeWeather(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly cloudy";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "Rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "Snow";
  if (code >= 95) return "Thunderstorms";
  return "Mixed";
}

export interface WeatherSummary {
  minTemp: number;
  maxTemp: number;
  wetDays: number;
  snowDays: number;
  totalDays: number;
}

export function summarize(weather: TripWeather): WeatherSummary | null {
  if (weather.days.length === 0) return null;
  return {
    minTemp: Math.round(Math.min(...weather.days.map((d) => d.tMin))),
    maxTemp: Math.round(Math.max(...weather.days.map((d) => d.tMax))),
    wetDays: weather.days.filter((d) => d.precipitationMm >= 1).length,
    snowDays: weather.days.filter((d) => describeWeather(d.code) === "Snow").length,
    totalDays: weather.days.length,
  };
}
