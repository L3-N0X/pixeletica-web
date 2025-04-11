import { useState, useEffect, useMemo } from 'react';
import { MapMetadata } from './useMapMetadata';

interface Viewport {
  x: number;
  y: number;
  scale: number;
  width: number;
  height: number;
}

export interface Tile {
  key: string;
  x: number;
  y: number;
  zoom: number;
  url: string;
}

/**
 * Calculate which tiles are visible in the current viewport
 */
export default function useTileCalculator(
  metadata: MapMetadata | null,
  mapId: string | undefined,
  viewport: Viewport,
  padding: number = 1 // Number of tiles to load outside the visible area
) {
  const [visibleTiles, setVisibleTiles] = useState<Tile[]>([]);

  // Calculate the current zoom level based on scale
  const currentZoom = useMemo(() => {
    if (!metadata) return 0;

    // Convert scale to zoom level
    const zoomLevel = Math.log2(viewport.scale);

    // Find the closest discrete zoom level, capped at maxZoom
    return Math.min(Math.max(0, Math.round(zoomLevel + metadata.maxZoom - 1)), metadata.maxZoom);
  }, [viewport.scale, metadata]);

  // Calculate visible tiles when viewport or zoom changes
  useEffect(() => {
    if (!metadata || !mapId) {
      setVisibleTiles([]);
      return;
    }

    // Calculate the tile indices based on the current viewport and zoom level
    const tileSize = metadata.tileSize;
    const zoom = currentZoom;

    // Calculate the scale factor for the current zoom level
    const scaleFactor = Math.pow(2, metadata.maxZoom - zoom);

    // Calculate the tile coordinate range visible in the viewport
    const mapWidth = metadata.width / scaleFactor;
    const mapHeight = metadata.height / scaleFactor;

    // Convert viewport coordinates to tile indices
    const viewportLeft = viewport.x - viewport.width / 2 / viewport.scale;
    const viewportTop = viewport.y - viewport.height / 2 / viewport.scale;
    const viewportRight = viewportLeft + viewport.width / viewport.scale;
    const viewportBottom = viewportTop + viewport.height / viewport.scale;

    // Calculate tile indices with padding
    const startX = Math.max(0, Math.floor(viewportLeft / tileSize) - padding);
    const startY = Math.max(0, Math.floor(viewportTop / tileSize) - padding);
    const endX = Math.min(
      Math.ceil(mapWidth / tileSize),
      Math.ceil(viewportRight / tileSize) + padding
    );
    const endY = Math.min(
      Math.ceil(mapHeight / tileSize),
      Math.ceil(viewportBottom / tileSize) + padding
    );

    // Generate the list of visible tiles
    const tiles: Tile[] = [];

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        tiles.push({
          key: `${zoom}_${x}_${y}`,
          x,
          y,
          zoom,
          url: `/api/map/${mapId}/tiles/${zoom}/${x}/${y}.png`,
        });
      }
    }

    setVisibleTiles(tiles);
  }, [metadata, mapId, viewport, currentZoom, padding]);

  return {
    visibleTiles,
    currentZoom,
  };
}
