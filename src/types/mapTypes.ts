export interface ChunkCoord {
  x: number;
  z: number;
}

export interface MapViewState {
  // Position coordinates
  x: number;
  y: number;

  // Zoom level
  zoom: number;

  // Selected block information
  selectedBlockId?: string;

  // Selected chunk information
  selectedChunk?: ChunkCoord;

  // Whether the map is currently loading
  isLoading?: boolean;
}
