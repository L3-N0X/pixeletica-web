import { BLOCK_SIZE, CHUNK_SIZE, COORDINATE_SCALE } from '@/constants/map-constants';
import { HoverInfoProps } from '@/types/map-types';

// Component to show hover/active block information
export function HoverInfo({
  pixelCoords,
  blockInfo,
  visible,
  isActive,
  mapOrigin,
  activeBlockCoords,
}: HoverInfoProps) {
  // Determine which coordinates to use for display: snapped active or raw hover
  const displayCoords = isActive && activeBlockCoords ? activeBlockCoords : pixelCoords;

  if (!visible || !displayCoords || !mapOrigin) return null;

  // Calculate actual block coordinates using map origin and the chosen display coordinates
  const actualBlockX = Math.floor(mapOrigin.x + displayCoords.x / COORDINATE_SCALE);
  const actualBlockZ = Math.floor(mapOrigin.z + displayCoords.z / COORDINATE_SCALE);

  // Calculate actual chunk coordinates using actual block coordinates
  const actualChunkX = Math.floor(actualBlockX / CHUNK_SIZE);
  const actualChunkZ = Math.floor(actualBlockZ / CHUNK_SIZE);

  // Use 'Unknown' if active but no info yet (should be quick now)
  const blockName = blockInfo?.type ?? (isActive ? 'Unknown' : 'Unknown');
  const blockId = blockInfo?.minecraft_id;
  const blockColor = blockInfo?.hex;

  return (
    <div className="absolute bottom-4 left-4 bg-card border shadow-md p-3 rounded-md z-[1000] text-sm max-w-xs">
      <div className="font-semibold mb-1">{isActive ? 'Selected Block' : 'Cursor Position'}</div>
      {/* Display ACTUAL Block Coordinates */}
      <div className="flex gap-2">
        <span className="text-muted-foreground">Block X:</span> {actualBlockX}
        <span className="text-muted-foreground ml-2">Block Z:</span> {actualBlockZ}
      </div>
      {/* Display ACTUAL Chunk Coordinates */}
      <div className="flex gap-2 mt-1">
        <span className="text-muted-foreground">Chunk X:</span> {actualChunkX}
        <span className="text-muted-foreground ml-2">Chunk Z:</span> {actualChunkZ}
      </div>
      {/* Display Block Type/Name - Show only when active */}
      {isActive && blockInfo && (
        <div className="mt-2 pt-2 border-t">
          <div className="font-semibold mb-1">Block Details</div>
          <div className="flex items-center gap-2 mb-1">
            {blockColor && (
              <div
                className="w-4 h-4 rounded-sm border border-foreground/20"
                style={{ backgroundColor: blockColor }}
                title={`Color: ${blockColor}`}
              ></div>
            )}
            <span>{blockName}</span>
          </div>
          {blockId && (
            <div className="text-xs text-muted-foreground">
              ID: <span className="font-mono">{blockId}</span>
            </div>
          )}
        </div>
      )}
      {/* Show basic hover coords even if block details aren't shown */}
      {!isActive && pixelCoords && (
        <div className="mt-1 text-xs text-muted-foreground">Zoom in to select blocks</div>
      )}
    </div>
  );
}
