import { useState, useCallback, useRef } from 'react';

interface CachedTile {
  url: string;
  dataUrl: string;
  lastAccessed: number;
}

interface UseTileCacheProps {
  maxCacheSize?: number;
  cacheDuration?: number; // In milliseconds
}

export const useTileCache = ({
  maxCacheSize = 200,
  cacheDuration = 10 * 60 * 1000, // 10 minutes by default
}: UseTileCacheProps = {}) => {
  const cacheRef = useRef<Map<string, CachedTile>>(new Map());
  const [cacheSize, setCacheSize] = useState(0);

  const cleanCache = useCallback(() => {
    const now = Date.now();
    const cache = cacheRef.current;

    // Remove expired entries or trim cache if it exceeds max size
    if (cache.size > maxCacheSize || cache.size > 0) {
      // Convert to array for sorting
      const entries = Array.from(cache.entries());

      // Sort by last accessed time
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

      // Remove oldest entries or expired entries
      let removed = 0;
      for (const [key, tile] of entries) {
        if (cache.size - removed <= maxCacheSize * 0.8 && now - tile.lastAccessed < cacheDuration) {
          break;
        }

        cache.delete(key);
        removed++;
      }

      setCacheSize(cache.size);
    }
  }, [maxCacheSize, cacheDuration]);

  const getTile = useCallback((url: string): string | null => {
    const cache = cacheRef.current;
    const cachedTile = cache.get(url);

    if (cachedTile) {
      // Update last accessed time
      cachedTile.lastAccessed = Date.now();
      cache.set(url, cachedTile);
      return cachedTile.dataUrl;
    }

    return null;
  }, []);

  const setTile = useCallback(
    (url: string, dataUrl: string): void => {
      const cache = cacheRef.current;

      // Add to cache with current timestamp
      cache.set(url, {
        url,
        dataUrl,
        lastAccessed: Date.now(),
      });

      setCacheSize(cache.size);

      // Clean cache if needed
      if (cache.size > maxCacheSize) {
        cleanCache();
      }
    },
    [maxCacheSize, cleanCache]
  );

  return { getTile, setTile, cacheSize };
};
