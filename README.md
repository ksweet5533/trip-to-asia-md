# Trip to Asia: M&D

A single-page site that shows where M&D are on their Sep 28 to Dec 5, 2026 trip
through Vietnam, Thailand, Bhutan, Indonesia, Australia and New Zealand.

- **Right now**: current stop worked out from the itinerary in the stop's own
  time zone, with a live clock there and a clock in the viewer's zone (the
  viewer picks Eastern, Pacific, etc. and the choice is remembered).
- **Today's plan**, booked items (red in the planning doc) and "could do" ideas.
- **Flight tracker**: during a flight the panel shows progress and links to
  FlightAware and Flightradar24 for that flight number.
- **Map** of the whole route with the part travelled so far highlighted.
- **Stop by stop** itinerary with a photo, hotel link and day-by-day plan.

## Running

```bash
npm install
npm run dev -- -p 3001
```

Preview the site as of another moment with `?at=`, for example
`http://localhost:3001/?at=2026-10-27T03:00:00Z`.

## Editing the itinerary

- `src/data/itinerary.ts`: stops (place, time zone, coordinates, arrival date
  and time, hotel, booked items, ideas) and the day-by-day plan.
- `src/data/flights.ts`: flights with departure time local to the origin and
  arrival time local to the destination.
- `src/data/images.json`: one Wikipedia photo per stop. Regenerate after adding
  a stop with `node scripts/fetch-images.mjs` (it only fetches missing entries).
