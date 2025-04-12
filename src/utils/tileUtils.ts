import type { PixelArtMetadata, ImageTile, BlockDetails } from '@/types';
import { getTileUrl } from '@services/mapService';

/**
 * Calculate the zoom level based on the scale factor
 */
export const calculateZoomLevel = (scale: number, metadata: PixelArtMetadata): number => {
  // Convert scale to zoom level, clamped between min and max zoom
  const zoomLevel = Math.max(metadata.minZoom, Math.min(Math.floor(scale * 4), metadata.maxZoom));
  return zoomLevel;
};

/**
 * Calculate which tiles are visible in the current viewport
 */
export const calculateVisibleTiles = (
  mapName: string,
  metadata: PixelArtMetadata,
  scale: number,
  positionX: number,
  positionY: number,
  viewportWidth: number,
  viewportHeight: number
): ImageTile[] => {
  // Determine the current zoom level
  const zoomLevel = calculateZoomLevel(scale, metadata);

  // Calculate the tile size at this zoom level
  const tileSize = 256; // Standard tile size

  // Calculate the visible area in tile coordinates
  const startX = Math.floor(-positionX / tileSize) - 1;
  const startY = Math.floor(-positionY / tileSize) - 1;
  const endX = Math.ceil((viewportWidth - positionX) / tileSize) + 1;
  const endY = Math.ceil((viewportHeight - positionY) / tileSize) + 1;

  // Generate tiles
  const tiles: ImageTile[] = [];

  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      // Check if tile is within map bounds
      if (
        x >= -Math.floor(metadata.width / tileSize / 2) &&
        x <= Math.ceil(metadata.width / tileSize / 2) &&
        y >= -Math.floor(metadata.height / tileSize / 2) &&
        y <= Math.ceil(metadata.height / tileSize / 2)
      ) {
        tiles.push({
          url: getTileUrl(mapName, zoomLevel, x, y),
          x,
          y,
          zoom: zoomLevel,
          width: tileSize,
          height: tileSize,
          loading: true,
        });
      }
    }
  }

  return tiles;
};

/**
 * Convert screen coordinates to world coordinates
 */
export const screenToWorld = (
  metadata: PixelArtMetadata,
  screenX: number,
  screenY: number,
  scale: number,
  positionX: number,
  positionY: number
): { worldX: number; worldY: number } => {
  const worldX = Math.floor((screenX - positionX) / (metadata.tileSize * scale));
  const worldY = Math.floor((screenY - positionY) / (metadata.tileSize * scale));

  return { worldX, worldY };
};

/**
 * Get block information at a specific position
 */
export const getBlockAtPosition = (
  metadata: PixelArtMetadata,
  x: number,
  y: number
): BlockDetails | null => {
  // This is a placeholder implementation
  // In a real implementation, we'd look up the block from the metadata or make an API call

  // Calculate chunk coordinates
  const chunkX = Math.floor(x / metadata.chunkSize);
  const chunkZ = Math.floor(y / metadata.chunkSize);

  // For now, generate sample data
  const blockId = Object.keys(metadata.blocks)[0] || 'unknown';
  const block = metadata.blocks[blockId];

  if (!block) return null;

  return {
    id: blockId,
    name: block.name,
    x,
    y,
    z: metadata.origin.z,
    color: block.color,
    chunkX,
    chunkZ,
  };
};

/**
 * Calculate chunk boundaries
 */
export const getChunkBoundaries = (
  metadata: PixelArtMetadata,
  chunkX: number,
  chunkZ: number
): { startX: number; startY: number; endX: number; endY: number } => {
  const startX = chunkX * metadata.chunkSize;
  const startY = chunkZ * metadata.chunkSize;
  const endX = startX + metadata.chunkSize - 1;
  const endY = startY + metadata.chunkSize - 1;

  return { startX, startY, endX, endY };
};

/**
 * Cache for storing loaded tiles to prevent reloading
 */
export const tileCache = new Map<string, string>();

/**
 * Generate a cache key for a tile
 */
export const getTileCacheKey = (mapName: string, zoom: number, x: number, y: number): string => {
  return `${mapName}_${zoom}_${x}_${y}`;
};

/**
 * Check if a tile is in the cache
 */
export const isTileCached = (mapName: string, zoom: number, x: number, y: number): boolean => {
  const key = getTileCacheKey(mapName, zoom, x, y);
  return tileCache.has(key);
};

/**
 * Add a tile to the cache
 */
export const cacheTile = (
  mapName: string,
  zoom: number,
  x: number,
  y: number,
  url: string
): void => {
  const key = getTileCacheKey(mapName, zoom, x, y);
  tileCache.set(key, url);
};

/**
 * Get a cached tile
 */
export const getCachedTile = (
  mapName: string,
  zoom: number,
  x: number,
  y: number
): string | null => {
  const key = getTileCacheKey(mapName, zoom, x, y);
  return tileCache.get(key) || null;
};

/**
 * Calculate the tile coordinates for a given point at a specific zoom level
 */
export function pointToTile(
  x: number,
  y: number,
  zoom: number,
  tileSize: number
): { tileX: number; tileY: number } {
  const scale = Math.pow(2, zoom);
  const tileX = Math.floor((x / tileSize) * scale);
  const tileY = Math.floor((y / tileSize) * scale);

  return { tileX, tileY };
}

/**
 * Calculate the block coordinates from pixel coordinates
 */
export function pixelToBlock(
  x: number,
  y: number,
  blockSize: number
): { blockX: number; blockY: number } {
  const blockX = Math.floor(x / blockSize);
  const blockY = Math.floor(y / blockSize);

  return { blockX, blockY };
}

/**
 * Calculate the chunk coordinates from block coordinates
 */
export function blockToChunk(
  blockX: number,
  blockY: number,
  chunkSize: number
): { chunkX: number; chunkY: number } {
  const chunkX = Math.floor(blockX / chunkSize);
  const chunkY = Math.floor(blockY / chunkSize);

  return { chunkX, chunkY };
}

/**
 * Calculate the scale factor for a given zoom level
 */
export function zoomToScale(zoom: number, maxZoom: number): number {
  return Math.pow(2, zoom - maxZoom + 1);
}

/**
 * Calculate the zoom level for a given scale
 */
export function scaleToZoom(scale: number, maxZoom: number): number {
  return Math.log2(scale) + maxZoom - 1;
}

/**
 * Generate a unique key for a tile
 */
export function generateTileKey(zoom: number, x: number, y: number): string {
  return `${zoom}_${x}_${y}`;
}

/**
 * Create a shareable URL for the current view
 */
export function createShareableUrl(mapId: string, x: number, y: number, zoom: number): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/map/${mapId}?x=${Math.round(x)}&y=${Math.round(y)}&zoom=${zoom}`;
}
