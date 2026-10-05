"use client";

import { Photo, photoFor } from "@/components/Photo";
import { isBooked, itemPlaces, itemText } from "@/data/itinerary";
import { PlaceTiles } from "@/components/PlaceTiles";
import { fmtDate, fmtDateString, fmtTime, partsInTz } from "@/lib/time";
import { stopsWithTimes, type StopWithTimes } from "@/lib/trip";
import { daysBetween } from "@/lib/time";

type CardState = "past" | "current" | "next" | "future";

export const FLAGS: Record<string, string> = {
  USA: "🇺🇸",
  Vietnam: "🇻🇳",
  Thailand: "🇹🇭",
  Bhutan: "🇧🇹",
  Indonesia: "🇮🇩",
  Australia: "🇦🇺",
  "New Zealand": "🇳🇿",
};

type Group = { id: string; country: string; stops: StopWithTimes[]; arrive: string; depart: string; nights: number };

/** Consecutive stops in the same country, so each country reads as one chapter. */
export const countryGroups: Group[] = stopsWithTimes.reduce<Group[]>((groups, s) => {
  const last = groups[groups.length - 1];
  if (last && last.country === s.country) {
    last.stops.push(s);
    last.depart = s.departDate;
    last.nights += s.nights;
  } else {
    groups.push({ id: `${s.country.toLowerCase().replace(/\s+/g, "-")}-${groups.length + 1}`, country: s.country, stops: [s], arrive: s.arrive, depart: s.departDate, nights: s.nights });
  }
  return groups;
}, []);

export function Timeline({ now, viewerTz, viewerLabel, currentId }: { now: number; viewerTz: string; viewerLabel: string; currentId: string | null }) {
  const currentIndex = stopsWithTimes.findIndex((s) => s.id === currentId);
  const nextIndex = currentIndex >= 0 ? currentIndex + 1 : stopsWithTimes.findIndex((s) => s.arrivalMs > now);
  const stateOf = (s: StopWithTimes): CardState =>
    s.id === currentId ? "current" : s.index === nextIndex ? "next" : s.arrivalMs <= now ? "past" : "future";
  return (
    <>
      <nav className="mb-4 flex flex-wrap gap-2" aria-label="Countries">
        {countryGroups.map((g) => {
          const here = g.stops.some((s) => s.id === currentId);
          return (
            <a
              key={g.id}
              href={`#country-${g.id}`}
              className={`rounded-full px-3 py-1 text-sm font-medium ring-1 transition hover:bg-amber-50 dark:hover:bg-stone-800 ${
                here ? "bg-amber-100 text-amber-900 ring-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-800" : "bg-white text-stone-700 ring-stone-200 dark:bg-stone-900 dark:text-stone-300 dark:ring-stone-700"
              }`}
            >
              {FLAGS[g.country] ?? ""} {g.country}
              <span className="ml-1 font-normal text-stone-500">{g.stops.length > 1 || g.nights > 1 ? `${fmtDateString(g.arrive, { weekday: undefined })} to ${fmtDateString(g.depart, { weekday: undefined })}` : fmtDateString(g.arrive, { weekday: undefined })}</span>
            </a>
          );
        })}
      </nav>
      <ol className="space-y-8">
        {countryGroups.map((g) => {
          const here = g.stops.some((s) => s.id === currentId);
          const done = g.stops.every((s) => s.arrivalMs <= now) && !here;
          return (
            <li key={g.id} id={`country-${g.id}`} className="scroll-mt-4">
              <div
                className={`sticky top-0 z-10 -mx-4 mb-3 flex items-baseline justify-between gap-3 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 ${
                  here ? "bg-amber-500/95 text-white" : done ? "bg-stone-700/90 text-white" : "bg-stone-200/90 text-stone-900 dark:bg-stone-800/90 dark:text-stone-100"
                }`}
              >
                <h3 className="text-lg font-semibold tracking-tight">
                  <span className="mr-2">{FLAGS[g.country] ?? ""}</span>
                  {g.country}
                  {here ? <span className="ml-2 text-sm font-medium opacity-90">they are here</span> : null}
                </h3>
                <p className="shrink-0 text-sm opacity-90">
                  {fmtDateString(g.arrive, { weekday: undefined })} to {fmtDateString(g.depart, { weekday: undefined })}
                  {g.nights > 0 ? ` · ${g.nights} night${g.nights === 1 ? "" : "s"}` : ""}
                </p>
              </div>
              <ol className="space-y-4">
                {g.stops.map((s) => (
                  <StopCard key={s.id} stop={s} now={now} viewerTz={viewerTz} viewerLabel={viewerLabel} state={stateOf(s)} />
                ))}
              </ol>
            </li>
          );
        })}
      </ol>
    </>
  );
}

function Badge({ tone, children }: { tone: "amber" | "dark" | "sky"; children: React.ReactNode }) {
  const cls = tone === "amber" ? "bg-amber-500 text-white" : tone === "sky" ? "bg-sky-600 text-white" : "bg-black/60 text-white";
  return <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow ${cls}`}>{children}</span>;
}

function StopCard({ stop, now, viewerTz, viewerLabel, state }: { stop: StopWithTimes; now: number; viewerTz: string; viewerLabel: string; state: CardState }) {
  const entry = photoFor(stop.wiki);
  const photo = photoFor(stop.photoWiki ?? stop.wiki);
  const ring = state === "current" ? "ring-2 ring-amber-500" : state === "next" ? "ring-2 ring-sky-400" : "ring-1 ring-stone-200 dark:ring-stone-800";
  const daysAway = daysBetween(partsInTz(now, stop.tz).date, stop.arrive);
  const arrived = stop.arrivalMs <= now;
  const bookedCount = stop.plans.reduce((n, d) => n + d.items.filter(isBooked).length, 0);
  return (
    <li id={`stop-${stop.id}`} className={`scroll-mt-4 overflow-hidden rounded-2xl bg-white dark:bg-stone-950 ${ring} ${state === "past" ? "opacity-80" : ""}`}>
      <div className="grid md:grid-cols-[220px_1fr]">
        <div className="relative h-52 md:h-auto md:min-h-full">
          <Photo wiki={stop.photoWiki ?? stop.wiki} alt={stop.place} className="absolute inset-0 h-full w-full object-cover" credit creditClassName="right-3 top-3" />
          {state === "current" && <Badge tone="amber">They are here</Badge>}
          {state === "next" && <Badge tone="sky">Up next{daysAway > 0 ? ` · in ${daysAway} day${daysAway === 1 ? "" : "s"}` : " · today"}</Badge>}
          {state === "past" && <Badge tone="dark">Done</Badge>}
          {photo?.description && (
            <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-8 text-xs text-white/90">
              {stop.photoWiki ? `${stop.photoWiki}, nearby. ` : ""}
              {photo.description.charAt(0).toUpperCase() + photo.description.slice(1)}
            </p>
          )}
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
              {stop.place} <span className="font-normal text-stone-500">· {FLAGS[stop.country] ?? ""} {stop.country}</span>
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {fmtDateString(stop.arrive)}
              {stop.nights > 0 ? ` to ${fmtDateString(stop.departDate)} · ${stop.nights} night${stop.nights === 1 ? "" : "s"}` : ""}
            </p>
          </div>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{stop.blurb}</p>
          <p className="mt-2 text-xs text-stone-500">
            {arrived ? "Arrived" : "Arrives"} {fmtDate(stop.arrivalMs, stop.tz)} at {fmtTime(stop.arrivalMs, stop.tz)} local time, which is {fmtDate(stop.arrivalMs, viewerTz)} at{" "}
            {fmtTime(stop.arrivalMs, viewerTz)} {viewerLabel}.
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {entry && (
              <a href={entry.page} target="_blank" rel="noreferrer" className="rounded-full bg-stone-100 px-3 py-1 font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-200 dark:bg-stone-900 dark:text-stone-200 dark:ring-stone-700">
                About {stop.wiki}
              </a>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${stop.lat},${stop.lng}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-stone-100 px-3 py-1 font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-200 dark:bg-stone-900 dark:text-stone-200 dark:ring-stone-700"
            >
              Open in Google Maps
            </a>
          </div>

          {stop.plans.length > 0 && (
            <details className="group mt-3" open>
              <summary className="cursor-pointer select-none text-sm font-semibold text-stone-800 dark:text-stone-200">
                Day by day{" "}
                <span className="font-normal text-stone-500">
                  ({stop.plans.length} day{stop.plans.length === 1 ? "" : "s"}
                  {bookedCount ? `, ${bookedCount} booked ✓` : ""})
                </span>
              </summary>
              <ol className="mt-1 divide-y divide-stone-100 dark:divide-stone-800">
                {stop.plans.map((d) => (
                  <li key={d.date} className="grid gap-2 py-3 text-sm sm:grid-cols-[88px_1fr]">
                    <span className="font-medium text-stone-700 dark:text-stone-300">{fmtDateString(d.date)}</span>
                    <div className="min-w-0">
                      <ul className="space-y-1">
                        {d.items.map((item) => (
                          <li key={itemText(item)} className="flex gap-2 text-stone-600 dark:text-stone-400">
                            {isBooked(item) ? (
                              <span className="w-3 shrink-0 text-center text-emerald-600" title="Booked">✓</span>
                            ) : (
                              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 self-start rounded-full bg-amber-500" />
                            )}
                            <span className={isBooked(item) ? "text-stone-700 dark:text-stone-300" : ""}>{itemText(item)}</span>
                          </li>
                        ))}
                      </ul>
                      <PlaceTiles titles={d.items.flatMap(itemPlaces)} hotel={d.date === stop.arrive ? stop : undefined} className="mt-2" />
                    </div>
                  </li>
                ))}
              </ol>
            </details>
          )}

          {stop.ideas?.length ? (
            <details className="mt-2" open>
              <summary className="cursor-pointer select-none text-sm font-semibold text-stone-800 dark:text-stone-200">
                Could do <span className="font-normal text-stone-500">({stop.ideas.length} ideas)</span>
              </summary>
              <ul className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                {stop.ideas.map((b) => (
                  <li key={itemText(b)} className="flex gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <span className="text-stone-400">○</span>
                    <span>{itemText(b)}</span>
                  </li>
                ))}
              </ul>
              <PlaceTiles titles={stop.ideas.flatMap(itemPlaces)} className="mt-3" />
            </details>
          ) : null}
        </div>
      </div>
    </li>
  );
}
