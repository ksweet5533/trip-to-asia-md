"use client";

import "leaflet/dist/leaflet.css";
import { Component, useEffect, useMemo, useState, type ReactNode } from "react";
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import { fmtDateString } from "@/lib/time";
import type { StopWithTimes, TripStatus } from "@/lib/trip";

// Keep the route on the Pacific side of the map so the SFO → Saigon leg does
// not get drawn the long way round through Europe.
const pacific = (s: { lat: number; lng: number }): LatLngExpression => [s.lat, s.lng < 0 ? s.lng + 360 : s.lng];

class MapErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-[420px] w-full items-center justify-center bg-stone-100 text-sm text-stone-500 dark:bg-stone-900">
          The map could not load. Reload the page to try again.
        </div>
      );
    }
    return this.props.children;
  }
}

type MapProps = {
  stops: StopWithTimes[];
  visitedCount: number;
  status: TripStatus;
  focusIndex: number | null; // null = overview of the whole route
  onFocus: (index: number | null) => void;
};

/** Flies the map to the focused stop, or back out to the whole route. */
function FlyTo({ target, bounds }: { target: LatLngExpression | null; bounds: LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, Math.max(map.getZoom(), 6), { duration: 0.9 });
    else map.flyToBounds(bounds, { duration: 0.9 });
  }, [map, target, bounds]);
  return null;
}

export default function TripMap(props: MapProps) {
  // A fresh key per mount keeps Leaflet from trying to reuse a container
  // that React has already handed to another map instance.
  const [mountKey] = useState(() => Math.random().toString(36).slice(2));
  return (
    <MapErrorBoundary>
      <LeafletMap key={mountKey} {...props} />
    </MapErrorBoundary>
  );
}

function LeafletMap({ stops, visitedCount, status, focusIndex, onFocus }: MapProps) {
  const focusStop = focusIndex === null ? null : (stops[focusIndex] ?? null);
  const done = useMemo(() => stops.slice(0, Math.max(0, visitedCount)).map(pacific), [stops, visitedCount]);
  const remaining = useMemo(() => stops.slice(Math.max(0, visitedCount - 1)).map(pacific), [stops, visitedCount]);
  const bounds = useMemo<LatLngBoundsExpression>(() => {
    const pts = stops.map(pacific) as [number, number][];
    const lats = pts.map((p) => p[0]);
    const lngs = pts.map((p) => p[1]);
    return [
      [Math.min(...lats) - 3, Math.min(...lngs) - 5],
      [Math.max(...lats) + 3, Math.max(...lngs) + 5],
    ];
  }, [stops]);

  const plane = useMemo<LatLngExpression | null>(() => {
    if (status.kind !== "flying" || !status.from) return null;
    const a = pacific(status.from) as [number, number];
    const b = pacific(status.to) as [number, number];
    const t = Math.min(1, Math.max(0, status.progress));
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }, [status]);

  const currentId = status.kind === "at" || status.kind === "after" ? status.stop.id : null;

  return (
    <MapContainer bounds={bounds} scrollWheelZoom={false} className="h-[420px] w-full" worldCopyJump>
      {/* Satellite imagery with an English place-name overlay: a "hybrid" map. */}
      <TileLayer
        attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics, and the GIS User Community'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        maxZoom={18}
      />
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" maxZoom={18} />
      <Polyline positions={remaining} pathOptions={{ color: "#fafaf9", weight: 2, opacity: 0.8, dashArray: "4 6" }} />
      {done.length > 1 && <Polyline positions={done} pathOptions={{ color: "#d97706", weight: 3 }} />}
      {plane && status.kind === "flying" && (
        <Polyline positions={[pacific(status.from!), plane]} pathOptions={{ color: "#0284c7", weight: 3 }} />
      )}
      {stops.map((s, i) => {
        const visited = i < visitedCount;
        const isCurrent = s.id === currentId;
        const isFocus = i === focusIndex;
        return (
          <CircleMarker
            key={s.id}
            center={pacific(s)}
            radius={isCurrent ? 9 : isFocus ? 8 : 5}
            eventHandlers={{ click: () => onFocus(i) }}
            pathOptions={{
              color: isCurrent || isFocus ? "#ffffff" : visited ? "#fde68a" : "#e7e5e4",
              fillColor: isCurrent ? "#f59e0b" : isFocus ? "#38bdf8" : visited ? "#fbbf24" : "#ffffff",
              fillOpacity: 1,
              weight: isCurrent || isFocus ? 3 : 2,
              className: isCurrent ? "pulse" : undefined,
            }}
          />
        );
      })}
      {focusStop && (
        <Popup key={focusStop.id} position={pacific(focusStop)} offset={[0, -6]} closeButton={false} autoPan={false}>
          <strong>{focusStop.place}</strong>
          <br />
          {fmtDateString(focusStop.arrive)}
          {focusStop.nights > 0 ? ` · ${focusStop.nights} night${focusStop.nights === 1 ? "" : "s"}` : ""}
          {focusStop.lodging ? (
            <>
              <br />
              {focusStop.lodging}
            </>
          ) : null}
          <br />
          <a href={`#stop-${focusStop.id}`}>Details ↓</a>
        </Popup>
      )}
      <FlyTo target={focusStop ? pacific(focusStop) : null} bounds={bounds} />
      {plane && (
        <CircleMarker center={plane} radius={7} pathOptions={{ color: "#0369a1", fillColor: "#38bdf8", fillOpacity: 1, weight: 2, className: "pulse" }}>
          <Popup>In the air</Popup>
        </CircleMarker>
      )}
    </MapContainer>
  );
}
