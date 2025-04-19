import { GridOverlayProps } from '@/types/map-types';
import { COORDINATE_SCALE } from '@/constants/map-constants';
import { useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { Polyline, LayerGroup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';

export function GridOverlay({ showGrid, gridSize, originX, originZ }: GridOverlayProps) {
  const map = useMap();
  const [verticalLines, setVerticalLines] = useState<LatLngExpression[][]>([]);
  const [horizontalLines, setHorizontalLines] = useState<LatLngExpression[][]>([]);

  useEffect(() => {
    if (!showGrid || !map) return;

    const updateGrid = () => {
      const effectiveGridSize = gridSize * COORDINATE_SCALE;
      const bounds = map.getBounds();

      // compute world‐coords for current view
      const offsetLng = originX * COORDINATE_SCALE;
      const offsetLat = originZ * COORDINATE_SCALE;
      const worldWest = bounds.getWest() + offsetLng;
      const worldEast = bounds.getEast() + offsetLng;
      const worldSouth = bounds.getSouth() + offsetLat;
      const worldNorth = bounds.getNorth() + offsetLat;

      // range of world grid lines
      const firstX = Math.ceil(worldWest / effectiveGridSize) * effectiveGridSize;
      const lastX = Math.floor(worldEast / effectiveGridSize) * effectiveGridSize;
      const firstZ = Math.ceil(worldSouth / effectiveGridSize) * effectiveGridSize;
      const lastZ = Math.floor(worldNorth / effectiveGridSize) * effectiveGridSize;

      const v: LatLngExpression[][] = [];
      for (let wx = firstX; wx <= lastX; wx += effectiveGridSize) {
        const x = wx - offsetLng;
        v.push([
          [worldNorth - offsetLat, x],
          [worldSouth - offsetLat, x],
        ]);
      }

      const h: LatLngExpression[][] = [];
      for (let wz = firstZ; wz <= lastZ; wz += effectiveGridSize) {
        const y = wz - offsetLat;
        h.push([
          [y, worldWest - offsetLng],
          [y, worldEast - offsetLng],
        ]);
      }

      setVerticalLines(v);
      setHorizontalLines(h);
    };

    updateGrid();
    map.on('moveend zoomend', updateGrid);
    return () => void map.off('moveend zoomend', updateGrid);
  }, [map, showGrid, gridSize, originX, originZ]);

  if (!showGrid) return null;

  // Determine styling based on grid type
  const isChunkGrid = gridSize === 16;
  const lineColor = isChunkGrid ? '#ff2222' : '#333333';
  const lineOpacity = isChunkGrid ? 0.8 : 0.5;
  const lineWeight = isChunkGrid ? 1.5 : 0.8;
  const dashArray = isChunkGrid ? undefined : '3,3';

  return (
    <LayerGroup>
      {verticalLines.map((pos, i) => (
        <Polyline
          key={`v-${i}`}
          positions={pos}
          pathOptions={{
            color: lineColor,
            weight: lineWeight,
            opacity: lineOpacity,
            dashArray,
          }}
        />
      ))}
      {horizontalLines.map((pos, i) => (
        <Polyline
          key={`h-${i}`}
          positions={pos}
          pathOptions={{
            color: lineColor,
            weight: lineWeight,
            opacity: lineOpacity,
            dashArray,
          }}
        />
      ))}
    </LayerGroup>
  );
}
