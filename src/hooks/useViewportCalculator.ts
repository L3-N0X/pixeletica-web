import { useState, useEffect, useCallback } from 'react';
import { debounce } from '../utils/debounce';

interface ViewportDimensions {
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
}

interface VisibleTile {
  x: number;
  y: number;
  zoom: number;
}

interface UseViewportCalculatorProps {
  containerRef: React.RefObject<HTMLElement>;
  tileSize: number;
  debounceMs?: number;
}

export const useViewportCalculator = ({
  containerRef,
  tileSize,
  debounceMs = 150,
}: UseViewportCalculatorProps) => {
  const [viewport, setViewport] = useState<ViewportDimensions>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    scale: 1,
  });

  const [visibleTiles, setVisibleTiles] = useState<VisibleTile[]>([]);

  // Calculate viewport dimensions
  const calculateViewport = useCallback(() => {
    if (!containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    const { x, y, scale } = containerRef.current.dataset;

    setViewport({
      width,
      height,
      x: parseFloat(x || '0'),
      y: parseFloat(y || '0'),
      scale: parseFloat(scale || '1'),
    });
  }, [containerRef]);

  // Debounce the viewport calculation for better performance
  const debouncedCalculate = useCallback(debounce(calculateViewport, debounceMs), [
    calculateViewport,
    debounceMs,
  ]);

  // Calculate visible tiles based on current viewport
  const calculateVisibleTiles = useCallback(() => {
    if (!viewport.width || !viewport.height) return;

    const { width, height, x, y, scale } = viewport;
    const zoom = Math.round(Math.log2(scale) + 1);
    const scaledTileSize = tileSize * Math.pow(2, zoom - 1);

    // Calculate tile indices that are visible in the viewport
    const startX = Math.floor(x / scaledTileSize);
    const startY = Math.floor(y / scaledTileSize);
    const endX = Math.ceil((x + width) / scaledTileSize);
    const endY = Math.ceil((y + height) / scaledTileSize);

    // Generate the array of visible tiles
    const tiles: VisibleTile[] = [];
    for (let tileX = startX; tileX <= endX; tileX++) {
      for (let tileY = startY; tileY <= endY; tileY++) {
        tiles.push({ x: tileX, y: tileY, zoom });
      }
    }

    setVisibleTiles(tiles);
  }, [viewport, tileSize]);

  // Update viewport when container changes
  useEffect(() => {
    calculateViewport();

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(debouncedCalculate);
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [containerRef, calculateViewport, debouncedCalculate]);

  // Calculate visible tiles when viewport changes
  useEffect(() => {
    calculateVisibleTiles();
  }, [viewport, calculateVisibleTiles]);

  return {
    viewport,
    visibleTiles,
    recalculate: calculateViewport,
  };
};
