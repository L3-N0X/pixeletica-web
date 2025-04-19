import { GridOverlayProps } from '@/types/map-types';
import { COORDINATE_SCALE } from '@/constants/map-constants';
import { useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { Polyline, LayerGroup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';

export function GridOverlay({ showGrid, gridSize }: GridOverlayProps) {
  const map = useMap();
  const [verticalLines, setVerticalLines] = useState<LatLngExpression[][]>([]);
  const [horizontalLines, setHorizontalLines] = useState<LatLngExpression[][]>([]);

  // Create grid when visibility changes or on map movement
  useEffect(() => {
    if (!showGrid || !map) return;

    // Function to generate the grid
    const updateGrid = () => {
      // Calculate the effective grid size (accounting for coordinate scale)
      const effectiveGridSize = gridSize * COORDINATE_SCALE;

      // Get current map bounds
      const bounds = map.getBounds();

      // Calculate grid start/end points with some buffer
      const startX = Math.floor(bounds.getWest() / effectiveGridSize) * effectiveGridSize;
      const endX = Math.ceil(bounds.getEast() / effectiveGridSize) * effectiveGridSize;
      const startY = Math.floor(bounds.getSouth() / effectiveGridSize) * effectiveGridSize;
      const endY = Math.ceil(bounds.getNorth() / effectiveGridSize) * effectiveGridSize;

      // Create vertical grid lines
      const vLines: LatLngExpression[][] = [];
      for (let x = startX; x <= endX; x += effectiveGridSize) {
        vLines.push([
          [bounds.getNorth(), x],
          [bounds.getSouth(), x],
        ]);
      }

      // Create horizontal grid lines
      const hLines: LatLngExpression[][] = [];
      for (let y = startY; y <= endY; y += effectiveGridSize) {
        hLines.push([
          [y, bounds.getWest()],
          [y, bounds.getEast()],
        ]);
      }

      setVerticalLines(vLines);
      setHorizontalLines(hLines);
    };

    // Update grid initially and when map moves
    updateGrid();
    map.on('moveend zoomend', updateGrid);

    return () => {
      map.off('moveend zoomend', updateGrid);
    };
  }, [map, showGrid, gridSize]);

  if (!showGrid) return null;

  // Determine styling based on grid type
  const isChunkGrid = gridSize === 16;
  const lineColor = isChunkGrid ? '#ff2222' : '#333333';
  const lineOpacity = isChunkGrid ? 0.8 : 0.5;
  const lineWeight = isChunkGrid ? 1.5 : 0.8;
  const dashArray = isChunkGrid ? undefined : '3,3';

  return (
    <LayerGroup>
      {verticalLines.map((positions, index) => (
        <Polyline
          key={`v-${index}`}
          positions={positions}
          pathOptions={{
            color: lineColor,
            weight: lineWeight,
            opacity: lineOpacity,
            dashArray,
          }}
        />
      ))}

      {horizontalLines.map((positions, index) => (
        <Polyline
          key={`h-${index}`}
          positions={positions}
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
