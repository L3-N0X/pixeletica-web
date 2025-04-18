// Types and interfaces for map data
export interface MapInfo {
  id: string;
  name: string;
  created: string;
  thumbnail: string;
  description?: string;
}

export interface MapListResponse {
  maps: MapInfo[];
}

export interface MapMetadata {
  id: string;
  name: string;
  width: number;
  height: number;
  origin_x: number;
  origin_z: number;
  created: string;
  tileSize: number;
  maxZoom: number;
  minZoom: number;
  tileFormat: string;
  description?: string;
}

// Base API URL
const getBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL || '/api';
};

/**
 * List all available maps (completed conversion tasks)
 */
export const listMaps = async (): Promise<MapListResponse> => {
  const baseUrl = getBaseUrl();
  const apiUrl = `${baseUrl}/maps.json`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch maps: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching maps list:', error);
    throw error;
  }
};

/**
 * Get detailed metadata for a specific map
 * @param mapId - Map identifier (task ID)
 */
export const getMapMetadata = async (mapId: string): Promise<MapMetadata> => {
  const baseUrl = getBaseUrl();
  const apiUrl = `${baseUrl}/map/${mapId}/metadata.json`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch map metadata: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching metadata for map ${mapId}:`, error);
    throw error;
  }
};

/**
 * Get the URL for the map thumbnail
 * @param mapId - Map identifier (task ID)
 */
export const getMapThumbnailUrl = (mapId: string): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/map/${mapId}/thumbnail.png`;
};

/**
 * Get the URL for the full map image
 * @param mapId - Map identifier (task ID)
 */
export const getMapFullImageUrl = (mapId: string): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/map/${mapId}/full-image.png`;
};

/**
 * Get the URL for a specific map tile
 * @param mapId - Map identifier (task ID)
 * @param zoom - Zoom level
 * @param x - X-coordinate of the tile
 * @param y - Y-coordinate of the tile
 */
export const getMapTileUrl = (mapId: string, zoom: number, x: number, y: number): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/map/${mapId}/tiles/${zoom}/${x}/${y}.png`;
};

/**
 * Fetch a specific map tile as a Blob
 * @param mapId - Map identifier (task ID)
 * @param zoom - Zoom level
 * @param x - X-coordinate of the tile
 * @param y - Y-coordinate of the tile
 */
export const fetchMapTile = async (
  mapId: string,
  zoom: number,
  x: number,
  y: number
): Promise<Blob> => {
  const tileUrl = getMapTileUrl(mapId, zoom, x, y);

  try {
    const response = await fetch(tileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch map tile: ${response.statusText}`);
    }
    return await response.blob();
  } catch (error) {
    console.error(`Error fetching tile for map ${mapId} at zoom=${zoom}, x=${x}, y=${y}:`, error);
    throw error;
  }
};
