import React, { useState, useEffect, memo } from 'react';
import { Box, Spinner } from '@chakra-ui/react';

interface MapTileProps {
  mapId: string;
  zoom: number;
  x: number;
  y: number;
  size: number;
  baseUrl: string;
  onLoad?: () => void;
  onError?: () => void;
  getCachedTile?: (url: string) => string | null;
  setCachedTile?: (url: string, dataUrl: string) => void;
}

const MapTileComponent: React.FC<MapTileProps> = ({
  mapId,
  zoom,
  x,
  y,
  size,
  baseUrl,
  onLoad,
  onError,
  getCachedTile,
  setCachedTile,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const tileUrl = `${baseUrl}/api/map/${mapId}/tiles/${zoom}/${x}/${y}.png`;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    // Check if tile is in cache
    if (getCachedTile) {
      const cachedUrl = getCachedTile(tileUrl);
      if (cachedUrl) {
        setImageUrl(cachedUrl);
        setLoading(false);
        onLoad?.();
        return;
      }
    }

    // Fetch the tile
    fetch(tileUrl)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load tile');
        return response.blob();
      })
      .then((blob) => {
        if (!isMounted) return;

        const objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
        setLoading(false);

        // Cache the tile
        if (setCachedTile) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result && typeof reader.result === 'string') {
              setCachedTile(tileUrl, reader.result);
            }
          };
          reader.readAsDataURL(blob);
        }

        onLoad?.();
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error loading tile:', err);
        setError(true);
        setLoading(false);
        onError?.();
      });

    return () => {
      isMounted = false;
      // Clean up object URL to prevent memory leaks
      if (imageUrl && !getCachedTile) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [tileUrl, getCachedTile, setCachedTile, onLoad, onError]);

  if (loading) {
    return (
      <Box
        width={size}
        height={size}
        display="flex"
        alignItems="center"
        justifyContent="center"
        backgroundColor="rgba(0, 0, 0, 0.1)"
      >
        <Spinner size="sm" />
      </Box>
    );
  }

  if (error || !imageUrl) {
    return (
      <Box
        width={size}
        height={size}
        display="flex"
        alignItems="center"
        justifyContent="center"
        backgroundColor="rgba(255, 0, 0, 0.1)"
      >
        ⚠️
      </Box>
    );
  }

  return (
    <img
      src={imageUrl}
      width={size}
      height={size}
      alt={`Map tile (${x},${y}) at zoom ${zoom}`}
      style={{
        display: 'block',
        objectFit: 'cover',
      }}
    />
  );
};

// Memoize the component to prevent unnecessary re-renders
export const MapTile = memo(MapTileComponent, (prevProps, nextProps) => {
  // Only re-render if key properties change
  return (
    prevProps.mapId === nextProps.mapId &&
    prevProps.zoom === nextProps.zoom &&
    prevProps.x === nextProps.x &&
    prevProps.y === nextProps.y &&
    prevProps.size === nextProps.size
  );
});
