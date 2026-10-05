import Image from "next/image";
import { photoFor } from "@/components/Photo";
import { customPlaces, placeIcon } from "@/data/places";
import { mapsUrl } from "@/lib/trip";
import type { Stop } from "@/data/itinerary";

/** "Temple of Literature, Hanoi" -> "Temple of Literature"; keeps "Aoraki / Mount Cook". */
function displayName(title: string): string {
  return title.replace(/, [^,]+$/, "").replace(/ \([^)]*\)$/, "");
}

function firstSentences(text: string, max = 170): string {
  const t = text
    .replace(/\s*\([^)]*\)/g, "") // pronunciations and native names
    .replace(/\s*—\s*/g, " is a ")
    .replace(/\.(?=[A-Z])/g, ". ")
    .replace(/\s+([,.;])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(", "));
  return (end > 60 ? cut.slice(0, end) : cut).trim() + "…";
}

type Tile = { key: string; name: string; url: string; text: string; thumb?: string | null; icon?: string };

function resolve(title: string): Tile | null {
  if (title.startsWith("@")) {
    const c = customPlaces[title.slice(1)];
    return c ? { key: title, name: c.name, url: c.url, text: c.blurb, icon: placeIcon[c.kind] } : null;
  }
  const e = photoFor(title);
  return e ? { key: title, name: displayName(title), url: e.page, text: firstSentences(e.extract || e.description), thumb: e.thumb } : null;
}

export function hotelTile(stop: Stop): Tile | null {
  if (!stop.lodging) return null;
  return { key: `hotel-${stop.id}`, name: stop.lodging, url: mapsUrl(stop), text: stop.lodgingBlurb ?? `Where they stay in ${stop.place}.`, icon: stop.lodgingIcon ?? "🏨" };
}

export function PlaceTiles({ titles, hotel, className = "" }: { titles: string[]; hotel?: Stop; className?: string }) {
  const seen = new Set<string>();
  const tiles = titles
    .filter((t) => (seen.has(t) ? false : (seen.add(t), true)))
    .map(resolve)
    .filter((t): t is Tile => t !== null);
  const h = hotel ? hotelTile(hotel) : null;
  if (h) tiles.unshift(h);
  if (!tiles.length) return null;
  return (
    <ul className={`grid gap-2 sm:grid-cols-2 ${className}`}>
      {tiles.map((t) => (
        <li key={t.key}>
          <a
            href={t.url}
            target="_blank"
            rel="noreferrer"
            className="flex h-full gap-3 rounded-xl bg-stone-50 p-2 ring-1 ring-stone-200 transition hover:bg-white hover:ring-amber-400 dark:bg-stone-900 dark:ring-stone-800 dark:hover:bg-stone-800"
          >
            <div className="relative flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-stone-200 text-3xl dark:bg-stone-800">
              {t.thumb ? <Image src={t.thumb} alt={t.name} fill unoptimized sizes="96px" className="object-cover" /> : <span aria-hidden>{t.icon ?? "📍"}</span>}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">{t.name}</p>
              <p className={`mt-0.5 text-xs leading-snug text-stone-600 dark:text-stone-400 ${t.icon ? "line-clamp-2" : "line-clamp-3"}`}>{t.text}</p>
              {t.icon && <p className="mt-0.5 text-[11px] text-stone-400">Open in Google Maps ↗</p>}
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
