import axios from 'axios';
import type { ConversionSettings, TaskResponse, FileInfo } from '@types';

const API_URL = '/api';

/**
 * Start an image conversion task
 */
export const startConversion = async (
  data: {
    image: string;
    filename: string;
  } & Partial<ConversionSettings>
): Promise<TaskResponse> => {
  try {
    const response = await axios.post(`${API_URL}/conversion/start`, data);
    return response.data;
  } catch (error) {
    console.error('Error starting conversion:', error);
    throw error;
  }
};

/**
 * Get the status of a conversion task
 */
export const getConversionStatus = async (taskId: string): Promise<TaskResponse> => {
  try {
    const response = await axios.get(`${API_URL}/conversion/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting status for task ${taskId}:`, error);
    throw error;
  }
};

/**
 * List files available for a conversion task
 */
export const listConversionFiles = async (
  taskId: string,
  category?: string
): Promise<{ taskId: string; files: FileInfo[] }> => {
  try {
    const url = category
      ? `${API_URL}/conversion/${taskId}/files?category=${category}`
      : `${API_URL}/conversion/${taskId}/files`;

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error listing files for task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Get download URL for a specific file
 */
export const getFileDownloadUrl = (taskId: string, fileId: string): string => {
  return `${API_URL}/conversion/${taskId}/files/${fileId}`;
};

/**
 * Get download URL for all files as ZIP
 */
export const getAllFilesDownloadUrl = (taskId: string): string => {
  return `${API_URL}/conversion/${taskId}/download`;
};

/**
 * Download selected files as ZIP
 */
export const downloadSelectedFiles = async (taskId: string, fileIds: string[]): Promise<Blob> => {
  try {
    const response = await axios.post(
      `${API_URL}/conversion/${taskId}/download`,
      { fileIds },
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    console.error(`Error downloading selected files for task ${taskId}:`, error);
    throw error;
  }
};
