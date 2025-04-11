import React, { useRef, useEffect } from 'react';
import { Pane } from 'evergreen-ui';
import { MapMetadata } from '../../hooks/useMapMetadata';

interface GridOverlayProps {
  width: number;
  height: number;
  scale: number;
  position: { x: number; y: number };
  metadata: MapMetadata | null;
  showBlockGrid: boolean;
  showChunkGrid: boolean;
}

const GridOverlay: React.FC<GridOverlayProps> = ({
  width,
  height,
  scale,
  position,
  metadata,
  showBlockGrid,
  showChunkGrid,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw the grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !metadata) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Skip drawing if scale is too small to avoid performance issues
    if (scale < 0.1 && showBlockGrid) return;
    if (scale < 0.05 && showChunkGrid) return;

    // Set up the canvas
    ctx.save();

    // Calculate offsets to center the grid
    const offsetX = width / 2 - position.x * scale;
    const offsetY = height / 2 - position.y * scale;

    // Move the origin to the center of the viewport
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Calculate the visible area in block coordinates
    const visibleLeft = position.x - width / 2 / scale;
    const visibleTop = position.y - height / 2 / scale;
    const visibleRight = position.x + width / 2 / scale;
    const visibleBottom = position.y + height / 2 / scale;

    // Calculate the block range to draw
    const blockSize = metadata.blockSize;
    const startX = Math.floor(visibleLeft / blockSize) * blockSize;
    const startY = Math.floor(visibleTop / blockSize) * blockSize;
    const endX = Math.ceil(visibleRight / blockSize) * blockSize;
    const endY = Math.ceil(visibleBottom / blockSize) * blockSize;

    // Draw block grid
    if (showBlockGrid && scale > 0.1) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();

      // Vertical lines
      for (let x = startX; x <= endX; x += blockSize) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }

      // Horizontal lines
      for (let y = startY; y <= endY; y += blockSize) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }

      ctx.stroke();
    }

    // Draw chunk grid (16x16 blocks)
    if (showChunkGrid) {
      const chunkSize = metadata.chunkSize * blockSize;

      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();

      // Convert to chunk coordinates
      const chunkStartX = Math.floor(visibleLeft / chunkSize) * chunkSize;
      const chunkStartY = Math.floor(visibleTop / chunkSize) * chunkSize;
      const chunkEndX = Math.ceil(visibleRight / chunkSize) * chunkSize;
      const chunkEndY = Math.ceil(visibleBottom / chunkSize) * chunkSize;

      // Vertical chunk lines
      for (let x = chunkStartX; x <= chunkEndX; x += chunkSize) {
        ctx.moveTo(x, chunkStartY);
        ctx.lineTo(x, chunkEndY);
      }

      // Horizontal chunk lines
      for (let y = chunkStartY; y <= chunkEndY; y += chunkSize) {
        ctx.moveTo(chunkStartX, y);
        ctx.lineTo(chunkEndX, y);
      }

      ctx.stroke();
    }

    ctx.restore();
  }, [width, height, scale, position, metadata, showBlockGrid, showChunkGrid]);

  return (
    <Pane position="absolute" top={0} left={0} width={width} height={height} pointerEvents="none">
      <canvas ref={canvasRef} width={width} height={height} style={{ display: 'block' }} />
    </Pane>
  );
};

export default GridOverlay;
