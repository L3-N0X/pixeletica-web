import { useState, useEffect, useCallback } from 'react';
import { mapsApi, conversionApi } from '../services/api';
import { MapInfo } from '../types/api';
import useRecentMaps from './useRecentMaps';
import useFavorites from './useFavorites';

/**
 * Hook to manage maps, including loading, sorting, filtering, and deleting
 */
export default function useMaps() {
  const [maps, setMaps] = useState<MapInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { favorites } = useFavorites();
  const { recentMaps } = useRecentMaps();

  // Load maps from API
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        setLoading(true);
        const response = await mapsApi.listMaps();
        setMaps(response.maps);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch maps:', err);
        setError('Failed to load available maps');
      } finally {
        setLoading(false);
      }
    };

    fetchMaps();
  }, [refreshTrigger]);

  // Refresh maps
  const refreshMaps = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Delete a map
  const deleteMap = useCallback(async (mapId: string) => {
    try {
      await conversionApi.deleteConversion(mapId);
      setMaps((prevMaps) => prevMaps.filter((map) => map.id !== mapId));
      return true;
    } catch (err) {
      console.error('Failed to delete map:', err);
      return false;
    }
  }, []);

  // Filter maps by search term
  const searchMaps = useCallback((maps: MapInfo[], searchTerm: string) => {
    if (!searchTerm) return maps;

    const term = searchTerm.toLowerCase();
    return maps.filter(
      (map) =>
        map.name.toLowerCase().includes(term) ||
        (map.description && map.description.toLowerCase().includes(term))
    );
  }, []);

  // Get favorite maps
  const getFavoriteMaps = useCallback(() => {
    const favoriteIds = new Set(favorites);
    return maps.filter((map) => favoriteIds.has(map.id));
  }, [maps, favorites]);

  // Get recent maps
  const getRecentMaps = useCallback(() => {
    const recentIds = recentMaps.map((r) => r.id);
    const recentMapObjects: MapInfo[] = [];

    // Preserve the order of recentMaps
    for (const id of recentIds) {
      const map = maps.find((m) => m.id === id);
      if (map) recentMapObjects.push(map);
    }

    return recentMapObjects;
  }, [maps, recentMaps]);

  return {
    maps,
    loading,
    error,
    refreshMaps,
    deleteMap,
    searchMaps,
    getFavoriteMaps,
    getRecentMaps,
  };
}
