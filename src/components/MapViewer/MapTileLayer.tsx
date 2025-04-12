import React, { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import MapTile from './MapTile';

interface MapTileLayerProps {
  mapId: string;
  metadata: any;
  zoom: number;
  onBlockSelect: (blockId: string) => void;
  selectedBlockId?: string;
}

const MapTileLayer: React.FC<MapTileLayerProps> = ({ mapId, metadata, zoom, onBlockSelect }) => {
  const [tiles, setTiles] = useState<Array<{ x: number; y: number; zoom: number }>>([]);
  const tileSize = 256; // Standard tile size

  // Calculate visible tiles based on viewport and zoom
  const calculateVisibleTiles = () => {
    if (!metadata) return [];

    // This is a simplified version - in a real implementation you would
    // calculate based on the actual viewport position and size
    const mapWidth = metadata.width || 1024;
    const mapHeight = metadata.height || 1024;

    const tilesX = Math.ceil(mapWidth / (tileSize * zoom));
    const tilesY = Math.ceil(mapHeight / (tileSize * zoom));

    const visibleTiles = [];

    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        visibleTiles.push({
          x,
          y,
          zoom: Math.round(zoom),
        });
      }
    }

    return visibleTiles;
  };

  // Update tiles when zoom changes
  useEffect(() => {
    setTiles(calculateVisibleTiles());
  }, [zoom, metadata]);

  // Handle block clicks
  const handleTileClick = (x: number, y: number) => {
    const blockId = `${x},${y}`;
    onBlockSelect(blockId);
  };

  return (
    <Box width={metadata?.width || 1024} height={metadata?.height || 1024} position="relative">
      {tiles.map((tile) => (
        <MapTile
          key={`${tile.zoom}-${tile.x}-${tile.y}`}
          url={`/api/map/${mapId}/tiles/${tile.zoom}/${tile.x}/${tile.y}.png`}
          x={tile.x}
          y={tile.y}
          zoom={tile.zoom}
          tileSize={tileSize}
        />
      ))}

      {/* Add clickable overlay for block selection */}
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        onClick={(e: {
          currentTarget: { getBoundingClientRect: () => any };
          clientX: number;
          clientY: number;
        }) => {
          // Calculate which block was clicked
          const rect = e.currentTarget.getBoundingClientRect();
          const x = Math.floor((e.clientX - rect.left) / (tileSize * zoom));
          const y = Math.floor((e.clientY - rect.top) / (tileSize * zoom));
          handleTileClick(x, y);
        }}
        css={{ cursor: 'pointer' }}
      />
    </Box>
  );
};

export default MapTileLayer;
