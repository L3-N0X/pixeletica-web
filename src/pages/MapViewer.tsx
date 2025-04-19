import { getMapMetadata, MapMetadata } from '@/api/maps';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { H1, P } from '@/components/ui/typography';
import {
  ArrowLeftIcon,
  Cross1Icon, // Import Cross1Icon for the clear button
  GridIcon,
  InfoCircledIcon,
  MinusIcon,
  PlusIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useState } from 'react';
// Removed unused LayersControl, ZoomControl
import { MapContainer, Rectangle, useMap, useMapEvents } from 'react-leaflet';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

// Types for map components
interface PixelCoords {
  x: number;
  z: number;
}

// Keep BlockInfo simple for now, expand if needed
interface BlockInfo {
  type: string;
  // Add other properties like biome, light level etc. if available from API
}

interface HoverInfoProps {
  pixelCoords: PixelCoords | null; // Coordinates being hovered or clicked
  blockInfo: BlockInfo | null; // Info for the hovered/clicked block
  chunkCoords: { x: number; z: number } | null; // Chunk coords for display
  visible: boolean; // Whether the info box should be shown
  isActive: boolean; // True if a block is actively selected (clicked)
}

interface GridOverlayProps {
  showGrid: boolean;
  gridSize?: number;
}

// Updated MouseTrackerProps to support click
interface MouseTrackerProps {
  onMouseMove: (coords: PixelCoords | null) => void;
  onClick: (coords: PixelCoords | null) => void;
}

// Custom hook for tracking the current zoom level
function useZoomLevel(initialZoom = 0) {
  const [zoomLevel, setZoomLevel] = useState(initialZoom);

  const ZoomListener = () => {
    const map = useMap();

    useMapEvents({
      zoomend: () => {
        setZoomLevel(map.getZoom());
      },
    });

    return null;
  };

  return { zoomLevel, ZoomListener };
}

// NEW: BoundedTileLayer as a Component
interface BoundedTileLayerProps {
  mapId: string;
  metadata: MapMetadata;
  layerName?: string;
}

function BoundedTileLayerComponent({
  mapId,
  metadata,
  layerName = 'Minecraft Map',
}: BoundedTileLayerProps) {
  const map = useMap();
  const baseUrl = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || '/api';

  useEffect(() => {
    if (!metadata || !mapId || !map) return; // Ensure map instance is available

    // Define the getTileUrl function directly
    const getTileUrl = (coords: L.Coords): string => {
      const zoom = coords.z;
      const zoomLevelData = metadata.zoomLevels?.find((zl) => zl.zoomLevel === zoom);
      const tilesX = zoomLevelData?.tiles_x ?? 1;
      const tilesZ = zoomLevelData?.tiles_z ?? 1;
      const maxTileX = tilesX - 1;
      const maxTileY = tilesZ - 1;

      if (coords.x < 0 || coords.y < 0 || coords.x > maxTileX || coords.y > maxTileY) {
        console.debug(
          `Tile out of bounds: z=${zoom}, x=${coords.x}, y=${coords.y}. Max: x=${maxTileX}, y=${maxTileY}`
        );
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      }

      const tileUrl = `${baseUrl}/map/${mapId}/tiles/${zoom}/${coords.x}/${coords.y}.${
        metadata.tileFormat || 'png'
      }`;
      console.debug(`[TileLayer] Requesting tile: ${tileUrl}`);
      return tileUrl;
    };

    // Create the instance using L.TileLayer directly with the custom getTileUrl
    // Pass an empty string initially for the URL template, as getTileUrl overrides it.
    const tileLayer = new L.TileLayer('', {
      attribution: `© ${layerName}`,
      maxZoom: metadata.maxZoom ?? 10,
      minZoom: metadata.minZoom ?? 0,
      noWrap: true,
      tileSize: metadata.tileSize,
      className: 'pixelated-image',
      // getTileUrl cannot be passed in options
    });

    // Assign the custom getTileUrl function AFTER creating the instance
    tileLayer.getTileUrl = getTileUrl;

    // Add using whenReady, checking for the tile pane
    map.whenReady(() => {
      // Check map instance and specifically if the tile pane exists
      const tilePane = map.getPane('tilePane');
      if (map && typeof map.addLayer === 'function' && tilePane) {
        console.log('Map is ready and tilePane exists, adding tile layer...');
        tileLayer.addTo(map);
      } else {
        console.error(
          'Map or tilePane unavailable when trying to add layer. Map:',
          !!map,
          'addLayer:',
          typeof map?.addLayer,
          'tilePane:',
          !!tilePane
        );
      }
    });

    // Cleanup
    return () => {
      // Check map instance and if layer exists before removing
      if (map && typeof map.removeLayer === 'function' && map.hasLayer(tileLayer)) {
        console.log('Removing tile layer from component...');
        map.removeLayer(tileLayer);
      }
    };
    // Dependencies: map instance, metadata, mapId, layerName, baseUrl
  }, [map, mapId, metadata, layerName, baseUrl]);

  return null; // This component doesn't render anything itself
}

// MapSetup component is no longer needed as BoundedTileLayerComponent handles the layer.
// const MapSetup = ({ metadata }: { metadata: MapMetadata }) => { ... }; // Removed

// Custom component to show hover/active block information
function HoverInfo({ pixelCoords, blockInfo, chunkCoords, visible, isActive }: HoverInfoProps) {
  if (!visible || !pixelCoords) return null;

  const blockName = blockInfo?.type ?? (isActive ? 'Loading...' : 'Unknown');

  return (
    <div className="absolute bottom-4 left-4 bg-card border shadow-md p-3 rounded-md z-[1000] text-sm max-w-xs">
      <div className="font-semibold mb-1">{isActive ? 'Selected Block' : 'Cursor Position'}</div>
      {/* Display Block Coordinates */}
      <div className="flex gap-2">
        <span className="text-muted-foreground">Block X:</span> {pixelCoords.x}
        <span className="text-muted-foreground ml-2">Block Z:</span> {pixelCoords.z}
      </div>
      {/* Display Chunk Coordinates */}
      {chunkCoords && (
        <div className="flex gap-2 mt-1">
          <span className="text-muted-foreground">Chunk X:</span> {chunkCoords.x}
          <span className="text-muted-foreground ml-2">Chunk Z:</span> {chunkCoords.z}
        </div>
      )}
      {/* Display Block Type/Name */}
      {/* Only show block type if hovering at high zoom or if a block is active */}
      {(isActive || blockInfo) && (
        <div className="mt-2 pt-2 border-t">
          <div className="font-semibold mb-1">Block Type</div>
          <div className="flex gap-2">
            <span>{blockName}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom grid overlay component using Canvas for better performance and scaling
function GridOverlay({ showGrid, gridSize = 16 }: GridOverlayProps) {
  const map = useMap();

  useEffect(() => {
    if (!showGrid) return;

    // Create a canvas overlay for the grid
    const canvas = L.DomUtil.create('canvas', 'leaflet-grid-canvas') as HTMLCanvasElement;
    const overlay = L.DomUtil.create('div', 'leaflet-grid-overlay');
    overlay.appendChild(canvas);

    const updateGrid = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bounds = map.getBounds();
      // Removed unused variables: zoom, topLeft, bottomRight

      // Calculate grid spacing in pixels at current zoom
      // Use L.point() to potentially fix type error
      const start = map.layerPointToLatLng(L.point(0, 0));
      const end = map.layerPointToLatLng(L.point(gridSize, gridSize));
      const deltaLng = Math.abs(end.lng - start.lng);
      const deltaLat = Math.abs(end.lat - start.lat);

      // Draw vertical lines
      for (
        let lng = Math.floor(bounds.getWest() / deltaLng) * deltaLng;
        lng < bounds.getEast();
        lng += deltaLng
      ) {
        const p1 = map.latLngToContainerPoint([bounds.getNorth(), lng]);
        const p2 = map.latLngToContainerPoint([bounds.getSouth(), lng]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw horizontal lines
      for (
        let lat = Math.floor(bounds.getSouth() / deltaLat) * deltaLat;
        lat < bounds.getNorth();
        lat += deltaLat
      ) {
        const p1 = map.latLngToContainerPoint([lat, bounds.getWest()]);
        const p2 = map.latLngToContainerPoint([lat, bounds.getEast()]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    // Add overlay to map container
    map.getContainer().appendChild(overlay);

    // Redraw grid on map events
    const redraw = () => updateGrid();
    map.on('move zoom resize', redraw);
    updateGrid();

    return () => {
      map.off('move zoom resize', redraw);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };
  }, [map, showGrid, gridSize]);

  return null; // GridOverlay must return null to be a valid component
}

// Zoom button components
function ZoomInButton() {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  return (
    <Button
      variant="default"
      size="icon"
      className="rounded-none rounded-t-md"
      onClick={handleZoomIn}
    >
      <PlusIcon className="h-4 w-4" />
    </Button>
  );
}

function ZoomOutButton() {
  const map = useMap();

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <Button
      variant="default"
      size="icon"
      className="rounded-none border-t-0 rounded-b-md"
      onClick={handleZoomOut}
    >
      <MinusIcon className="h-4 w-4" />
    </Button>
  );
}

// Custom component to track mouse position and handle clicks
function MouseTracker({
  onMouseMove,
  onClick,
  zoomLevel,
  minActiveZoom,
}: MouseTrackerProps & {
  zoomLevel: number;
  minActiveZoom: number;
}) {
  useMapEvents({
    mousemove: (e: L.LeafletMouseEvent) => {
      if (zoomLevel >= minActiveZoom) {
        const { lat, lng } = e.latlng;
        onMouseMove({ x: Math.floor(lng), z: Math.floor(lat) });
      } else {
        onMouseMove(null);
      }
    },
    mouseout: () => {
      onMouseMove(null);
    },
    click: (e: L.LeafletMouseEvent) => {
      if (zoomLevel >= minActiveZoom) {
        const { lat, lng } = e.latlng;
        onClick({ x: Math.floor(lng), z: Math.floor(lat) });
      }
    },
  });

  return null;
}

// Main MapViewer component
export default function MapViewer() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapData, setMapData] = useState<MapMetadata | null>(null);

  // All hooks must be called before any early return!
  const { zoomLevel, ZoomListener } = useZoomLevel(0);
  const [showBlockGrid, setShowBlockGrid] = useState(false);
  const [showChunkGrid, setShowChunkGrid] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [hoverCoords, setHoverCoords] = useState<PixelCoords | null>(null);
  const [activeBlockCoords, setActiveBlockCoords] = useState<PixelCoords | null>(null); // Renamed for clarity
  const [activeBlockInfo, setActiveBlockInfo] = useState<BlockInfo | null>(null); // State for active block details
  const [isFetchingBlockInfo, setIsFetchingBlockInfo] = useState(false); // Loading state for block info fetch

  // Calculate the bounds based on the image dimensions
  // Moved up to ensure hooks are called unconditionally
  const bounds = useMemo<L.LatLngBoundsLiteral>(() => {
    if (!mapData)
      return [
        [0, 0],
        [100, 0], // Default south-west [y, x]
        [0, 100], // Default north-east [y, x]
      ];
    // For CRS.Simple with top-left origin (0,0):
    // Bounds format is [[south, west], [north, east]] which translates to [[maxY, minX], [minY, maxX]]
    return [
      [mapData.height, 0], // South-West corner (max Y, min X)
      [0, mapData.width], // North-East corner (min Y, max X)
    ];
  }, [mapData]);

  // Define the CRS (Coordinate Reference System) that matches our pixel coordinates
  const pixelCRS = useMemo(() => {
    // L.CRS.Simple maps coordinates directly to pixels (lat=y, lng=x)
    // We might need transformation if the origin isn't top-left (0,0)
    // For now, assume Simple CRS works if tiles are generated accordingly.
    return L.CRS.Simple;
  }, []);

  // Placeholder for the actual API call - MUST BE REPLACED
  // Needs error handling and potentially caching
  async function fetchBlockInfo(x: number, z: number): Promise<BlockInfo | null> {
    if (!taskId) return null;
    setIsFetchingBlockInfo(true);
    try {
      // In a real scenario, this would fetch data from an endpoint like:
      // const response = await fetch(`${baseUrl}/map/${taskId}/block/${x}/${z}`); // Adjust endpoint as needed
      // if (!response.ok) throw new Error('Failed to fetch block info');
      // const data = await response.json();
      // return data;

      console.log(`Fetching block info for task ${taskId} at (${x}, ${z})`);
      // Simulate fetching data
      await new Promise((resolve) => setTimeout(resolve, 250)); // Simulate network delay
      // Return dummy data for now - REPLACE THIS
      const blockType = `Simulated Block (${x}, ${z})`; // Example name
      return { type: blockType };
    } catch (error) {
      console.error('Failed to fetch block info:', error);
      toast.error('Could not load block details.');
      return null;
    } finally {
      setIsFetchingBlockInfo(false);
    }
  }

  // Handle block click
  const handleBlockClick = async (coords: PixelCoords | null) => {
    if (coords) {
      // If clicking the same block again, deselect it
      if (
        activeBlockCoords &&
        activeBlockCoords.x === coords.x &&
        activeBlockCoords.z === coords.z
      ) {
        setActiveBlockCoords(null);
        setActiveBlockInfo(null);
      } else {
        // Select new block
        setActiveBlockCoords(coords);
        setActiveBlockInfo(null); // Clear previous info immediately
        const info = await fetchBlockInfo(coords.x, coords.z);
        // Check if the selected block is still the same after the async call
        if (
          activeBlockCoords &&
          activeBlockCoords.x === coords.x &&
          activeBlockCoords.z === coords.z
        ) {
          setActiveBlockInfo(info);
        }
      }
    } else {
      // Clicking outside map or at low zoom clears selection
      setActiveBlockCoords(null);
      setActiveBlockInfo(null);
    }
  };

  // Handle clearing the selection via button
  const clearSelection = () => {
    setActiveBlockCoords(null);
    setActiveBlockInfo(null);
  };

  useEffect(() => {
    if (!taskId) {
      setError('No task ID provided');
      setLoading(false);
      return;
    }

    // Load map metadata
    const loadMapData = async () => {
      try {
        const metadata = await getMapMetadata(taskId);
        console.log('Loaded Map Metadata:', metadata); // Log loaded metadata
        setMapData(metadata);
        setLoading(false);
      } catch (err) {
        console.error('Error loading map data:', err);
        toast.error('Failed to load map data');
        setError('Failed to load map data');
        setLoading(false);
      }
    };

    loadMapData();
  }, [taskId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading Map Viewer</CardTitle>
            <CardDescription>Preparing your map...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Optionally, set zoom level after mapData loads (if needed)
  // If you want to programmatically set zoom after loading, you can add logic here.

  // useMemo hooks moved above the early returns

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/results/${taskId}`)}
              className="rounded-full"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <H1>Map Viewer</H1>
          </div>
          <div className="space-y-1">
            <P className="text-muted-foreground">Task ID: {taskId}</P>
            {mapData && <P className="text-muted-foreground">Map: {mapData.name}</P>}
          </div>
        </div>
      </div>

      <Card className="relative">
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center">
            <div>
              <CardTitle>Map View</CardTitle>
              <CardDescription>Interactive map view of your conversion</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={showBlockGrid ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowBlockGrid(!showBlockGrid)}
                className="flex items-center gap-2"
              >
                <GridIcon className="h-4 w-4" />
                {showBlockGrid ? 'Hide Block Grid' : 'Show Block Grid'}
              </Button>
              <Button
                variant={showChunkGrid ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowChunkGrid(!showChunkGrid)}
                className="flex items-center gap-2"
              >
                <GridIcon className="h-4 w-4" />
                {showChunkGrid ? 'Hide Chunk Grid' : 'Show Chunk Grid'}
              </Button>
              <Button
                variant={showInfo ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowInfo(!showInfo)}
                className="flex items-center gap-2"
              >
                <InfoCircledIcon className="h-4 w-4" />
                {showInfo ? 'Hide Info' : 'Show Info'}
              </Button>
              {/* Updated Clear Selection Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="flex items-center gap-2"
                disabled={!activeBlockCoords || isFetchingBlockInfo} // Disable while fetching or if nothing selected
              >
                <Cross1Icon className="h-4 w-4" /> Clear Selection
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-[600px] relative">
          {mapData ? (
            <div className="w-full h-[600px] rounded-md overflow-hidden relative">
              <MapContainer
                key={taskId} // Add key to force remount if taskId changes
                // @ts-ignore - react-leaflet types might mismatch CRS prop, but it's valid Leaflet option
                crs={pixelCRS}
                bounds={bounds} // Set initial bounds - Removed duplicate
                minZoom={mapData.minZoom ?? 0} // Use metadata minZoom
                maxZoom={mapData.maxZoom ?? 10} // Use metadata maxZoom
                // Initial zoom can be set here, or let fitBounds handle it
                // zoom={mapData.minZoom ?? 0}
                zoomSnap={1} // Snap zoom to integer levels
                zoomDelta={1} // Zoom by integer levels
                wheelPxPerZoomLevel={60} // Standard Leaflet value
                scrollWheelZoom={true}
                attributionControl={false}
                className="w-full h-full bg-muted" // Added background color
                zoomControl={false} // Disable default zoom control, using custom
                maxBoundsViscosity={1.0} // Prevent dragging outside bounds
                // center={[mapData.height / 2, mapData.width / 2]} // Center initially
              >
                <ZoomListener />
                {/* Render the new BoundedTileLayerComponent directly */}
                <BoundedTileLayerComponent
                  mapId={taskId!}
                  metadata={mapData}
                  layerName={mapData.name || 'Map Layer'}
                />
                {/* MapSetup call removed */}
                <GridOverlay showGrid={showBlockGrid} gridSize={16} />
                <GridOverlay showGrid={showChunkGrid} gridSize={256} /> {/* Chunk Grid */}
                {/* Highlight for the selected block */}
                {activeBlockCoords && (
                  <Rectangle
                    // Leaflet bounds are [[south, west], [north, east]] => [[minZ, minX], [maxZ, maxX]]
                    bounds={[
                      [activeBlockCoords.z, activeBlockCoords.x], // Bottom-left corner (z, x)
                      [activeBlockCoords.z + 1, activeBlockCoords.x + 1], // Top-right corner (z+1, x+1)
                    ]}
                    pathOptions={{ color: 'yellow', weight: 2, fillOpacity: 0.1 }} // Style the highlight
                  />
                )}
                <MouseTracker
                  onMouseMove={setHoverCoords} // Pass setter directly
                  onClick={handleBlockClick} // Use the new handler
                  zoomLevel={zoomLevel}
                  minActiveZoom={mapData ? mapData.maxZoom - 2 : 0} // Allow clicking at slightly lower zoom
                />
                {/* Zoom Controls */}
                <div className="leaflet-top leaflet-right z-[1000]">
                  {' '}
                  {/* Ensure controls are on top */}
                  <div className="leaflet-control leaflet-bar flex flex-col">
                    <ZoomInButton />
                    <ZoomOutButton />
                  </div>
                </div>
              </MapContainer>
              {/* Display Hover/Active Block Info */}
              <HoverInfo
                pixelCoords={activeBlockCoords ?? hoverCoords} // Show active first, then hover
                blockInfo={activeBlockCoords ? activeBlockInfo : null} // Show active info, or null if only hovering
                chunkCoords={
                  activeBlockCoords ?? hoverCoords
                    ? {
                        x: Math.floor((activeBlockCoords ?? hoverCoords)!.x / 256), // Chunk X
                        z: Math.floor((activeBlockCoords ?? hoverCoords)!.z / 256), // Chunk Z
                      }
                    : null
                }
                visible={showInfo}
                isActive={!!activeBlockCoords} // Determine if a block is actively selected
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 bg-muted/20 rounded-md">
              <P>Loading map data...</P>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between bg-muted/10 py-3">
          <div className="text-sm text-muted-foreground">
            {mapData && (
              <>
                Dimensions: {mapData.width} × {mapData.height} pixels | Zoom: {zoomLevel}/
                {mapData.maxZoom}
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <UpdateIcon className="h-4 w-4" />
            Refresh
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
