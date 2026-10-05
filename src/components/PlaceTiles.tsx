import Image from "next/image";
import { photoFor } from "@/components/Photo";

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

export function PlaceTiles({ titles, className = "" }: { titles: string[]; className?: string }) {
  const seen = new Set<string>();
  const entries = titles
    .filter((t) => (seen.has(t) ? false : (seen.add(t), true)))
    .map((t) => ({ title: t, entry: photoFor(t) }))
    .filter((x) => x.entry);
  if (!entries.length) return null;
  return (
    <ul className={`grid gap-2 sm:grid-cols-2 ${className}`}>
      {entries.map(({ title, entry }) => (
        <li key={title}>
          <a
            href={entry!.page}
            target="_blank"
            rel="noreferrer"
            className="flex h-full gap-3 rounded-xl bg-stone-50 p-2 ring-1 ring-stone-200 transition hover:bg-white hover:ring-amber-400 dark:bg-stone-900 dark:ring-stone-800 dark:hover:bg-stone-800"
          >
            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-stone-200 dark:bg-stone-800">
              {entry!.thumb && <Image src={entry!.thumb} alt={displayName(title)} fill unoptimized sizes="96px" className="object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">{displayName(title)}</p>
              <p className="mt-0.5 line-clamp-3 text-xs leading-snug text-stone-600 dark:text-stone-400">
                {firstSentences(entry!.extract || entry!.description)}
              </p>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
