/** Export trips as an iCalendar (.ics) file that Google, Apple and Outlook calendars import. */

import type { Destination, Trip } from "../types";
import { addDays } from "./dates";

/** RFC 5545 text escaping. */
function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** RFC 5545 line folding: lines longer than 75 octets continue on the next line after a space. */
function fold(line: string): string {
  const bytes = new TextEncoder();
  if (bytes.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  for (const ch of line) {
    if (bytes.encode(current + ch).length > (parts.length === 0 ? 75 : 74)) {
      parts.push(current);
      current = ch;
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts.join("\r\n ");
}

const compactDate = (iso: string) => iso.replace(/-/g, "");

function utcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function tripsToIcs(trips: Trip[], destinations: Destination[]): string {
  const stamp = utcStamp(new Date());
  const names = new Map(destinations.map((d) => [d.id, d.name]));
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Travel Diaries//Trips//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Travel Diaries trips",
  ];
  for (const trip of trips) {
    const places = trip.destinationIds.map((id) => names.get(id)).filter(Boolean).join(", ");
    const description = [places && `Destinations: ${places}`, trip.notes].filter(Boolean).join("\n\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:trip-${trip.id}@traveldiaries.app`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compactDate(trip.startDate)}`,
      // All-day events end on the day *after* the last day.
      `DTEND;VALUE=DATE:${compactDate(addDays(trip.endDate, 1))}`,
      `SUMMARY:${escapeText(trip.title)}`,
      ...(places ? [`LOCATION:${escapeText(places)}`] : []),
      ...(description ? [`DESCRIPTION:${escapeText(description)}`] : []),
      `STATUS:${trip.status === "wishlist" ? "TENTATIVE" : "CONFIRMED"}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function downloadIcs(filename: string, contents: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
