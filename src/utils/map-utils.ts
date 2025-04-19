import { BlockInfo } from '@/types/map-types';
import { MapMetadata } from '@/api/maps';
import { BLOCK_SIZE, COORDINATE_SCALE } from '@/constants/map-constants';

// Function to get block info from the block data matrix
export function getBlockInfoFromData(
  blockX: number,
  blockZ: number,
  blockData: any,
  mapData: MapMetadata | null
): BlockInfo | null {
  // Enhanced checks and logging
  if (!mapData) {
    console.warn('[getBlockInfoFromData] Map metadata not available.');
    return null;
  }
  if (!blockData) {
    console.warn('[getBlockInfoFromData] Block data not available.');
    return null;
  }
  if (!blockData.matrix || blockData.matrix.length === 0 || !blockData.matrix[0]) {
    console.warn('[getBlockInfoFromData] Block data matrix is invalid or empty.');
    return null;
  }
  if (!blockData.blocks) {
    console.warn('[getBlockInfoFromData] Block data blocks lookup is missing.');
    return null;
  }

  // Get actual block coordinates from UI coordinates
  const actualBlockX = Math.floor(blockX / COORDINATE_SCALE);
  const actualBlockZ = Math.floor(blockZ / COORDINATE_SCALE);

  // Calculate matrix dimensions
  const matrixHeight = blockData.matrix.length;
  const matrixWidth = blockData.matrix[0].length;

  // Calculate map dimensions in blocks
  const mapHeightInBlocks = Math.floor(mapData.height / BLOCK_SIZE);

  // Calculate the coordinates in the matrix
  // First, calculate the position relative to the map origin
  const relativeBlockX = actualBlockX - mapData.origin_x;

  // For Z axis, flip the coordinate system and move down by the map height
  // This handles the case where Z is negative and ensures we're in the bottom-left quadrant
  // We add mapHeightInBlocks to shift everything down
  const relativeZAdjusted = mapHeightInBlocks + actualBlockZ - mapData.origin_z;

  // Matrix index (top-down in matrix, which is inverted from our desired bottom-up)
  const matrixRowIndex = matrixHeight - 1 - relativeZAdjusted;

  console.debug(
    `[getBlockInfoFromData] blockCoords=(${blockX}, ${blockZ}), ` +
      `actualCoords=(${actualBlockX}, ${actualBlockZ}), ` +
      `mapOrigin=(${mapData.origin_x}, ${mapData.origin_z}), ` +
      `mapHeightInBlocks=${mapHeightInBlocks}, ` +
      `relativeX=${relativeBlockX}, relativeZAdjusted=${relativeZAdjusted}, ` +
      `matrixRowIndex=${matrixRowIndex}, matrixDims=(${matrixWidth}x${matrixHeight})`
  );

  // Ensure calculated indices are within matrix bounds
  if (
    matrixRowIndex < 0 ||
    matrixRowIndex >= matrixHeight ||
    relativeBlockX < 0 ||
    relativeBlockX >= matrixWidth
  ) {
    console.warn(
      `[getBlockInfoFromData] Matrix indices (${relativeBlockX}, ${matrixRowIndex}) out of bounds for block coords (${actualBlockX}, ${actualBlockZ}). ` +
        `Matrix dimensions: ${matrixWidth}x${matrixHeight}`
    );
    return null;
  }

  // Access the matrix at the calculated position
  if (!blockData.matrix[matrixRowIndex]) {
    console.warn(`[getBlockInfoFromData] Matrix row ${matrixRowIndex} is undefined.`);
    return null;
  }

  const shortId = blockData.matrix[matrixRowIndex][relativeBlockX];
  if (typeof shortId === 'undefined') {
    console.warn(
      `[getBlockInfoFromData] Value at matrix[${matrixRowIndex}][${relativeBlockX}] is undefined.`
    );
    return null;
  }

  const blockDetails = blockData.blocks[shortId];

  if (blockDetails) {
    return {
      type: blockDetails.name,
      minecraft_id: blockDetails.minecraft_id,
      hex: blockDetails.hex,
      rgb: blockDetails.rgb,
    };
  } else {
    console.warn(
      `No block details found for short ID: ${shortId} at block coords (${actualBlockX}, ${actualBlockZ})`
    );
    return null;
  }
}
