import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';

// Maximum number of recent maps to store
const MAX_RECENT_MAPS = 10;

interface RecentMap {
  id: string;
  name: string;
  timestamp: number; // When it was added to recents
}

/**
 * A hook to manage recently viewed maps
 *
 * @returns Object with recent maps data and methods to manage them
 */
function useRecentMaps() {
  const [recentMaps, setRecentMaps] = useLocalStorage<RecentMap[]>('pixeletica-recent-maps', []);

  const addRecentMap = useCallback(
    (mapId: string, mapName: string) => {
      setRecentMaps((prev) => {
        // Remove if already exists
        const filtered = prev.filter((map) => map.id !== mapId);

        // Add to the beginning
        const newMap: RecentMap = {
          id: mapId,
          name: mapName,
          timestamp: Date.now(),
        };

        // Limit the number of entries
        return [newMap, ...filtered].slice(0, MAX_RECENT_MAPS);
      });
    },
    [setRecentMaps]
  );

  const removeRecentMap = useCallback(
    (mapId: string) => {
      setRecentMaps((prev) => prev.filter((map) => map.id !== mapId));
    },
    [setRecentMaps]
  );

  const clearRecentMaps = useCallback(() => {
    setRecentMaps([]);
  }, [setRecentMaps]);

  return {
    recentMaps,
    addRecentMap,
    removeRecentMap,
    clearRecentMaps,
  };
}

export default useRecentMaps;
