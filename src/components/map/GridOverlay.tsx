import { GridOverlayProps } from '@/types/map-types';
import { BLOCK_SIZE, CHUNK_SIZE } from '@/constants/map-constants';
import L from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

// Grid overlay component for better performance and correct grid lines
export function GridOverlay({ showGrid, gridSize }: GridOverlayProps) {
  const map = useMap();

  useEffect(() => {
    if (!showGrid) return;

    // Create a canvas overlay for the grid
    const canvas = L.DomUtil.create('canvas', 'leaflet-grid-canvas') as HTMLCanvasElement;
    const overlay = L.DomUtil.create('div', 'leaflet-grid-overlay');
    overlay.appendChild(canvas);

    // Position the canvas overlay properly
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '450'; // Ensure it's above the tiles but below controls

    const updateGrid = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get current bounds and zoom
      const bounds = map.getBounds();

      // Determine if this is a chunk grid
      const isChunkGrid = gridSize === CHUNK_SIZE;

      // Set line style based on grid type
      if (isChunkGrid) {
        ctx.strokeStyle = 'rgba(255,0,0,0.5)'; // Red for chunk grid
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = 'rgba(0,0,0,0.2)'; // Black for block grid
        ctx.lineWidth = 0.8;
      }

      // Calculate grid spacing in map coordinates
      // Make sure to round to avoid float precision issues
      const west = Math.floor(bounds.getWest() / gridSize) * gridSize;
      const east = Math.ceil(bounds.getEast() / gridSize) * gridSize;
      const north = Math.floor(bounds.getNorth() / gridSize) * gridSize;
      const south = Math.ceil(bounds.getSouth() / gridSize) * gridSize;

      // Debug grid calculation
      console.debug(`Grid: size=${gridSize}, bounds=[${west},${north}] to [${east},${south}]`);

      // Draw vertical grid lines (constant x)
      for (let x = west; x <= east; x += gridSize) {
        // Convert map coordinates to pixel coordinates
        const topPoint = map.latLngToContainerPoint([north, x]);
        const bottomPoint = map.latLngToContainerPoint([south, x]);

        ctx.beginPath();
        ctx.moveTo(topPoint.x, topPoint.y);
        ctx.lineTo(bottomPoint.x, bottomPoint.y);
        ctx.stroke();
      }

      // Draw horizontal grid lines (constant y/lat)
      for (let y = north; y <= south; y += gridSize) {
        // Convert map coordinates to pixel coordinates
        const leftPoint = map.latLngToContainerPoint([y, west]);
        const rightPoint = map.latLngToContainerPoint([y, east]);

        ctx.beginPath();
        ctx.moveTo(leftPoint.x, leftPoint.y);
        ctx.lineTo(rightPoint.x, rightPoint.y);
        ctx.stroke();
      }
    };

    // Add overlay to map pane to ensure proper layering
    map.getPanes().overlayPane.appendChild(overlay);

    // Redraw grid on map events
    const redraw = () => updateGrid();
    map.on('move zoom resize viewreset', redraw);

    // Initial draw
    updateGrid();

    return () => {
      map.off('move zoom resize viewreset', redraw);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };
  }, [map, showGrid, gridSize]);

  return null;
}
