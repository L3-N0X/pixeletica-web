// API type definitions based on the OpenAPI schema

export type DitherAlgorithm = 'floyd_steinberg' | 'ordered' | 'random';

export type TaskStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface ExportSettings {
  exportTypes?: ('png' | 'jpg' | 'webp' | 'html')[];
  originX?: number;
  originY?: number;
  originZ?: number;
  drawChunkLines?: boolean;
  chunkLineColor?: string;
  drawBlockLines?: boolean;
  blockLineColor?: string;
  splitCount?: number;
  versionOptions?: Record<string, any>;
}

export interface SchematicSettings {
  generateSchematic?: boolean;
  author?: string | null;
  name?: string | null;
  description?: string | null;
}

export interface ConversionRequest {
  image: string; // Base64-encoded image data
  filename: string;
  width?: number | null;
  height?: number | null;
  algorithm?: DitherAlgorithm;
  exportSettings?: ExportSettings;
  schematicSettings?: SchematicSettings;
}

export interface TaskResponse {
  taskId: string;
  status: TaskStatus;
  progress?: number | null;
  timestamp?: string;
  error?: string | null;
}

export interface FileInfo {
  fileId: string;
  filename: string;
  type: string;
  size: number;
  category: string;
}

export interface FileListResponse {
  taskId: string;
  files: FileInfo[];
}

export interface SelectiveDownloadRequest {
  fileIds: string[];
}

export interface MapInfo {
  id: string;
  name: string;
  created: string;
  thumbnail: string;
  description?: string | null;
}

export interface MapListResponse {
  maps: MapInfo[];
}
