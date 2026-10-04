import { days, stops, TRIP_START, TRIP_END, type DayPlan, type Stop } from "@/data/itinerary";
import { flights, type Flight } from "@/data/flights";
import { daysBetween, haversineKm, partsInTz, zonedToUtc } from "@/lib/time";

export type StopWithTimes = Stop & {
  index: number;
  arrivalMs: number;
  departDate: string; // the day they leave (= next stop's arrival date)
  nights: number;
  plans: DayPlan[];
};

export const stopsWithTimes: StopWithTimes[] = stops.map((s, i) => {
  const next = stops[i + 1];
  const departDate = next ? next.arrive : TRIP_END;
  return {
    ...s,
    index: i,
    arrivalMs: zonedToUtc(`${s.arrive}T${s.arriveTime}`, s.tz),
    departDate,
    nights: Math.max(0, daysBetween(s.arrive, departDate)),
    plans: days.filter((d) => d.date >= s.arrive && (next ? d.date < next.arrive : true)),
  };
});

export type FlightWithTimes = Flight & { depMs: number; arrMs: number };

export const flightsWithTimes: FlightWithTimes[] = flights.map((f) => ({
  ...f,
  depMs: zonedToUtc(f.dep, f.fromTz),
  arrMs: zonedToUtc(f.arr, f.toTz),
}));

export const TOTAL_DAYS = daysBetween(TRIP_START, TRIP_END) + 1;

export type TripStatus =
  | { kind: "before"; daysUntil: number; firstFlight: FlightWithTimes }
  | { kind: "flying"; flight: FlightWithTimes; progress: number; from: StopWithTimes | null; to: StopWithTimes; tz: string; today: string }
  | { kind: "at"; stop: StopWithTimes; next: StopWithTimes | null; tz: string; today: string; travelDay: boolean }
  | { kind: "after"; stop: StopWithTimes; tz: string; today: string };

export function getStatus(now: number): TripStatus {
  const flying = flightsWithTimes.find((f) => f.depMs <= now && now < f.arrMs);
  if (flying) {
    const to = stopsWithTimes.find((s) => s.id === flying.toStopId)!;
    const from = stopsWithTimes[to.index - 1] ?? null;
    return {
      kind: "flying",
      flight: flying,
      progress: (now - flying.depMs) / (flying.arrMs - flying.depMs),
      from,
      to,
      tz: flying.toTz,
      today: partsInTz(now, flying.toTz).date,
    };
  }

  let current: StopWithTimes | null = null;
  for (const s of stopsWithTimes) {
    if (s.arrivalMs <= now) current = s;
  }
  if (!current) {
    const firstFlight = flightsWithTimes[0];
    const todayNy = partsInTz(now, "America/New_York").date;
    return { kind: "before", daysUntil: daysBetween(todayNy, TRIP_START), firstFlight };
  }
  const today = partsInTz(now, current.tz).date;
  if (current.index === stopsWithTimes.length - 1) {
    return { kind: "after", stop: current, tz: current.tz, today };
  }
  const next = stopsWithTimes[current.index + 1] ?? null;
  return { kind: "at", stop: current, next, tz: current.tz, today, travelDay: today === current.arrive };
}

export function planFor(date: string): string[] {
  return days.find((d) => d.date === date)?.items ?? [];
}

export function tripDayNumber(today: string): number {
  return daysBetween(TRIP_START, today) + 1;
}

export type Progress = {
  visited: StopWithTimes[];
  km: number;
  countries: string[];
  current: StopWithTimes | null;
};

export function progressAt(now: number): Progress {
  const visited = stopsWithTimes.filter((s) => s.arrivalMs <= now);
  let km = 0;
  for (let i = 1; i < visited.length; i++) {
    const a = visited[i - 1];
    const b = visited[i];
    km += haversineKm(a.lat, a.lng, b.lat, b.lng);
  }
  const countries = [...new Set(visited.map((s) => s.country))].filter((c) => c !== "USA");
  return { visited, km, countries, current: visited[visited.length - 1] ?? null };
}

export function mapsUrl(stop: Stop): string {
  const q = stop.lodgingQuery ?? (stop.lodging ? `${stop.lodging} ${stop.place}` : stop.place);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
