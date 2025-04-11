import React, { useRef, useEffect } from 'react';
import { Pane } from 'evergreen-ui';

interface MapCanvasProps {
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  showBlockGrid: boolean;
  showChunkGrid: boolean;
  blockSize: number; // Size of a single block in pixels at scale 1
  chunkSize: number; // Number of blocks in a chunk (16 for Minecraft)
  blockLineColor?: string;
  chunkLineColor?: string;
  coordinateOrigin?: { x: number; y: number }; // Origin point for coordinates
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  width,
  height,
  scale,
  offsetX,
  offsetY,
  showBlockGrid,
  showChunkGrid,
  blockSize = 1,
  chunkSize = 16,
  blockLineColor = '#000000',
  chunkLineColor = '#FF0000',
  coordinateOrigin = { x: 0, y: 0 },
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Draw the grid
  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate the scaled block size
    const scaledBlockSize = blockSize * scale;

    // Calculate the chunk size in pixels
    const scaledChunkSize = scaledBlockSize * chunkSize;

    // Calculate the position of the first visible block/chunk
    const startX = Math.floor(-offsetX / scaledBlockSize) * scaledBlockSize + offsetX;
    const startY = Math.floor(-offsetY / scaledBlockSize) * scaledBlockSize + offsetY;

    // Draw block grid
    if (showBlockGrid && scale >= 2) {
      // Only show block grid when zoomed in enough
      ctx.strokeStyle = blockLineColor;
      ctx.lineWidth = 0.5;
      ctx.beginPath();

      // Vertical lines
      for (let x = startX; x < width; x += scaledBlockSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }

      // Horizontal lines
      for (let y = startY; y < height; y += scaledBlockSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }

      ctx.stroke();
    }

    // Draw chunk grid
    if (showChunkGrid) {
      ctx.strokeStyle = chunkLineColor;
      ctx.lineWidth = scale < 1 ? 0.5 : 1;
      ctx.beginPath();

      // Adjust for coordinate origin
      const originOffsetX = (coordinateOrigin.x % chunkSize) * blockSize * scale;
      const originOffsetY = (coordinateOrigin.y % chunkSize) * blockSize * scale;

      // Vertical chunk lines
      for (
        let x = startX - (startX % scaledChunkSize) - originOffsetX;
        x < width;
        x += scaledChunkSize
      ) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }

      // Horizontal chunk lines
      for (
        let y = startY - (startY % scaledChunkSize) - originOffsetY;
        y < height;
        y += scaledChunkSize
      ) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }

      ctx.stroke();
    }
  };

  // Set up canvas and handle resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set the canvas size to match the container
    canvas.width = width;
    canvas.height = height;

    // Draw the grid
    drawGrid();

    return () => {
      // Cancel any pending animation frame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    width,
    height,
    scale,
    offsetX,
    offsetY,
    showBlockGrid,
    showChunkGrid,
    blockLineColor,
    chunkLineColor,
  ]);

  // Use requestAnimationFrame for smooth rendering
  useEffect(() => {
    if (!canvasRef.current) return;

    const renderFrame = () => {
      drawGrid();
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animationFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <Pane position="absolute" top={0} left={0} width={width} height={height} pointerEvents="none">
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </Pane>
  );
};
