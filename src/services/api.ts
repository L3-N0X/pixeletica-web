import axios from 'axios';
import { API_BASE_URL } from '../utils/environment';

/**
 * Axios instance for API calls
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth headers or other modifications here
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle API errors here
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * API Services for conversion endpoints
 */
export const conversionApi = {
  /**
   * Start a new image conversion
   */
  startConversion: async (data: any) => {
    const response = await apiClient.post('/conversion/start', data);
    return response.data;
  },

  /**
   * Get conversion task status
   */
  getConversionStatus: async (taskId: string) => {
    const response = await apiClient.get(`/conversion/${taskId}`);
    return response.data;
  },

  /**
   * List files for a conversion task
   */
  listFiles: async (taskId: string, category?: string) => {
    const params = category ? { category } : undefined;
    const response = await apiClient.get(`/conversion/${taskId}/files`, { params });
    return response.data;
  },

  /**
   * Get file download URL
   */
  getFileUrl: (taskId: string, fileId: string) => {
    return `${API_BASE_URL}/conversion/${taskId}/files/${fileId}`;
  },

  /**
   * Get all files download URL
   */
  getAllFilesZipUrl: (taskId: string) => {
    return `${API_BASE_URL}/conversion/${taskId}/download`;
  },

  /**
   * Download selected files
   */
  downloadSelectedFiles: async (taskId: string, fileIds: string[]) => {
    const response = await apiClient.post(
      `/conversion/${taskId}/download`,
      { fileIds },
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * Delete a conversion task
   */
  deleteConversion: async (taskId: string) => {
    const response = await apiClient.delete(`/conversion/${taskId}`);
    return response.data;
  },
};

/**
 * API Services for map endpoints
 */
export const mapsApi = {
  /**
   * List all available maps
   */
  listMaps: async () => {
    const response = await apiClient.get('/api/maps.json');
    return response.data;
  },

  /**
   * Get map metadata
   */
  getMapMetadata: async (mapId: string) => {
    const response = await apiClient.get(`/api/map/${mapId}/metadata.json`);
    return response.data;
  },

  /**
   * Get map tile URL
   */
  getMapTileUrl: (mapId: string, zoom: number, x: number, y: number) => {
    return `${API_BASE_URL}/api/map/${mapId}/tiles/${zoom}/${x}/${y}.png`;
  },

  /**
   * Get full map image URL
   */
  getFullMapImageUrl: (mapId: string) => {
    return `${API_BASE_URL}/api/map/${mapId}/full-image.jpg`;
  },

  /**
   * Get map thumbnail URL
   */
  getMapThumbnailUrl: (mapId: string) => {
    return `${API_BASE_URL}/api/map/${mapId}/thumbnail.jpg`;
  },
};

/**
 * General API for backward compatibility
 */
export const api = {
  ...conversionApi,
  ...mapsApi,
};
