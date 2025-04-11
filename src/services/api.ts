import axios from 'axios';
import {
  ConversionRequest,
  TaskResponse,
  FileListResponse,
  SelectiveDownloadRequest,
  MapListResponse,
} from '../types/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Conversion endpoints
export const conversionApi = {
  // Start a new conversion task
  startConversion: async (request: ConversionRequest): Promise<TaskResponse> => {
    const response = await api.post('/conversion/start', request);
    return response.data;
  },

  // Get conversion status
  getConversionStatus: async (taskId: string): Promise<TaskResponse> => {
    const response = await api.get(`/conversion/${taskId}`);
    return response.data;
  },

  // Delete a conversion task
  deleteConversion: async (taskId: string): Promise<void> => {
    await api.delete(`/conversion/${taskId}`);
  },

  // List files for a task
  listFiles: async (taskId: string, category?: string): Promise<FileListResponse> => {
    const params = category ? { category } : {};
    const response = await api.get(`/conversion/${taskId}/files`, { params });
    return response.data;
  },

  // Get file download URL
  getFileUrl: (taskId: string, fileId: string): string => {
    return `${api.defaults.baseURL}/conversion/${taskId}/files/${fileId}`;
  },

  // Get URL for downloading all files as ZIP
  getAllFilesZipUrl: (taskId: string): string => {
    return `${api.defaults.baseURL}/conversion/${taskId}/download`;
  },

  // Download selected files as ZIP
  downloadSelectedFiles: async (
    taskId: string,
    request: SelectiveDownloadRequest
  ): Promise<Blob> => {
    const response = await api.post(`/conversion/${taskId}/download`, request, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Maps endpoints
export const mapsApi = {
  // List all available maps
  listMaps: async (): Promise<MapListResponse> => {
    const response = await api.get('/maps.json');
    return response.data;
  },

  // Get map metadata URL
  getMapMetadataUrl: (mapId: string): string => {
    return `/api/map/${mapId}/metadata.json`;
  },

  // Get map full image URL
  getMapFullImageUrl: (mapId: string): string => {
    return `/api/map/${mapId}/full-image.jpg`;
  },

  // Get map thumbnail URL
  getMapThumbnailUrl: (mapId: string): string => {
    return `/api/map/${mapId}/thumbnail.jpg`;
  },

  // Get map tile URL
  getMapTileUrl: (mapId: string, zoom: number, x: number, y: number): string => {
    return `/api/map/${mapId}/tiles/${zoom}/${x}/${y}.png`;
  },
};

export default api;
