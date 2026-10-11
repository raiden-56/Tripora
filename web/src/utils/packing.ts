/** Packing suggestions from what we actually know about a trip: its length, the
 * expected weather at each destination, the kind of places and the itinerary. */

import type { WeatherSummary } from "../api/weather.api";
import type { Destination } from "../types";

const MOUNTAIN_STATES = ["Himachal Pradesh", "Uttarakhand", "Ladakh", "Jammu and Kashmir", "Sikkim", "Arunachal Pradesh", "Meghalaya"];
const BEACH_STATES = ["Goa", "Kerala", "Andaman and Nicobar Islands", "Lakshadweep", "Puducherry"];
const HIGH_ALTITUDE = ["Ladakh", "Leh", "Spiti", "Tawang", "Sikkim"];

export interface PackingInput {
  days: number;
  destinations: Destination[];
  weather: WeatherSummary[];
  /** Itinerary stop titles, used to spot hikes, swims, temples... */
  activities: string[];
}

export interface PackingSuggestion {
  text: string;
  reason: string;
}

export function suggestPacking({ days, destinations, weather, activities }: PackingInput): PackingSuggestion[] {
  const out: PackingSuggestion[] = [];
  const add = (text: string, reason: string) => {
    if (!out.some((s) => s.text === text)) out.push({ text, reason });
  };
  const places = destinations.map((d) => `${d.name} ${d.state ?? ""} ${d.city ?? ""}`);
  const mentions = (words: string[], haystack: string[]) =>
    haystack.some((h) => words.some((w) => h.toLowerCase().includes(w.toLowerCase())));
  const activity = (pattern: RegExp) => activities.some((a) => pattern.test(a));

  // Essentials
  add("ID / passport", "Essential");
  add("Tickets & booking confirmations", "Essential");
  add("Phone charger & power bank", "Essential");
  add("Medicines & first-aid kit", "Essential");
  add("Toiletries", "Essential");

  const outfits = Math.min(Math.max(days, 1), 7);
  add(`${outfits} set${outfits > 1 ? "s" : ""} of clothes`, `${days}-day trip`);
  if (days > 7) add("Laundry bag & detergent sheets", "Longer than a week");

  // Weather
  const coldest = weather.length ? Math.min(...weather.map((w) => w.minTemp)) : null;
  const hottest = weather.length ? Math.max(...weather.map((w) => w.maxTemp)) : null;
  const wet = weather.some((w) => w.wetDays > 0);
  const snow = weather.some((w) => w.snowDays > 0);
  if (coldest !== null && coldest <= 5) {
    add("Thermal inner wear", `Lows around ${coldest}°C`);
    add("Down jacket", `Lows around ${coldest}°C`);
    add("Gloves, beanie & warm socks", `Lows around ${coldest}°C`);
  } else if (coldest !== null && coldest <= 15) {
    add("Warm jacket or fleece", `Evenings around ${coldest}°C`);
  }
  if (snow) add("Waterproof boots", "Snow expected");
  if (wet) {
    add("Rain jacket or umbrella", "Rain expected");
    add("Waterproof pouch for phone", "Rain expected");
  }
  if (hottest !== null && hottest >= 30) {
    add("Sunscreen", `Highs around ${hottest}°C`);
    add("Sunglasses & cap", `Highs around ${hottest}°C`);
    add("Reusable water bottle", `Highs around ${hottest}°C`);
  }

  // Places
  if (destinations.some((d) => MOUNTAIN_STATES.includes(d.state ?? ""))) {
    add("Comfortable walking shoes", "Hill destination");
    add("Motion-sickness tablets", "Winding mountain roads");
  }
  if (mentions(HIGH_ALTITUDE, places)) {
    add("Altitude-sickness medicine (ask your doctor)", "High altitude");
    add("Lip balm & moisturiser", "Dry, high-altitude air");
  }
  if (destinations.some((d) => BEACH_STATES.includes(d.state ?? "")) || activity(/beach|swim|snorkel|scuba/i)) {
    add("Swimwear", "Beach or water plans");
    add("Flip-flops", "Beach or water plans");
  }

  // Itinerary
  if (activity(/trek|hike|trail|summit|camp/i)) {
    add("Trekking shoes", "Hikes on the itinerary");
    add("Daypack", "Hikes on the itinerary");
  }
  if (activity(/temple|monastery|church|mosque|gurudwara|dargah/i)) {
    add("Clothes that cover shoulders & knees", "Places of worship on the itinerary");
  }
  if (activity(/photo|sunrise|viewpoint|safari/i)) add("Camera & spare memory card", "Viewpoints on the itinerary");

  return out;
}
