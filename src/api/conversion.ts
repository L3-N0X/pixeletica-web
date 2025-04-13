import { FormValues } from '@/pages/Create';
import { checkHealth } from './health';

// OpenAPI schema types
type LineVisibilityOption = 'no_lines' | 'block_grid_only' | 'chunk_lines_only' | 'both';

interface TaskResponse {
  taskId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number | null;
  timestamp: string;
  error?: string | null;
}

// Updated parameters interface based on OpenAPI spec
export interface StartConversionParams {
  imageFile: File;
  width: number;
  height: number;
  ditheringAlgorithm: 'floyd_steinberg' | 'ordered' | 'random';
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
        : formValues.ditheringAlgorithm,
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

  // Construct query parameters
  const queryParams = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    dithering_algorithm: ditheringAlgorithm,
    origin_x: originX.toString(),
    origin_y: originY.toString(),
    origin_z: originZ.toString(),
    chunk_line_color: chunkLineColor,
    block_line_color: blockGridLineColor,
    image_division: imageDivision.toString(),
    generate_schematic: generateSchematic?.toString() ?? 'false',
    ...(schematicName && { schematic_name: schematicName }),
    ...(schematicAuthor && { schematic_author: schematicAuthor }),
    ...(schematicDescription && { schematic_description: schematicDescription }),
    generate_web_files: generateWebFiles?.toString() ?? 'true',
    color_palette: colorPalette,
  });

  // Prepare form data for the request body
  const formData = new FormData();
  formData.append('image_file', imageFile);
  // Add line visibilities to form data
  formData.append('line_visibilities', JSON.stringify(lineVisibilities));

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const apiUrl = `${BACKEND_URL}/conversion/start?${queryParams.toString()}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      // Headers might not be needed for FormData, browser sets Content-Type
      // headers: {
      //   'Content-Type': 'multipart/form-data', // Browser usually sets this automatically with boundary
      // },
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

// You might add other conversion-related API functions here later
// e.g., getConversionStatus, downloadFile, etc.
