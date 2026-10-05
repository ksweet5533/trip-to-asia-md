"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { TRAVELERS, isBooked, itemPlaces, itemText } from "@/data/itinerary";
import { PlaceTiles } from "@/components/PlaceTiles";
import { flightTrackerUrl, flightradarUrl } from "@/data/flights";
import { daysBetween, describeOffset, fmtDate, fmtDateString, fmtTime, partsInTz, tzAbbrev } from "@/lib/time";
import { getStatus, mapsUrl, planFor, progressAt, stopsWithTimes, TOTAL_DAYS, tripDayNumber, type StopWithTimes, type TripStatus } from "@/lib/trip";
import { FLAGS, Timeline } from "@/components/Timeline";
import { Photo } from "@/components/Photo";

const TripMap = dynamic(() => import("@/components/TripMap"), {
  ssr: false,
  loading: () => <div className="h-[420px] w-full animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800" />,
});

const VIEWER_ZONES = [
  { tz: "America/New_York", label: "Eastern (New York)" },
  { tz: "America/Chicago", label: "Central (Chicago)" },
  { tz: "America/Denver", label: "Mountain (Denver)" },
  { tz: "America/Los_Angeles", label: "Pacific (Los Angeles)" },
  { tz: "Europe/London", label: "UK (London)" },
];

function deviceTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York";
  } catch {
    return "America/New_York";
  }
}

function useNow(): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // `?at=2026-10-22T10:00Z` previews the site as of another moment.
    const at = new URLSearchParams(window.location.search).get("at");
    const base = at ? Date.parse(at) : NaN;
    const offset = Number.isFinite(base) ? base - Date.now() : 0;
    const tick = () => setNow(Date.now() + offset);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const tzListeners = new Set<() => void>();
function subscribeTz(cb: () => void) {
  tzListeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    tzListeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
function readViewerTz(): string {
  try {
    return localStorage.getItem("viewerTz") || deviceTz();
  } catch {
    return deviceTz();
  }
}

function useViewerTz(): [string, (tz: string) => void] {
  const tz = useSyncExternalStore(subscribeTz, readViewerTz, () => "America/New_York");
  const update = (next: string) => {
    try {
      localStorage.setItem("viewerTz", next);
    } catch {}
    tzListeners.forEach((cb) => cb());
  };
  return [tz, update];
}

export default function TripTracker() {
  const now = useNow();
  const [viewerTz, setViewerTz] = useViewerTz();

  const status = useMemo(() => (now === null ? null : getStatus(now)), [now]);
  const progress = useMemo(() => (now === null ? null : progressAt(now)), [now]);
  const [focus, setFocus] = useState<number | null>(null);
  const currentIndex = progress ? Math.max(0, progress.visited.length - 1) : 0;

  // Left and right arrow keys step through the stops on the map.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") setFocus((f) => Math.min(stopsWithTimes.length - 1, (f ?? currentIndex) + 1));
      if (e.key === "ArrowLeft") setFocus((f) => Math.max(0, (f ?? currentIndex) - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentIndex]);

  const zoneOptions = useMemo(() => {
    const d = deviceTz();
    const list = [...VIEWER_ZONES];
    if (!list.some((z) => z.tz === d)) list.unshift({ tz: d, label: `My device (${d.replace(/_/g, " ")})` });
    if (!list.some((z) => z.tz === viewerTz)) list.push({ tz: viewerTz, label: viewerTz.replace(/_/g, " ") });
    return list;
  }, [viewerTz]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
      <header className="flex flex-col gap-4 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">Trip to Asia and the Pacific</p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 sm:text-5xl">
            Where are {TRAVELERS}?
          </h1>
          <p className="mt-2 text-stone-600 dark:text-stone-400">
            Sep 28 to Dec 5, 2026 · Vietnam, Thailand, Bhutan, Indonesia, Australia, New Zealand
          </p>
        </div>
        <label className="flex flex-col gap-1 text-xs font-medium text-stone-500 dark:text-stone-400">
          Show my time in
          <select
            value={viewerTz}
            onChange={(e) => setViewerTz(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          >
            {zoneOptions.map((z) => (
              <option key={z.tz} value={z.tz}>
                {z.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      {now === null || status === null || progress === null ? (
        <div className="h-72 animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800" />
      ) : (
        <>
          <NowPanel now={now} status={status} viewerTz={viewerTz} />

          <section className="mt-8">
            <SectionTitle kicker="The trip so far" title="Map" />
            <div className="overflow-hidden rounded-2xl border border-stone-200 shadow-sm dark:border-stone-800">
              <TripMap stops={stopsWithTimes} visitedCount={progress.visited.length} status={status} focusIndex={focus} onFocus={setFocus} />
            </div>
            <MapNav focus={focus} setFocus={setFocus} currentIndex={currentIndex} now={now} />
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Day" value={status.kind === "before" ? "0" : `${Math.min(TOTAL_DAYS, Math.max(1, tripDayNumber(status.kind === "flying" ? status.today : status.today)))} of ${TOTAL_DAYS}`} />
              <Stat label="Stops reached" value={`${Math.max(0, progress.visited.length - 1)} of ${stopsWithTimes.length - 1}`} />
              <Stat label="Countries" value={progress.countries.length ? progress.countries.join(", ") : "None yet"} small />
              <Stat label="Distance so far" value={`${Math.round(progress.km).toLocaleString()} km`} />
            </dl>
          </section>

          <section className="mt-10">
            <SectionTitle kicker="Stop by stop" title="Itinerary" />
            <Timeline now={now} viewerTz={viewerTz} viewerLabel={zoneOptions.find((z) => z.tz === viewerTz)?.label.replace(/ \(.*\)$/, "") ?? viewerTz} currentId={status.kind === "at" || status.kind === "after" ? status.stop.id : status.kind === "flying" ? status.to.id : null} />
          </section>

          <footer className="mt-12 text-xs leading-relaxed text-stone-500 dark:text-stone-500">
            Photos from Wikipedia, credited on each stop. Map imagery © Esri, Maxar, Earthstar Geographics. Flight tracking by FlightAware and Flightradar24. Times are taken from the itinerary and may shift; the day&rsquo;s plan shows what was written down, not live confirmation.
          </footer>
        </>
      )}
    </div>
  );
}

function MapNav({ focus, setFocus, currentIndex, now }: { focus: number | null; setFocus: (i: number | null) => void; currentIndex: number; now: number }) {
  const index = focus ?? currentIndex;
  const stop = stopsWithTimes[index];
  const last = stopsWithTimes.length - 1;
  const delta = daysBetween(partsInTz(now, stop.tz).date, stop.arrive);
  const relation =
    index === currentIndex ? "they are here now" : delta > 0 ? `in ${delta} day${delta === 1 ? "" : "s"}` : `${-delta} day${delta === -1 ? "" : "s"} ago`;
  const btn = "rounded-full bg-white px-3 py-1.5 text-sm font-medium text-stone-800 ring-1 ring-stone-300 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-white dark:bg-stone-900 dark:text-stone-100 dark:ring-stone-700 dark:hover:bg-stone-800";
  return (
    <div className="mt-3 flex items-center gap-2">
      <button type="button" className={btn} onClick={() => setFocus(Math.max(0, index - 1))} disabled={index === 0} aria-label="Previous stop">
        ◀ <span className="hidden sm:inline">Previous</span>
      </button>
      <div className="min-w-0 flex-1 text-center">
        <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-50">
          {index + 1}. {stop.place}
          {focus === null ? "" : ""}
        </p>
        <p className="truncate text-xs text-stone-500">
          {fmtDateString(stop.arrive)} · {relation}
          {focus !== null ? (
            <>
              {" · "}
              <a href={`#stop-${stop.id}`} className="text-amber-700 underline underline-offset-2 dark:text-amber-400">
                details ↓
              </a>
            </>
          ) : null}
        </p>
      </div>
      <button type="button" className={btn} onClick={() => setFocus(Math.min(last, index + 1))} disabled={index === last} aria-label="Next stop">
        <span className="hidden sm:inline">Next</span> ▶
      </button>
      <button type="button" className={btn} onClick={() => setFocus(null)} disabled={focus === null} title="Zoom out to the whole route">
        Overview
      </button>
    </div>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">{kicker}</p>
      <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">{title}</h2>
    </div>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
      <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className={`mt-1 font-semibold text-stone-900 dark:text-stone-50 ${small ? "text-sm leading-snug" : "text-xl"}`}>{value}</dd>
    </div>
  );
}

function Clock({ label, sub, now, tz, accent }: { label: string; sub?: string; now: number; tz: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl px-4 py-3 ${accent ? "bg-amber-50 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:ring-amber-900" : "bg-stone-50 ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800"}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">{label}</p>
      <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-stone-900 dark:text-stone-50">{fmtTime(now, tz, true)}</p>
      <p className="text-sm text-stone-600 dark:text-stone-400">
        {fmtDate(now, tz)} · {tzAbbrev(now, tz)}
        {sub ? ` · ${sub}` : ""}
      </p>
    </div>
  );
}

function NowPanel({ now, status, viewerTz }: { now: number; status: TripStatus; viewerTz: string }) {
  const travelerTz = status.kind === "before" ? "America/New_York" : status.tz;
  const place =
    status.kind === "before" ? "New York" : status.kind === "flying" ? `on the way to ${status.to.place}` : status.stop.place;
  const sameDate = fmtDate(now, travelerTz) === fmtDate(now, viewerTz);
  const today = status.kind === "before" ? null : status.today;
  const plan = today ? planFor(today) : [];
  const stop: StopWithTimes | null = status.kind === "at" || status.kind === "after" ? status.stop : status.kind === "flying" ? status.to : null;

  let headline: string;
  if (status.kind === "before") headline = `${TRAVELERS} leave in ${status.daysUntil} day${status.daysUntil === 1 ? "" : "s"}`;
  else if (status.kind === "flying") headline = `${TRAVELERS} are in the air, ${status.from ? `${status.from.place} to ` : ""}${status.to.place}`;
  else if (status.kind === "after") headline = `${TRAVELERS} are home`;
  else if (status.travelDay && now < status.stop.arrivalMs) headline = `${TRAVELERS} are heading to ${status.stop.place}`;
  else headline = `${TRAVELERS} are in ${status.stop.place}`;

  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-950">
      <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
        <div className="p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">Right now</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">{headline}</h2>
          {stop && (
            <p className="mt-1 text-stone-600 dark:text-stone-400">
              {FLAGS[stop.country] ?? ""} {stop.country}
              {stop.lodging ? (
                <>
                  {" · "}
                  <a className="underline decoration-stone-300 underline-offset-2 hover:text-amber-700 dark:decoration-stone-600" href={mapsUrl(stop)} target="_blank" rel="noreferrer">
                    {stop.lodging}
                  </a>
                </>
              ) : null}
            </p>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Clock label={`Their time · ${status.kind === "flying" ? status.to.place : place}`} now={now} tz={travelerTz} accent />
            <Clock label="Your time" now={now} tz={viewerTz} />
          </div>
          <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
            {status.kind === "flying" ? status.to.place : place.charAt(0).toUpperCase() + place.slice(1)} is {describeOffset(now, travelerTz, viewerTz)}
            {sameDate ? "." : `, so it is already ${fmtDate(now, travelerTz, { weekday: "long" }).split(",")[0]} there.`}
          </p>

          {status.kind === "flying" && <FlightCard status={status} now={now} viewerTz={viewerTz} />}

          {status.kind === "before" && (
            <p className="mt-5 rounded-xl bg-stone-50 p-4 text-sm text-stone-700 ring-1 ring-stone-200 dark:bg-stone-900 dark:text-stone-300 dark:ring-stone-800">
              First flight: {fmtDateString(status.firstFlight.dep.slice(0, 10), { weekday: "long" })} at {status.firstFlight.dep.slice(11)} {tzAbbrev(status.firstFlight.depMs, status.firstFlight.fromTz)}.
            </p>
          )}

          {today && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Today&rsquo;s plan · {fmtDateString(today, { weekday: "long" })}
              </h3>
              {plan.length ? (
                <ul className="mt-2 space-y-1.5">
                  {plan.map((item) => (
                    <li key={itemText(item)} className="flex gap-2 text-sm text-stone-700 dark:text-stone-300">
                      {isBooked(item) ? (
                        <span className="w-3 shrink-0 text-center text-emerald-600" title="Booked">✓</span>
                      ) : (
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 self-start rounded-full bg-amber-500" />
                      )}
                      <span>{itemText(item)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-stone-500">Nothing written down for today. Probably a free day in {stop?.place}.</p>
              )}
              <PlaceTiles titles={plan.flatMap(itemPlaces)} hotel={stop ?? undefined} className="mt-3" />
            </div>
          )}

          {stop?.ideas?.length ? (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Could do in {stop.place}</h3>
              <ul className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {stop.ideas.slice(0, 6).map((b) => (
                  <li key={itemText(b)} className="flex gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <span className="mt-0.5 text-stone-400">○</span>
                    <span>{itemText(b)}</span>
                  </li>
                ))}
                {stop.ideas.length > 6 && (
                  <li className="text-sm">
                    <a href={`#stop-${stop.id}`} className="text-amber-700 underline underline-offset-2 dark:text-amber-400">
                      {stop.ideas.length - 6} more below
                    </a>
                  </li>
                )}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="relative min-h-56 bg-stone-100 dark:bg-stone-900">
          {stop ? <Photo wiki={stop.photoWiki ?? stop.wiki} alt={stop.place} className="absolute inset-0 h-full w-full object-cover" credit /> : null}
          {stop && (
            <a
              href={`#stop-${stop.id}`}
              className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-stone-800 shadow backdrop-blur hover:bg-white"
            >
              Jump to {stop.place} ↓
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function FlightCard({ status, now, viewerTz }: { status: Extract<TripStatus, { kind: "flying" }>; now: number; viewerTz: string }) {
  const f = status.flight;
  const pct = Math.round(Math.min(1, Math.max(0, status.progress)) * 100);
  const remainingMin = Math.max(0, Math.round((f.arrMs - now) / 60000));
  const fr = flightradarUrl(f);
  return (
    <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/40">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-sky-900 dark:text-sky-200">
          ✈ {f.airline} {f.no ?? ""} · {f.from} → {f.to}
        </p>
        <p className="text-xs text-sky-800 dark:text-sky-300">
          {remainingMin >= 60 ? `${Math.floor(remainingMin / 60)} h ${remainingMin % 60} min` : `${remainingMin} min`} to go
        </p>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-sky-200 dark:bg-sky-900">
        <div className="h-full rounded-full bg-sky-600 transition-[width]" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-sky-900 dark:text-sky-200">
        <div>
          <p className="font-medium">Departed {f.from}</p>
          <p>
            {fmtTime(f.depMs, f.fromTz)} {tzAbbrev(f.depMs, f.fromTz)} · {fmtTime(f.depMs, viewerTz)} your time
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium">Lands {f.to}</p>
          <p>
            {fmtTime(f.arrMs, f.toTz)} {tzAbbrev(f.arrMs, f.toTz)} · {fmtDate(f.arrMs, viewerTz)} {fmtTime(f.arrMs, viewerTz)} your time
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <a className="rounded-full bg-sky-700 px-3 py-1 font-medium text-white hover:bg-sky-800" href={flightTrackerUrl(f)} target="_blank" rel="noreferrer">
          Track on FlightAware
        </a>
        {fr && (
          <a className="rounded-full bg-white px-3 py-1 font-medium text-sky-900 ring-1 ring-sky-300 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-200 dark:ring-sky-800" href={fr} target="_blank" rel="noreferrer">
            Flightradar24
          </a>
        )}
        {f.approx && <span className="self-center text-sky-800 dark:text-sky-300">Times approximate</span>}
      </div>
    </div>
  );
}
