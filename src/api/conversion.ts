import { FormValues } from '@/pages/Create';
import { checkHealth } from './health';

// OpenAPI schema types
type LineVisibilityOption = 'no_lines' | 'block_grid_only' | 'chunk_lines_only' | 'both';
type DitherAlgorithmType = 'floyd_steinberg' | 'ordered' | 'random';
export type FileCategory = 'dithered' | 'rendered' | 'schematic' | 'web' | 'split';

interface TaskResponse {
  taskId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number | null;
  timestamp: string;
  error?: string | null;
}

// File information interface
export interface FileInfo {
  fileId: string;
  filename: string;
  type: string;
  size: number;
  category: FileCategory;
}

// Interface for the file list response
export interface FileListResponse {
  taskId: string;
  files: FileInfo[];
}

// Updated parameters interface based on OpenAPI spec
export interface StartConversionParams {
  imageFile: File;
  width: number;
  height: number;
  ditheringAlgorithm: DitherAlgorithmType;
  originX: number;
  originY: number;
  originZ: number;
  chunkLineColor: string; // Now expects RGBA format (#RRGGBBAA)
  blockGridLineColor: string; // Now expects RGBA format (#RRGGBBAA)
  colorPalette?: string;
  imageDivision: number; // Now uses direct number instead of string enum
  generateSchematic?: boolean;
  schematicName?: string;
  schematicAuthor?: string;
  schematicDescription?: string;
  generateWebFiles?: boolean;
  lineVisibilities: LineVisibilityOption[]; // Now supports multiple configurations
}

// Preview conversion interface based on OpenAPI spec
export interface PreviewConversionParams {
  imageFile?: File;
  width: number;
  height: number;
  algorithm: DitherAlgorithmType;
}

// Helper function to convert RGB and opacity to RGBA hex
export function rgbaToHex(rgb: string, opacity: number): string {
  // Remove # if present
  const hex = rgb.replace('#', '');
  // Convert opacity to hex
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${hex}${alpha}`;
}

// Helper function to map form values to API parameters
export function mapFormValuesToApiParams(
  formValues: FormValues,
  selectedFile: File
): StartConversionParams {
  const lineVisibilities: LineVisibilityOption[] = [];
  if (formValues.exportOptions.noLines) lineVisibilities.push('no_lines');
  if (formValues.exportOptions.onlyBlockGrid) lineVisibilities.push('block_grid_only');
  if (formValues.exportOptions.onlyChunkLines) lineVisibilities.push('chunk_lines_only');
  if (formValues.exportOptions.bothLines) lineVisibilities.push('both');

  return {
    imageFile: selectedFile,
    width: formValues.width,
    height: formValues.height,
    ditheringAlgorithm:
      formValues.ditheringAlgorithm === 'floydSteinberg'
        ? 'floyd_steinberg'
        : (formValues.ditheringAlgorithm as DitherAlgorithmType),
    originX: formValues.originX,
    originY: formValues.originY,
    originZ: formValues.originZ,
    chunkLineColor: rgbaToHex(formValues.chunkLineColor, formValues.chunkLineOpacity),
    blockGridLineColor: rgbaToHex(formValues.blockGridLineColor, formValues.blockGridLineOpacity),
    imageDivision: formValues.exportParts,
    generateSchematic: formValues.schematicOptions?.generate ?? false,
    ...(formValues.schematicOptions?.name && { schematicName: formValues.schematicOptions.name }),
    ...(formValues.schematicOptions?.author && {
      schematicAuthor: formValues.schematicOptions.author,
    }),
    ...(formValues.schematicOptions?.description && {
      schematicDescription: formValues.schematicOptions.description,
    }),
    generateWebFiles: true,
    lineVisibilities: lineVisibilities.length > 0 ? lineVisibilities : ['chunk_lines_only'],
  };
}

// Function to get preview of the conversion
export const getConversionPreview = async (
  params: PreviewConversionParams
): Promise<Blob | string> => {
  // First check if the API is reachable
  try {
    await checkHealth();
  } catch (error) {
    throw new Error('API is not reachable. Please try again later.');
  }

  const { imageFile, width, height, algorithm } = params;

  // Prepare form data
  const formData = new FormData();
  if (imageFile) {
    formData.append('image_file', imageFile);
  }
  formData.append('width', width.toString());
  formData.append('height', height.toString());
  formData.append('algorithm', algorithm);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const apiUrl = `${BACKEND_URL}/conversion/preview`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // Handle non-2xx responses
      const errorData = await response
        .json()
        .catch(() => ({ detail: 'Failed to parse error response' }));
      console.error('API Error:', response.status, errorData);
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // Response is either an image/png or an error in JSON format
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('image/png')) {
      return await response.blob();
    } else {
      const data = await response.json();
      throw new Error(data.detail || 'Failed to generate preview');
    }
  } catch (error) {
    console.error('Failed to get conversion preview:', error);
    // Re-throw the error to be handled by the caller
    throw error;
  }
};

export const startConversion = async (params: StartConversionParams): Promise<TaskResponse> => {
  // First check if the API is reachable
  try {
    await checkHealth();
  } catch (error) {
    throw new Error('API is not reachable. Please try again later.');
  }

  const {
    imageFile,
    width,
    height,
    ditheringAlgorithm,
    originX,
    originY,
    originZ,
    chunkLineColor,
    blockGridLineColor,
    imageDivision,
    generateSchematic,
    schematicName,
    schematicAuthor,
    schematicDescription,
    generateWebFiles,
    lineVisibilities,
    colorPalette = 'minecraft',
  } = params;

  // Create metadata JSON according to new API structure
  const metadata = {
    width,
    height,
    dithering_algorithm: ditheringAlgorithm,
    color_palette: colorPalette,
    origin_x: originX,
    origin_y: originY,
    origin_z: originZ,
    chunk_line_color: chunkLineColor,
    block_line_color: blockGridLineColor,
    line_visibilities: lineVisibilities,
    image_division: imageDivision,
    generate_schematic: generateSchematic ?? false,
    schematic_name: schematicName || 'my_schematic',
    schematic_author: schematicAuthor || 'Pixeletica API',
    schematic_description: schematicDescription || 'An awesome schematic',
    generate_web_files: generateWebFiles ?? true,
  };

  // Prepare form data for the request body with just two parts:
  // 1. The image file
  // 2. The metadata as JSON string
  const formData = new FormData();
  formData.append('image_file', imageFile); // First multipart boundary with image (using correct field name 'image_file')
  formData.append('metadata', JSON.stringify(metadata)); // Second multipart boundary with metadata as string, not as a Blob

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const apiUrl = `${BACKEND_URL}/conversion/start`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // Handle non-2xx responses
      const errorData = await response
        .json()
        .catch(() => ({ detail: 'Failed to parse error response' }));
      console.error('API Error:', response.status, errorData);
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // Expecting 202 Accepted status according to OpenAPI spec
    if (response.status === 202) {
      const data: TaskResponse = await response.json();
      return data;
    } else {
      // Handle unexpected successful status codes if necessary
      console.warn('Unexpected success status code:', response.status);
      // Attempt to parse as TaskResponse anyway or throw an error
      try {
        const data: TaskResponse = await response.json();
        return data;
      } catch (parseError) {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('Failed to start conversion:', error);
    // Re-throw the error to be handled by the caller
    throw error;
  }
};

export const getConversionStatus = async (taskId: string): Promise<TaskResponse> => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const apiUrl = `${BACKEND_URL}/conversion/${taskId}`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: 'Failed to parse error response' }));
      console.error('API Error:', response.status, errorData);
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data: TaskResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to get conversion status:', error);
    throw error;
  }
};

// Calculate polling interval based on image size
export const calculatePollingInterval = (width: number, height: number): number => {
  // Base interval - 500ms
  const baseInterval = 500;

  // Maximum interval - 36000ms (36 seconds)
  const maxInterval = 36000;

  // Calculate a factor based on image size (width * height)
  // For large images (> 1 million pixels), use longer intervals
  const pixelCount = width * height;
  const sizeFactor = Math.min(pixelCount / 1000000, 1); // Normalized between 0 and 1

  // Calculate interval (500ms for small images, up to 3000ms for large ones)
  const interval = Math.min(baseInterval + sizeFactor * 2500, maxInterval);

  return interval;
};

// Poll for task status until complete
export const pollTaskStatus = async (
  taskId: string,
  onProgress: (status: TaskResponse) => void,
  pollingInterval: number
): Promise<TaskResponse> => {
  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const status = await getConversionStatus(taskId);
        onProgress(status);

        if (status.status === 'completed') {
          resolve(status);
          return;
        } else if (status.status === 'failed') {
          reject(new Error(status.error || 'Conversion failed with no specific error message'));
          return;
        }

        // Continue polling
        setTimeout(checkStatus, pollingInterval);
      } catch (error) {
        reject(error);
      }
    };

    // Start polling
    checkStatus();
  });
};

// Function to get the list of files for a task
export const getTaskFiles = async (
  taskId: string,
  category?: string
): Promise<FileListResponse> => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  let apiUrl = `${BACKEND_URL}/conversion/${taskId}/files`;

  if (category) {
    apiUrl += `?category=${category}`;
  }

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: 'Failed to parse error response' }));
      console.error('API Error:', response.status, errorData);
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data: FileListResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to get task files:', error);
    throw error;
  }
};

// Function to download a single file
export const downloadFile = (taskId: string, fileId: string, filename: string): void => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const downloadUrl = `${BACKEND_URL}/conversion/${taskId}/files/${fileId}`;

  // Create a hidden anchor element to trigger download
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

// Function to download all files as ZIP
export const downloadAllFiles = (taskId: string): void => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const downloadUrl = `${BACKEND_URL}/conversion/${taskId}/download`;

  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = `conversion-${taskId}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

// Function to download selected files as ZIP
export const downloadSelectedFiles = async (taskId: string, fileIds: string[]): Promise<void> => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const apiUrl = `${BACKEND_URL}/conversion/${taskId}/download`;

  try {
    // Using fetch API to make POST request with selected file IDs
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileIds }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: 'Failed to parse error response' }));
      console.error('API Error:', response.status, errorData);
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // Convert response to blob and create download link
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `selected-files-${taskId}.zip`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download selected files:', error);
    throw error;
  }
};

// Format file size for display (KB, MB)
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};
