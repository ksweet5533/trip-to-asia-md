"use client";

import { Photo, photoFor } from "@/components/Photo";
import { fmtDateString, fmtTime, tzAbbrev } from "@/lib/time";
import { mapsUrl, stopsWithTimes, type StopWithTimes } from "@/lib/trip";

export function Timeline({ now, viewerTz, currentId }: { now: number; viewerTz: string; currentId: string | null }) {
  return (
    <ol className="space-y-4">
      {stopsWithTimes.map((s) => (
        <StopCard key={s.id} stop={s} viewerTz={viewerTz} state={s.id === currentId ? "current" : s.arrivalMs <= now ? "past" : "future"} />
      ))}
    </ol>
  );
}

function StopCard({ stop, viewerTz, state }: { stop: StopWithTimes; viewerTz: string; state: "past" | "current" | "future" }) {
  const entry = photoFor(stop.wiki);
  const isHome = stop.id === "home";
  const ring = state === "current" ? "ring-2 ring-amber-500" : "ring-1 ring-stone-200 dark:ring-stone-800";
  return (
    <li id={`stop-${stop.id}`} className={`scroll-mt-4 overflow-hidden rounded-2xl bg-white dark:bg-stone-950 ${ring} ${state === "past" ? "opacity-80" : ""}`}>
      <div className="grid md:grid-cols-[220px_1fr]">
        <div className="relative h-40 md:h-full">
          <Photo wiki={stop.photoWiki ?? stop.wiki} alt={stop.place} className="absolute inset-0 h-full w-full object-cover" />
          {state === "current" && (
            <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow">They are here</span>
          )}
          {state === "past" && <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white">Done</span>}
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
            Arrives {fmtTime(stop.arrivalMs, stop.tz)} {tzAbbrev(stop.arrivalMs, stop.tz)} local, which is {fmtDateString(new Date(stop.arrivalMs + 0).toISOString().slice(0, 10))}{" "}
            {fmtTime(stop.arrivalMs, viewerTz)} for you{isHome ? "" : ""}.
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
              Map
            </a>
          </div>

          {stop.plans.length > 0 && (
            <details className="group mt-3" open={state === "current"}>
              <summary className="cursor-pointer select-none text-sm font-semibold text-stone-800 dark:text-stone-200">
                Day by day <span className="font-normal text-stone-500">({stop.plans.length})</span>
              </summary>
              <ul className="mt-2 space-y-2">
                {stop.plans.map((d) => (
                  <li key={d.date} className="grid grid-cols-[88px_1fr] gap-2 text-sm">
                    <span className="font-medium text-stone-700 dark:text-stone-300">{fmtDateString(d.date)}</span>
                    <span className="text-stone-600 dark:text-stone-400">{d.items.join(" · ")}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {(stop.booked?.length || stop.ideas?.length) ? (
            <details className="mt-2" open={state === "current"}>
              <summary className="cursor-pointer select-none text-sm font-semibold text-stone-800 dark:text-stone-200">
                Booked and could-do
              </summary>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {stop.booked?.length ? (
                  <ul className="space-y-1">
                    {stop.booked.map((b) => (
                      <li key={b} className="flex gap-2 text-sm text-stone-700 dark:text-stone-300">
                        <span className="text-emerald-600">✓</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {stop.ideas?.length ? (
                  <ul className="space-y-1">
                    {stop.ideas.map((b) => (
                      <li key={b} className="flex gap-2 text-sm text-stone-600 dark:text-stone-400">
                        <span className="text-stone-400">○</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </details>
          ) : null}
        </div>
      </div>
    </li>
  );
}
