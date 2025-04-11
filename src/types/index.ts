// Core data types for the application

/**
 * Metadata for a pixel art map
 */
export interface PixelArtMetadata {
  name: string;
  displayName: string;
  description?: string;
  width: number;
  height: number;
  tileSize: number;
  maxZoom: number;
  minZoom: number;
  origin: {
    x: number;
    y: number;
    z: number;
  };
  chunkSize: number;
  blocks: BlockTypes;
}

/**
 * Block types used in the map
 */
export interface BlockTypes {
  [blockId: string]: {
    name: string;
    color: string;
    count: number;
  };
}

/**
 * Image tile information
 */
export interface ImageTile {
  url: string;
  x: number;
  y: number;
  zoom: number;
  width: number;
  height: number;
  loading: boolean;
}

/**
 * Chunk information
 */
export interface Chunk {
  x: number;
  z: number;
  blocks: {
    [position: string]: string; // position (x,y,z) -> blockId
  };
}

/**
 * Block details
 */
export interface BlockDetails {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  color: string;
  chunkX: number;
  chunkZ: number;
}

/**
 * Image conversion task status
 */
export interface TaskResponse {
  taskId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number | null;
  timestamp: string;
  error?: string;
}

/**
 * Settings for image conversion
 */
export interface ConversionSettings {
  width?: number;
  height?: number;
  algorithm: 'floyd_steinberg' | 'ordered' | 'random';
  exportSettings: {
    exportTypes: Array<'png' | 'jpg' | 'webp' | 'html'>;
    originX: number;
    originY: number;
    originZ: number;
    drawChunkLines: boolean;
    chunkLineColor: string;
    drawBlockLines: boolean;
    blockLineColor: string;
    splitCount: number;
  };
  schematicSettings: {
    generateSchematic: boolean;
    author?: string;
    name?: string;
    description?: string;
  };
}

/**
 * File information
 */
export interface FileInfo {
  fileId: string;
  filename: string;
  type: string;
  size: number;
  category: string;
}
