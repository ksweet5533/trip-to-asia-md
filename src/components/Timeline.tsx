"use client";

import { Photo, photoFor } from "@/components/Photo";
import { isBooked, itemText } from "@/data/itinerary";
import { fmtDate, fmtDateString, fmtTime, partsInTz } from "@/lib/time";
import { mapsUrl, stopsWithTimes, type StopWithTimes } from "@/lib/trip";
import { daysBetween } from "@/lib/time";

type CardState = "past" | "current" | "next" | "future";

export function Timeline({ now, viewerTz, viewerLabel, currentId }: { now: number; viewerTz: string; viewerLabel: string; currentId: string | null }) {
  const currentIndex = stopsWithTimes.findIndex((s) => s.id === currentId);
  const nextIndex = currentIndex >= 0 ? currentIndex + 1 : stopsWithTimes.findIndex((s) => s.arrivalMs > now);
  return (
    <ol className="space-y-4">
      {stopsWithTimes.map((s, i) => {
        const state: CardState = s.id === currentId ? "current" : i === nextIndex ? "next" : s.arrivalMs <= now ? "past" : "future";
        return <StopCard key={s.id} stop={s} now={now} viewerTz={viewerTz} viewerLabel={viewerLabel} state={state} />;
      })}
    </ol>
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
        <div className="relative md:self-start md:sticky md:top-4">
          <div className="relative h-44 md:h-64">
            <Photo wiki={stop.photoWiki ?? stop.wiki} alt={stop.place} className="absolute inset-0 h-full w-full object-cover" credit />
            {state === "current" && <Badge tone="amber">They are here</Badge>}
            {state === "next" && <Badge tone="sky">Up next{daysAway > 0 ? ` · in ${daysAway} day${daysAway === 1 ? "" : "s"}` : " · today"}</Badge>}
            {state === "past" && <Badge tone="dark">Done</Badge>}
          </div>
          {photo?.description && (
            <p className="hidden px-3 py-2 text-xs text-stone-500 md:block">
              {stop.photoWiki ? `${stop.photoWiki}, nearby. ` : ""}
              {photo.description.charAt(0).toUpperCase() + photo.description.slice(1)}
            </p>
          )}
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
              {stop.place} <span className="font-normal text-stone-500">· {stop.country}</span>
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
            {stop.lodging && (
              <a href={mapsUrl(stop)} target="_blank" rel="noreferrer" className="rounded-full bg-stone-900 px-3 py-1 font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">
                🏨 {stop.lodging}
              </a>
            )}
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
            <details className="group mt-3" open={state === "current" || state === "next"}>
              <summary className="cursor-pointer select-none text-sm font-semibold text-stone-800 dark:text-stone-200">
                Day by day{" "}
                <span className="font-normal text-stone-500">
                  ({stop.plans.length} day{stop.plans.length === 1 ? "" : "s"}
                  {bookedCount ? `, ${bookedCount} booked ✓` : ""})
                </span>
              </summary>
              <ul className="mt-2 space-y-2">
                {stop.plans.map((d) => (
                  <li key={d.date} className="grid grid-cols-[88px_1fr] gap-2 text-sm">
                    <span className="font-medium text-stone-700 dark:text-stone-300">{fmtDateString(d.date)}</span>
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
                  </li>
                ))}
              </ul>
            </details>
          )}

          {stop.ideas?.length ? (
            <details className="mt-2" open={state === "current" || state === "next"}>
              <summary className="cursor-pointer select-none text-sm font-semibold text-stone-800 dark:text-stone-200">
                Could do <span className="font-normal text-stone-500">({stop.ideas.length} ideas)</span>
              </summary>
              <ul className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                {stop.ideas.map((b) => (
                  <li key={b} className="flex gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <span className="text-stone-400">○</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      </div>
    </li>
  );
}
