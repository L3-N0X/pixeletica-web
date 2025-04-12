import axios from 'axios';
import type { PixelArtMetadata } from '@/types';

const API_URL = '/api';

/**
 * Fetches the list of available pixel art maps
 */
export const getAvailableMaps = async (): Promise<PixelArtMetadata[]> => {
  try {
    const response = await axios.get(`${API_URL}/maps.json`);
    return response.data;
  } catch (error) {
    console.error('Error fetching maps:', error);
    throw error;
  }
};

/**
 * Fetches metadata for a specific map
 */
export const getMapMetadata = async (mapName: string): Promise<PixelArtMetadata> => {
  try {
    const response = await axios.get(`${API_URL}/map/${mapName}/metadata.json`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching metadata for map ${mapName}:`, error);
    throw error;
  }
};

/**
 * Fetches the full image for a map at initial zoom
 */
export const getFullImage = async (mapName: string): Promise<string> => {
  try {
    const response = await axios.get(`${API_URL}/map/${mapName}/full-image.jpg`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error(`Error fetching full image for map ${mapName}:`, error);
    throw error;
  }
};

/**
 * Generates a URL for a specific tile
 */
export const getTileUrl = (mapName: string, zoom: number, x: number, y: number): string => {
  return `${API_URL}/map/${mapName}/tiles/${zoom}/${x}/${y}.jpg`;
};
