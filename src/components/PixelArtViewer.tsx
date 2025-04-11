import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Pane, Button, IconButton, Tooltip, Badge } from 'evergreen-ui';
import { getTileUrl, getFullImage } from '@services/mapService';
import { calculateVisibleTiles, getBlockAtPosition } from '@utils/tileUtils';
import type { PixelArtMetadata, BlockDetails, ImageTile } from '@types';

interface PixelArtViewerProps {
  metadata: PixelArtMetadata;
  mapName: string;
  onBlockSelect: (block: BlockDetails | null) => void;
}

const PixelArtViewer: React.FC<PixelArtViewerProps> = ({ metadata, mapName, onBlockSelect }) => {
  const [zoom, setZoom] = useState(1);
  const [fullImage, setFullImage] = useState<string | null>(null);
  const [visibleTiles, setVisibleTiles] = useState<ImageTile[]>([]);
  const [hoveredBlock, setHoveredBlock] = useState<BlockDetails | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [debug, setDebug] = useState(false);

  // Fetch full image on initial load
  useEffect(() => {
    const loadFullImage = async () => {
      try {
        const imageUrl = await getFullImage(mapName);
        setFullImage(imageUrl);
      } catch (error) {
        console.error('Failed to load full image:', error);
      }
    };

    loadFullImage();

    // Set initial viewport size
    setViewport({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Add resize listener
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mapName]);

  // Handle transform change (zoom/pan)
  const handleTransformChange = useCallback(
    (transform: { scale: number; positionX: number; positionY: number }) => {
      const { scale, positionX, positionY } = transform;
      setZoom(scale);

      // Calculate which tiles should be visible
      const tiles = calculateVisibleTiles(
        mapName,
        metadata,
        scale,
        positionX,
        positionY,
        viewport.width,
        viewport.height
      );

      setVisibleTiles(tiles);

      // Update grid overlay
      updateGridOverlay(scale, positionX, positionY);
    },
    [mapName, metadata, viewport]
  );

  // Update the grid overlay when zoom/position changes
  const updateGridOverlay = useCallback(
    (scale: number, posX: number, posY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Only draw grid when zoomed in enough
      if (scale < 3) return;

      // Draw block grid
      context.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      context.lineWidth = 0.5;

      const blockSize = metadata.tileSize * scale;
      const offsetX = posX % blockSize;
      const offsetY = posY % blockSize;

      // Draw vertical lines
      for (let x = offsetX; x < canvas.width; x += blockSize) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
      }

      // Draw horizontal lines
      for (let y = offsetY; y < canvas.height; y += blockSize) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
      }

      // Draw chunk boundaries when zoomed in further
      if (scale > 5) {
        const chunkSize = blockSize * metadata.chunkSize;
        const chunkOffsetX = posX % chunkSize;
        const chunkOffsetY = posY % chunkSize;

        context.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        context.lineWidth = 1;

        // Draw vertical chunk lines
        for (let x = chunkOffsetX; x < canvas.width; x += chunkSize) {
          context.beginPath();
          context.moveTo(x, 0);
          context.lineTo(x, canvas.height);
          context.stroke();
        }

        // Draw horizontal chunk lines
        for (let y = chunkOffsetY; y < canvas.height; y += chunkSize) {
          context.beginPath();
          context.moveTo(0, y);
          context.lineTo(canvas.width, y);
          context.stroke();
        }
      }
    },
    [metadata]
  );

  // Handle mouse move to determine hovered block
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, transformState: any) => {
      if (zoom < 3) {
        if (hoveredBlock) setHoveredBlock(null);
        return;
      }

      const { scale, positionX, positionY } = transformState;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convert screen coordinates to world coordinates
      const blockX = Math.floor((x - positionX) / (metadata.tileSize * scale));
      const blockY = Math.floor((y - positionY) / (metadata.tileSize * scale));

      // Get block details
      const block = getBlockAtPosition(metadata, blockX, blockY);
      setHoveredBlock(block);
    },
    [metadata, zoom, hoveredBlock]
  );

  // Handle click to select block
  const handleClick = useCallback(() => {
    if (hoveredBlock) {
      onBlockSelect(hoveredBlock);
    }
  }, [hoveredBlock, onBlockSelect]);

  // Render tile grid with memoization
  const TileGrid = useMemo(() => {
    return (
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: zoom >= 2 ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        {visibleTiles.map((tile) => (
          <img
            key={`${tile.zoom}-${tile.x}-${tile.y}`}
            src={tile.url}
            alt={`Tile ${tile.x},${tile.y} at zoom ${tile.zoom}`}
            style={{
              position: 'absolute',
              left: `${(tile.x + 1) * tile.width}px`,
              top: `${(tile.y + 1) * tile.height}px`,
              width: `${tile.width}px`,
              height: `${tile.height}px`,
              backgroundColor: 'rgba(20, 20, 20, 0.2)',
              opacity: tile.loading ? 0.5 : 1,
              transition: 'opacity 0.2s ease',
              imageRendering: 'pixelated',
            }}
            onLoad={() => {
              const updatedTiles = visibleTiles.map((t) => {
                if (t.x === tile.x && t.y === tile.y && t.zoom === tile.zoom) {
                  return { ...t, loading: false };
                }
                return t;
              });
              setVisibleTiles(updatedTiles);
            }}
          />
        ))}
      </div>
    );
  }, [visibleTiles, zoom]);

  return (
    <Pane height="100%" position="relative">
      <TransformWrapper
        initialScale={1}
        minScale={0.1}
        maxScale={20}
        onTransformed={({ state }) => handleTransformChange(state)}
        limitToBounds={false}
        wheel={{ step: 0.2 }}
        doubleClick={{ disabled: true }}
      >
        {({ zoomIn, zoomOut, resetTransform, state }) => (
          <React.Fragment>
            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%' }}
            >
              <Pane
                width="100%"
                height="100%"
                position="relative"
                onMouseMove={(e) => handleMouseMove(e, state)}
                onClick={handleClick}
              >
                {/* Full image at low zoom */}
                {fullImage && (
                  <img
                    src={fullImage}
                    alt={metadata.displayName}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      opacity: zoom < 2 ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                      position: 'absolute',
                      imageRendering: 'pixelated',
                    }}
                  />
                )}

                {/* Tile layer */}
                {TileGrid}

                {/* Canvas overlay for grid */}
                <canvas
                  ref={canvasRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                  }}
                  width={viewport.width}
                  height={viewport.height}
                />

                {/* Block hover highlight */}
                {hoveredBlock && zoom > 3 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: hoveredBlock.x * metadata.tileSize,
                      top: hoveredBlock.y * metadata.tileSize,
                      width: metadata.tileSize,
                      height: metadata.tileSize,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </Pane>
            </TransformComponent>

            {/* Controls */}
            <Pane
              position="absolute"
              bottom={16}
              left={16}
              display="flex"
              gap={8}
              backgroundColor="rgba(30, 30, 30, 0.7)"
              padding={8}
              borderRadius={4}
            >
              <Tooltip content="Zoom In">
                <IconButton icon="zoom-in" onClick={() => zoomIn()} />
              </Tooltip>
              <Tooltip content="Zoom Out">
                <IconButton icon="zoom-out" onClick={() => zoomOut()} />
              </Tooltip>
              <Tooltip content="Reset View">
                <IconButton icon="home" onClick={() => resetTransform()} />
              </Tooltip>
              <Tooltip content="Toggle Debug Info">
                <IconButton icon="console" onClick={() => setDebug(!debug)} />
              </Tooltip>
            </Pane>

            {/* Debug info */}
            {debug && (
              <Pane
                position="absolute"
                top={16}
                right={16}
                backgroundColor="rgba(30, 30, 30, 0.7)"
                padding={8}
                borderRadius={4}
              >
                <Badge>Zoom: {zoom.toFixed(2)}x</Badge>
                <Badge marginLeft={8}>Tiles: {visibleTiles.length}</Badge>
                <Badge marginLeft={8}>
                  Position: {Math.floor(state.positionX)},{Math.floor(state.positionY)}
                </Badge>
              </Pane>
            )}

            {/* Hover info */}
            {hoveredBlock && zoom > 3 && (
              <Pane
                position="absolute"
                top={16}
                left={16}
                backgroundColor="rgba(30, 30, 30, 0.9)"
                padding={8}
                borderRadius={4}
                minWidth={200}
              >
                <strong>{hoveredBlock.name}</strong>
                <p>
                  X: {hoveredBlock.x}, Y: {hoveredBlock.y}, Z: {hoveredBlock.z}
                </p>
                <p>
                  Chunk: {hoveredBlock.chunkX}, {hoveredBlock.chunkZ}
                </p>
                <small>Click to view details</small>
              </Pane>
            )}
          </React.Fragment>
        )}
      </TransformWrapper>
    </Pane>
  );
};

export default PixelArtViewer;
