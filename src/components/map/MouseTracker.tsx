import { MouseTrackerProps, PixelCoords } from '@/types/map-types';
import L from 'leaflet';
import { useMapEvents } from 'react-leaflet';

// Component to track mouse position and handle clicks
export function MouseTracker({
  onMouseMove,
  onClick,
  zoomLevel,
  minActiveZoom,
}: MouseTrackerProps) {
  // Scale factor to fix coordinate system (0.5 makes each block have a single coordinate)
  const COORDINATE_SCALE = 0.5;

  // Process mouse coordinates with proper scaling
  const processCoordinates = (latlng: L.LatLng): PixelCoords => {
    const { lat, lng } = latlng;

    // Scale and floor to get correct block coordinates
    return {
      x: Math.floor(lng * COORDINATE_SCALE) / COORDINATE_SCALE,
      z: Math.floor(lat * COORDINATE_SCALE) / COORDINATE_SCALE,
    };
  };

  useMapEvents({
    mousemove: (e: L.LeafletMouseEvent) => {
      if (zoomLevel >= minActiveZoom) {
        onMouseMove(processCoordinates(e.latlng));
      } else {
        onMouseMove(null);
      }
    },
    mouseout: () => {
      onMouseMove(null);
    },
    click: (e: L.LeafletMouseEvent) => {
      if (zoomLevel >= minActiveZoom) {
        onClick(processCoordinates(e.latlng));
      } else {
        onClick(null);
      }
    },
  });

  return null;
}
