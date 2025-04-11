import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Map metadata structure based on the API response
 */
export interface MapMetadata {
  name: string;
  description?: string;
  width: number;
  height: number;
  tileSize: number;
  maxZoom: number;
  blockSize: number;
  chunkSize: number;
  originX: number;
  originY: number;
  originZ: number;
  blocks?: Record<string, BlockInfo>;
}

export interface BlockInfo {
  id: string;
  name: string;
  color: string;
  count?: number;
  [key: string]: any;
}

/**
 * Custom hook for fetching and managing map metadata
 */
export default function useMapMetadata(mapId: string | undefined) {
  const [metadata, setMetadata] = useState<MapMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapId) {
      setLoading(false);
      return;
    }

    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`/api/map/${mapId}/metadata.json`);
        setMetadata(response.data);
      } catch (err) {
        console.error('Failed to fetch map metadata:', err);
        setError('Failed to load map data. The map might not exist or there was a server error.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [mapId]);

  return { metadata, loading, error };
}
