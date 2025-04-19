import { BlockInfo } from '@/types/map-types';
import { MapMetadata } from '@/api/maps';

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
  if (typeof blockData.height !== 'number') {
    console.warn('[getBlockInfoFromData] blockData.height is missing or invalid.');
    return null;
  }

  console.debug(`Looking up block info at [${blockX}, ${blockZ}]`);

  // Calculate the index within the blockData matrix
  const matrixX = blockX;
  const matrixZ = blockData.height - 1 - blockZ;

  const matrixHeight = blockData.matrix.length;
  const matrixWidth = blockData.matrix[0].length;

  console.debug(
    `[getBlockInfoFromData] blockCoords=(${blockX}, ${blockZ}), matrixIndices=(${matrixX}, ${matrixZ}), matrixDims=(${matrixWidth}x${matrixHeight})`
  );

  // Ensure calculated indices are within matrix bounds
  if (matrixZ < 0 || matrixZ >= matrixHeight || matrixX < 0 || matrixX >= matrixWidth) {
    console.warn(
      `[getBlockInfoFromData] Matrix indices (${matrixX}, ${matrixZ}) out of bounds for block coords (${blockX}, ${blockZ}).`
    );
    return null;
  }

  // Check if the row exists
  if (!blockData.matrix[matrixZ]) {
    console.warn(`[getBlockInfoFromData] Matrix row ${matrixZ} is undefined.`);
    return null;
  }

  const shortId = blockData.matrix[matrixZ][matrixX];
  if (typeof shortId === 'undefined') {
    console.warn(`[getBlockInfoFromData] Value at matrix[${matrixZ}][${matrixX}] is undefined.`);
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
      `No block details found for short ID: ${shortId} at block coords (${blockX}, ${blockZ})`
    );
    return null;
  }
}
