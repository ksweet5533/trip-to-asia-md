import Image from "next/image";
import images from "@/data/images.json";

type Entry = { src: string | null; thumb?: string | null; page: string; description: string; extract: string };
const table = images as Record<string, Entry>;

export function photoFor(wiki: string): Entry | undefined {
  return table[wiki];
}

export function Photo({ wiki, alt, className, credit }: { wiki: string; alt: string; className?: string; credit?: boolean }) {
  const entry = table[wiki];
  if (!entry?.src) {
    return <div className={`${className ?? ""} bg-gradient-to-br from-amber-100 to-stone-200 dark:from-stone-800 dark:to-stone-900`} aria-hidden />;
  }
  return (
    <>
      <Image src={entry.src} alt={alt} fill sizes="(min-width: 768px) 40vw, 100vw" className={className} unoptimized />
      {credit && (
        <a
          href={entry.page}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white/90 backdrop-blur hover:bg-black/70"
        >
          Photo: Wikipedia
        </a>
      )}
    </>
  );
}
