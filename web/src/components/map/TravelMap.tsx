import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { Destination } from "../../types";
import { createMarkerIcon } from "./markerIcon";
import { StatusBadge } from "../common/StatusBadge";
import { Camera } from "lucide-react";

const WORLD_CENTER: [number, number] = [18, 15];
const INDIA_CENTER: [number, number] = [22.9734, 78.6569];

interface TravelMapProps {
  destinations: Destination[];
  viewMode: "world" | "india";
  selectedId?: string | null;
  memoryCounts: Record<string, number>;
  onSelect: (id: string) => void;
}

function MapController({
  viewMode,
  focusId,
  destinations,
}: {
  viewMode: "world" | "india";
  focusId?: string | null;
  destinations: Destination[];
}) {
  const map = useMap();
  useEffect(() => {
    if (focusId) {
      const dest = destinations.find((d) => d.id === focusId);
      if (dest) {
        map.flyTo([dest.latitude, dest.longitude], 9, { duration: 0.8 });
        return;
      }
    }
    if (viewMode === "india") {
      map.flyTo(INDIA_CENTER, 5, { duration: 0.8 });
    } else {
      map.flyTo(WORLD_CENTER, 2, { duration: 0.8 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, focusId]);
  return null;
}

export function TravelMap({
  destinations,
  viewMode,
  selectedId,
  memoryCounts,
  onSelect,
}: TravelMapProps) {
  const icons = useMemo(
    () =>
      Object.fromEntries(
        destinations.map((d) => [
          d.id,
          createMarkerIcon(d.status, d.isFavorite, d.id === selectedId),
        ]),
      ),
    [destinations, selectedId],
  );

  return (
    <MapContainer
      center={WORLD_CENTER}
      zoom={2}
      scrollWheelZoom
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController
        viewMode={viewMode}
        focusId={selectedId}
        destinations={destinations}
      />
      {destinations.map((d) => (
        <Marker
          key={d.id}
          position={[d.latitude, d.longitude]}
          icon={icons[d.id]}
          eventHandlers={{ click: () => onSelect(d.id) }}
        >
          <Tooltip direction="top" offset={[0, -32]} opacity={1}>
            <div className="min-w-[160px]">
              <p className="font-semibold text-sm text-ink">{d.name}</p>
              <p className="text-xs text-ink-soft mb-1.5">
                {[d.state, d.country].filter(Boolean).join(", ")}
              </p>
              <div className="flex items-center justify-between gap-2">
                <StatusBadge status={d.status} />
                {d.visitedFrom && (
                  <span className="text-[11px] text-ink-soft">
                    {new Date(d.visitedFrom).toLocaleDateString(undefined, {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
              {memoryCounts[d.id] > 0 && (
                <p className="text-[11px] text-ink-soft mt-1 flex items-center gap-1">
                  <Camera size={11} /> {memoryCounts[d.id]} Memories
                </p>
              )}
            </div>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
