// Flights, with departure time local to the origin and arrival time local to
// the destination. Flight numbers are only given where they were written on
// the calendar; the rest link to a route search instead.

export type Flight = {
  no?: string;
  airline: string;
  from: string; // IATA
  fromTz: string;
  to: string; // IATA
  toTz: string;
  dep: string; // YYYY-MM-DDTHH:mm in fromTz
  arr: string; // YYYY-MM-DDTHH:mm in toTz
  toStopId: string;
  approx?: boolean;
};

export const flights: Flight[] = [
  { airline: "Domestic", from: "NYC", fromTz: "America/New_York", to: "SFO", toTz: "America/Los_Angeles", dep: "2026-09-28T09:27", arr: "2026-09-28T12:30", toStopId: "sf", approx: true },
  { no: "VN99", airline: "Vietnam Airlines", from: "SFO", fromTz: "America/Los_Angeles", to: "SGN", toTz: "Asia/Ho_Chi_Minh", dep: "2026-10-04T22:50", arr: "2026-10-06T04:30", toStopId: "hcmc" },
  { no: "VN210", airline: "Vietnam Airlines", from: "SGN", fromTz: "Asia/Ho_Chi_Minh", to: "HAN", toTz: "Asia/Ho_Chi_Minh", dep: "2026-10-08T10:00", arr: "2026-10-08T12:10", toStopId: "hanoi-1" },
  { no: "VN611", airline: "Vietnam Airlines", from: "HAN", fromTz: "Asia/Ho_Chi_Minh", to: "BKK", toTz: "Asia/Bangkok", dep: "2026-10-19T08:50", arr: "2026-10-19T10:50", toStopId: "bangkok-1" },
  { no: "KB151", airline: "Druk Air", from: "BKK", fromTz: "Asia/Bangkok", to: "PBH", toTz: "Asia/Thimphu", dep: "2026-10-21T13:10", arr: "2026-10-21T15:25", toStopId: "thimphu" },
  { no: "KB150", airline: "Druk Air", from: "PBH", fromTz: "Asia/Thimphu", to: "BKK", toTz: "Asia/Bangkok", dep: "2026-10-30T08:00", arr: "2026-10-30T12:10", toStopId: "bangkok-2" },
  { no: "TG431", airline: "Thai Airways", from: "BKK", fromTz: "Asia/Bangkok", to: "DPS", toTz: "Asia/Makassar", dep: "2026-11-01T08:50", arr: "2026-11-01T14:15", toStopId: "sanur-1" },
  { no: "GA686", airline: "Garuda Indonesia", from: "DPS", fromTz: "Asia/Makassar", to: "SOQ", toTz: "Asia/Jayapura", dep: "2026-11-05T08:00", arr: "2026-11-05T12:10", toStopId: "sorong-1" },
  { no: "GA687", airline: "Garuda Indonesia", from: "SOQ", fromTz: "Asia/Jayapura", to: "DPS", toTz: "Asia/Makassar", dep: "2026-11-15T13:30", arr: "2026-11-15T15:30", toStopId: "sanur-2" },
  { no: "JQ32", airline: "Jetstar", from: "DPS", fromTz: "Asia/Makassar", to: "MEL", toTz: "Australia/Melbourne", dep: "2026-11-17T11:30", arr: "2026-11-17T20:10", toStopId: "dandenong" },
  { no: "QF167", airline: "Qantas", from: "MEL", fromTz: "Australia/Melbourne", to: "CHC", toTz: "Pacific/Auckland", dep: "2026-11-20T09:10", arr: "2026-11-20T14:20", toStopId: "grasmere" },
  { airline: "Air New Zealand", from: "CHC", fromTz: "Pacific/Auckland", to: "AKL", toTz: "Pacific/Auckland", dep: "2026-12-04T09:40", arr: "2026-12-04T11:05", toStopId: "auckland" },
  { airline: "Air New Zealand", from: "AKL", fromTz: "Pacific/Auckland", to: "JFK", toTz: "America/New_York", dep: "2026-12-05T19:15", arr: "2026-12-05T17:00", toStopId: "home" },
];

export function flightTrackerUrl(f: Flight): string {
  return f.no
    ? `https://www.flightaware.com/live/flight/${f.no}`
    : `https://www.flightaware.com/live/findflight?origin=${f.from}&destination=${f.to}`;
}

export function flightradarUrl(f: Flight): string | null {
  return f.no ? `https://www.flightradar24.com/data/flights/${f.no.toLowerCase()}` : null;
}
