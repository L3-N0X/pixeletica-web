import { MapMetadata } from '@/api/maps';

// Coordinates in the pixel/block space
export interface PixelCoords {
  x: number;
  z: number;
}

// Block information interface
export interface BlockInfo {
  type: string; // Display name (e.g., "Acacia Wood")
  minecraft_id?: string; // e.g., "minecraft:acacia_wood"
  hex?: string; // e.g., "#676157"
  rgb?: [number, number, number]; // e.g., [103, 97, 87]
}

// Props for the HoverInfo component
export interface HoverInfoProps {
  pixelCoords: PixelCoords | null; // Coordinates being hovered or clicked
  blockInfo: BlockInfo | null; // Info for the hovered/clicked block
  visible: boolean; // Whether the info box should be shown
  isActive: boolean; // True if a block is actively selected (clicked)
  mapOrigin: { x: number; z: number }; // Pass map origin for correct display
  activeBlockCoords: PixelCoords | null; // Pass snapped coords for display when active
}

// Props for the GridOverlay component
export interface GridOverlayProps {
  showGrid: boolean;
  gridSize: number;
}

// Props for the MouseTracker component
export interface MouseTrackerProps {
  onMouseMove: (coords: PixelCoords | null) => void;
  onClick: (coords: PixelCoords | null) => void;
  zoomLevel: number;
  minActiveZoom: number;
}

// Props for the BoundedTileLayer component
export interface BoundedTileLayerProps {
  mapId: string;
  metadata: MapMetadata;
  layerName?: string;
}
