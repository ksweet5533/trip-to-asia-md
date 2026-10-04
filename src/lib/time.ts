// Small time-zone helpers built on Intl, so the site needs no date library.

const partsCache = new Map<string, Intl.DateTimeFormat>();

function fmtFor(tz: string): Intl.DateTimeFormat {
  let f = partsCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    partsCache.set(tz, f);
  }
  return f;
}

export type ZonedParts = {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
  date: string; // YYYY-MM-DD
};

export function partsInTz(ms: number, tz: string): ZonedParts {
  const p: Record<string, number> = {};
  for (const part of fmtFor(tz).formatToParts(new Date(ms))) {
    if (part.type !== "literal") p[part.type] = Number(part.value);
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    year: p.year,
    month: p.month,
    day: p.day,
    hour: p.hour === 24 ? 0 : p.hour,
    minute: p.minute,
    second: p.second,
    date: `${p.year}-${pad(p.month)}-${pad(p.day)}`,
  };
}

/** Offset of `tz` from UTC at instant `ms`, in minutes (east positive). */
export function offsetMinutes(ms: number, tz: string): number {
  const p = partsInTz(ms, tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(ms / 1000) * 1000) / 60000);
}

/** Convert a wall-clock "YYYY-MM-DDTHH:mm" (or "YYYY-MM-DD") in `tz` to an epoch ms. */
export function zonedToUtc(local: string, tz: string): number {
  const [d, t = "00:00"] = local.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [hh, mm] = t.split(":").map(Number);
  const wall = Date.UTC(y, m - 1, day, hh, mm);
  let guess = wall;
  for (let i = 0; i < 2; i++) {
    guess = wall - offsetMinutes(guess, tz) * 60000;
  }
  return guess;
}

export function fmtTime(ms: number, tz: string, withSeconds = false): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    ...(withSeconds ? { second: "2-digit" } : {}),
  }).format(new Date(ms));
}

export function fmtDate(ms: number, tz: string, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
    ...opts,
  }).format(new Date(ms));
}

/** "Mon, Oct 6" for a YYYY-MM-DD string, without any time-zone shifting. */
export function fmtDateString(date: string, opts: Intl.DateTimeFormatOptions = {}): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    ...opts,
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function tzAbbrev(ms: number, tz: string): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" }).formatToParts(new Date(ms));
  return parts.find((p) => p.type === "timeZoneName")?.value ?? tz;
}

export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** Human description of how far ahead `tz` is from `viewerTz` right now. */
export function describeOffset(ms: number, tz: string, viewerTz: string): string {
  const diff = (offsetMinutes(ms, tz) - offsetMinutes(ms, viewerTz)) / 60;
  if (diff === 0) return "in the same time zone as you";
  const abs = Math.abs(diff);
  const h = Number.isInteger(abs) ? `${abs}` : abs.toFixed(1).replace(/\.0$/, "");
  return `${h} hour${abs === 1 ? "" : "s"} ${diff > 0 ? "ahead of" : "behind"} you`;
}

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
