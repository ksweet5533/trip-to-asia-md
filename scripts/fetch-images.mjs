// Fetches one representative photo per stop from Wikipedia and writes
// src/data/images.json. Run with: node scripts/fetch-images.mjs
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync(new URL("../src/data/itinerary.ts", import.meta.url), "utf8");
const titles = new Set([...src.matchAll(/(?:wiki|photoWiki):\s*"([^"]+)"/g)].map((m) => m[1]));
// Places tagged on day items: b("text", "Place", ...) or p("text", "Place", ...)
for (const m of src.matchAll(/\b[bp]\("(?:[^"\\]|\\.)*"((?:\s*,\s*"[^"]*")+)\s*\)/g)) {
  for (const t of m[1].matchAll(/"([^"]+)"/g)) if (!t[1].startsWith("@")) titles.add(t[1]);
}

const UA = "trip-to-asia-md site build (personal family site)";
let out = {};
try {
  out = JSON.parse(readFileSync(new URL("../src/data/images.json", import.meta.url), "utf8"));
} catch {}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const title of titles) {
  if (out[title]?.src && out[title]?.thumb) continue;
  await sleep(600);
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  try {
    let res = await fetch(url, { headers: { "User-Agent": UA } });
    for (let attempt = 0; res.status === 429 && attempt < 4; attempt++) {
      await sleep(3000 * (attempt + 1));
      res = await fetch(url, { headers: { "User-Agent": UA } });
    }
    if (!res.ok) throw new Error(`${res.status}`);
    const j = await res.json();
    // Wikimedia only renders a fixed set of thumbnail widths; 1280 is one of
    // them. Smaller originals are served as-is.
    const thumb = j.thumbnail?.source;
    const orig = j.originalimage;
    let src = null;
    if (thumb && orig?.width >= 1280) src = thumb.replace(/\/\d+px-/, "/1280px-").split("?")[0];
    else if (orig?.source) src = orig.source.split("?")[0];
    out[title] = {
      src,
      thumb: thumb ? thumb.split("?")[0] : src,
      page: j.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      description: j.description ?? "",
      extract: j.extract ?? "",
    };
    console.log(`ok   ${title}`);
  } catch (e) {
    out[title] = { src: null, page: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`, description: "", extract: "" };
    console.log(`FAIL ${title}: ${e.message}`);
  }
}

writeFileSync(new URL("../src/data/images.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
console.log(`wrote ${Object.keys(out).length} entries`);
