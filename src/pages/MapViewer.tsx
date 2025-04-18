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
  GridIcon,
  InfoCircledIcon,
  MinusIcon,
  PlusIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

// Types for map components
interface PixelCoords {
  x: number;
  z: number;
}

interface BlockInfo {
  type: string;
}

interface HoverInfoProps {
  pixelCoords: PixelCoords | null;
  blockInfo: BlockInfo | null;
  chunkCoords: { x: number; z: number } | null;
  visible: boolean;
  isActive: boolean;
}

interface GridOverlayProps {
  showGrid: boolean;
  gridSize?: number;
}

interface TileLayerManagerProps {
  mapId: string;
  mapData: MapMetadata;
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

// Custom component to show hover information
function HoverInfo({ pixelCoords, blockInfo, chunkCoords, visible, isActive }: HoverInfoProps) {
  if (!visible || !pixelCoords) return null;

  return (
    <div className="absolute bottom-4 left-4 bg-card border shadow-md p-3 rounded-md z-[1000] text-sm">
      <div className="font-semibold mb-1">{isActive ? 'Active Block' : 'Cursor Position'}</div>
      <div className="flex gap-2">
        <span className="text-muted-foreground">Block X:</span> {pixelCoords.x}
        <span className="text-muted-foreground ml-2">Block Z:</span> {pixelCoords.z}
      </div>
      {chunkCoords && (
        <div className="flex gap-2 mt-1">
          <span className="text-muted-foreground">Chunk X:</span> {chunkCoords.x}
          <span className="text-muted-foreground ml-2">Chunk Z:</span> {chunkCoords.z}
        </div>
      )}
      {blockInfo && (
        <div className="mt-2">
          <div className="font-semibold mb-1">Block</div>
          <div className="flex gap-2">
            <span>{blockInfo.type || 'Unknown'}</span>
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
      const zoom = map.getZoom();
      const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
      const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());

      // Calculate grid spacing in pixels at current zoom
      const start = map.layerPointToLatLng([0, 0]);
      const end = map.layerPointToLatLng([gridSize, gridSize]);
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

  return null;
}

/**
 * Custom component to handle tile loading based on new zoom_levels structure.
 * For each zoom level, overlays the correct tiles as images.
 */
function TileLayerManager({ mapId, mapData }: TileLayerManagerProps) {
  if (!mapId || !mapData) return null;

  const baseUrl = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || '/api';
  const tileSize = mapData.tileSize || 256;
  const minZoom = mapData.minZoom ?? 0;
  const maxZoom = mapData.maxZoom ?? 10;

  // Compute bounds for the highest zoom level (full map area)
  let bounds: [[number, number], [number, number]] = [
    [0, 0],
    [mapData.height, mapData.width],
  ];

  // If zoomLevels info is available, use it to set bounds for each zoom level
  if (mapData.zoomLevels && Array.isArray(mapData.zoomLevels)) {
    const zl =
      mapData.zoomLevels.find(
        (z: any) => z.zoomLevel === maxZoom || z.zoomLevel === mapData.maxZoom
      ) || mapData.zoomLevels[mapData.zoomLevels.length - 1];
    if (zl) {
      const width = zl.tiles_x * tileSize;
      const height = zl.tiles_z * tileSize;
      bounds = [
        [0, 0],
        [height, width],
      ];
    }
  }

  const urlTemplate = `${baseUrl}/map/${mapId}/tiles/{z}/{x}/{y}.png`;

  return (
    <TileLayer
      url={urlTemplate}
      tileSize={tileSize}
      minZoom={minZoom}
      maxZoom={maxZoom}
      bounds={bounds}
      noWrap={true}
      className="pixelated-image"
    />
  );
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
  const [activeBlock, setActiveBlock] = useState<PixelCoords | null>(null);

  // Calculate the bounds based on the image dimensions
  // Moved up to ensure hooks are called unconditionally
  const bounds = useMemo<L.LatLngBoundsLiteral>(() => {
    if (!mapData)
      return [
        [0, 0],
        [100, 100], // Default bounds if mapData is not yet loaded
      ];
    return [
      [0, 0],
      [mapData.height, mapData.width],
    ];
  }, [mapData]);

  // Define the CRS (Coordinate Reference System) that matches our pixel coordinates
  // Moved up to ensure hooks are called unconditionally
  const pixelCRS = useMemo(() => {
    return L.CRS.Simple;
  }, []);

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveBlock(null)}
                className="flex items-center gap-2"
                disabled={!activeBlock}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-[600px] relative">
          {mapData ? (
            <div className="w-full h-[600px] rounded-md overflow-hidden relative">
              <MapContainer
                bounds={bounds}
                // @ts-ignore - react-leaflet types don't include CRS but the prop works
                crs={pixelCRS}
                minZoom={0}
                maxZoom={10}
                zoom={4}
                zoomSnap={0.25}
                zoomDelta={0.25}
                wheelPxPerZoomLevel={40}
                scrollWheelZoom={true}
                wheelDebounceTime={0}
                attributionControl={false}
                className="w-full h-full"
                zoomControl={false}
                center={[0, 0]}
              >
                <ZoomListener />
                <TileLayerManager mapId={taskId!} mapData={mapData} />
                <GridOverlay showGrid={showBlockGrid} gridSize={16} />
                <GridOverlay showGrid={showChunkGrid} gridSize={256} />
                <MouseTracker
                  onMouseMove={(coords) => setHoverCoords(coords)}
                  onClick={(coords) => setActiveBlock(coords)}
                  zoomLevel={zoomLevel}
                  minActiveZoom={mapData ? mapData.maxZoom - 1 : 0}
                />
                <div className="leaflet-top leaflet-right">
                  <div className="leaflet-control leaflet-bar">
                    <ZoomInButton />
                    <ZoomOutButton />
                  </div>
                </div>
              </MapContainer>
              <HoverInfo
                pixelCoords={
                  activeBlock ?? hoverCoords
                    ? {
                        x: Math.floor((activeBlock ?? hoverCoords)!.x / 16),
                        z: Math.floor((activeBlock ?? hoverCoords)!.z / 16),
                      }
                    : null
                }
                blockInfo={activeBlock ?? hoverCoords ? { type: 'Minecraft Block' } : null}
                chunkCoords={
                  activeBlock ?? hoverCoords
                    ? {
                        x: Math.floor((activeBlock ?? hoverCoords)!.x / 256),
                        z: Math.floor((activeBlock ?? hoverCoords)!.z / 256),
                      }
                    : null
                }
                visible={showInfo}
                isActive={!!activeBlock}
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
