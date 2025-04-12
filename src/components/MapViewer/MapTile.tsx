import React, { useState, useRef } from 'react';
import { Box } from '@chakra-ui/react';

interface MapTileProps {
  url: string;
  x: number;
  y: number;
  tileSize: number;
  zoom: number;
}

const MapTile: React.FC<MapTileProps> = React.memo(({ url, x, y, tileSize, zoom }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setError(true);
    console.warn(`Failed to load tile: ${url}`);
  };

  return (
    <Box
      position="absolute"
      left={x * tileSize}
      top={y * tileSize}
      width={tileSize}
      height={tileSize}
      style={{
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
      }}
    >
      {!error ? (
        <img
          ref={imgRef}
          src={url}
          width={tileSize}
          height={tileSize}
          alt={`Tile ${x},${y} at zoom ${zoom}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="eager"
          style={{
            display: 'block',
            objectFit: 'cover',
            imageRendering: 'pixelated',
          }}
        />
      ) : (
        <Box
          width={tileSize}
          height={tileSize}
          background="tint2"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize={10}
          color="muted"
        >
          ⚠️
        </Box>
      )}
    </Box>
  );
});

MapTile.displayName = 'MapTile';

export default MapTile;
