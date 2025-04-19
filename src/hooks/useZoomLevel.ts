import { useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';

// Custom hook for tracking the current zoom level
export function useZoomLevel(initialZoom = 0) {
  const [zoomLevel, setZoomLevel] = useState(initialZoom);

  const ZoomListener = () => {
    const map = useMap();

    useMapEvents({
      zoomend: () => {
        setZoomLevel(map.getZoom());
      },
    });

    return null;
  };

  return { zoomLevel, ZoomListener };
}
