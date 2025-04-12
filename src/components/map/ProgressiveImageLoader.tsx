import React, { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react';

interface ProgressiveImageLoaderProps {
  mapId: string;
  baseUrl: string;
  lowResZoom?: number;
  width: number;
  height: number;
  onLoad?: () => void;
  onError?: () => void;
  alt?: string;
}

export const ProgressiveImageLoader: React.FC<ProgressiveImageLoaderProps> = ({
  mapId,
  baseUrl,
  lowResZoom = 0,
  width,
  height,
  onLoad,
  onError,
  alt = 'Map image',
}) => {
  const [lowResLoaded, setLowResLoaded] = useState(false);
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [error, setError] = useState(false);

  const lowResUrl = `${baseUrl}/api/map/${mapId}/tiles/${lowResZoom}/0/0.png`;
  const highResUrl = `${baseUrl}/api/map/${mapId}/full-image.jpg`;

  useEffect(() => {
    setLowResLoaded(false);
    setHighResLoaded(false);
    setError(false);
  }, [mapId]);

  const handleLowResLoad = () => {
    setLowResLoaded(true);
  };

  const handleHighResLoad = () => {
    setHighResLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  return (
    <Box position="relative" width={width} height={height}>
      {/* Low res image (loads first) */}
      {!highResLoaded && (
        <img
          src={lowResUrl}
          alt={`${alt} (low resolution)`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: lowResLoaded ? 'block' : 'none',
            filter: 'blur(3px)',
            transition: 'opacity 0.3s ease-in-out',
          }}
          onLoad={handleLowResLoad}
          onError={handleError}
        />
      )}

      {/* High res image (loads second) */}
      <img
        src={highResUrl}
        alt={alt}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: highResLoaded ? 'block' : 'none',
          opacity: highResLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
        }}
        onLoad={handleHighResLoad}
        onError={handleError}
      />

      {/* Error state */}
      {error && !lowResLoaded && !highResLoaded && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="100%"
          height="100%"
          backgroundColor="#1A1A1A"
        >
          <span role="img" aria-label="Error loading image" style={{ fontSize: 24 }}>
            ⚠️
          </span>
        </Box>
      )}
    </Box>
  );
};
