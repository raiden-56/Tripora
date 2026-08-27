import L from "leaflet";
import type { DestinationStatus } from "../../types";

const COLORS: Record<DestinationStatus, string> = {
  visited: "#2f8a4f",
  planned: "#3576e0",
  wishlist: "#e39a1f",
};

const FAVORITE_COLOR = "#e04463";

export function createMarkerIcon(
  status: DestinationStatus,
  isFavorite: boolean,
  isSelected = false,
) {
  const color = isFavorite ? FAVORITE_COLOR : COLORS[status];
  const scale = isSelected ? 1.18 : 1;
  const html = `
    <div style="transform: scale(${scale}); transform-origin: bottom center; transition: transform .2s ease;">
      <svg width="30" height="38" viewBox="0 0 30 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 37C15 37 28 22.5 28 14C28 6.8 22.2 1 15 1C7.8 1 2 6.8 2 14C2 22.5 15 37 15 37Z"
          fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="15" cy="14" r="5.5" fill="white"/>
      </svg>
    </div>`;
  return L.divIcon({
    html,
    className: "tc-marker",
    iconSize: [30, 38],
    iconAnchor: [15, 37],
    popupAnchor: [0, -34],
  });
}
