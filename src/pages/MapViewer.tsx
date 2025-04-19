import { getMapMetadata, MapMetadata, getMapBlockData } from '@/api/maps';
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
  Cross1Icon,
  GridIcon,
  InfoCircledIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMemo, useState, useEffect } from 'react';
import { MapContainer, Rectangle } from 'react-leaflet';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

// Import constants
import { BLOCK_SIZE, COORDINATE_SCALE } from '@/constants/map-constants';

// Import types
import { PixelCoords, BlockInfo } from '@/types/map-types';

// Import hooks
import { useZoomLevel } from '@/hooks/useZoomLevel';

// Import components
import { BoundedTileLayerComponent } from '@/components/map/BoundedTileLayer';
import { GridOverlay } from '@/components/map/GridOverlay';
import { HoverInfo } from '@/components/map/HoverInfo';
import { MouseTracker } from '@/components/map/MouseTracker';
import { ZoomInButton, ZoomOutButton } from '@/components/map/ZoomControls';

// Import utilities
import { getBlockInfoFromData } from '@/utils/map-utils';

// Main MapViewer component
export default function MapViewer() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapData, setMapData] = useState<MapMetadata | null>(null);
  const [blockData, setBlockData] = useState<any | null>(null); // State for block data

  // All hooks must be called before any early return!
  const { zoomLevel, ZoomListener } = useZoomLevel(0);
  const [showBlockGrid, setShowBlockGrid] = useState(false);
  const [showChunkGrid, setShowChunkGrid] = useState(true); // Set to true by default
  const [showInfo, setShowInfo] = useState(true);
  const [hoverCoords, setHoverCoords] = useState<PixelCoords | null>(null);
  const [activeBlockCoords, setActiveBlockCoords] = useState<PixelCoords | null>(null);
  const [selectedRawCoords, setSelectedRawCoords] = useState<PixelCoords | null>(null);
  const [activeBlockInfo, setActiveBlockInfo] = useState<BlockInfo | null>(null);

  // Modifier for Rectangle highlight to account for the scaling
  const blockSize = COORDINATE_SCALE;

  // Calculate map dimensions in blocks rather than pixels
  const mapDimensionsInBlocks = useMemo(() => {
    if (!mapData) return { width: 0, height: 0 };

    const widthInBlocks = mapData.width / BLOCK_SIZE;
    const heightInBlocks = mapData.height / BLOCK_SIZE;

    return { width: widthInBlocks, height: heightInBlocks };
  }, [mapData]);

  // Calculate the bounds based on the image dimensions in blocks
  const bounds = useMemo<L.LatLngBoundsLiteral>(() => {
    if (!mapData) {
      return [
        [0, 0],
        [10, 10],
      ];
    }

    // Convert pixel dimensions to block dimensions
    const widthInBlocks = mapDimensionsInBlocks.width;
    const heightInBlocks = mapDimensionsInBlocks.height;

    // For Leaflet with CRS.Simple, coordinates are [lat, lng] which map to [y, x]
    return [
      [0, 0], // Top-left corner in block coordinates
      [heightInBlocks, widthInBlocks], // Bottom-right corner in block coordinates
    ];
  }, [mapData, mapDimensionsInBlocks]);

  // Define the CRS (Coordinate Reference System) that matches our block coordinates
  const pixelCRS = useMemo(() => {
    return L.CRS.Simple;
  }, []);

  // Handle block click - Uses the raw block coordinates
  const handleBlockClick = (clickedCoords: PixelCoords | null) => {
    if (clickedCoords && mapData) {
      // deselect on same click
      if (
        activeBlockCoords &&
        activeBlockCoords.x === clickedCoords.x &&
        activeBlockCoords.z === clickedCoords.z
      ) {
        setActiveBlockCoords(null);
        setActiveBlockInfo(null);
        setSelectedRawCoords(null);
      } else {
        // compute world‐pixel coords by adding origin offset
        const worldX = clickedCoords.x + mapData.origin_x * COORDINATE_SCALE;
        const worldZ = clickedCoords.z + mapData.origin_z * COORDINATE_SCALE;

        // select and fetch info using world coords
        setSelectedRawCoords(clickedCoords);
        setActiveBlockCoords(clickedCoords);
        const info = getBlockInfoFromData(worldX, worldZ, blockData, mapData);
        setActiveBlockInfo(info);

        if (!info) {
          const actualBlockX = Math.floor(worldX / COORDINATE_SCALE);
          const actualBlockZ = Math.floor(worldZ / COORDINATE_SCALE);
          toast.warning(`No block data found for coordinates (${actualBlockX}, ${actualBlockZ})`);
        }
      }
    } else {
      // clear on outside click or low zoom
      setActiveBlockCoords(null);
      setActiveBlockInfo(null);
      setSelectedRawCoords(null);
    }
  };

  // Handle clearing the selection via button
  const clearSelection = () => {
    setActiveBlockCoords(null);
    setActiveBlockInfo(null);
    setSelectedRawCoords(null);
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
        setMapData(metadata);
        setLoading(false);
      } catch (err) {
        console.error('Error loading map data:', err);
        toast.error('Failed to load map data');
        setError('Failed to load map data');
        setLoading(false);
      }
    };

    const loadBlockData = async () => {
      if (!taskId) return;
      try {
        const data = await getMapBlockData(taskId);
        setBlockData(data);
      } catch (err) {
        console.error('Error fetching block data:', err);
        toast.error('Failed to load block data');
      }
    };

    loadMapData().then(() => {
      loadBlockData();
    });
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

  // Calculate proper center and initial zoom
  const centerPoint = mapData
    ? [mapDimensionsInBlocks.height / 2, mapDimensionsInBlocks.width / 2]
    : [0, 0];

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
                onClick={clearSelection}
                className="flex items-center gap-2"
                disabled={!activeBlockCoords}
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
                key={taskId}
                crs={pixelCRS}
                center={centerPoint as [number, number]}
                zoom={mapData.minZoom ?? 0}
                minZoom={mapData.minZoom ?? 0}
                maxZoom={mapData.maxZoom ?? 10}
                zoomSnap={1}
                zoomDelta={1}
                wheelPxPerZoomLevel={60}
                scrollWheelZoom={true}
                attributionControl={false}
                className="w-full h-full bg-muted"
                zoomControl={false}
                maxBoundsViscosity={1.0}
                bounds={bounds}
              >
                <ZoomListener />
                <BoundedTileLayerComponent
                  mapId={taskId!}
                  metadata={mapData}
                  layerName={mapData.name || 'Map Layer'}
                />

                {/* Block grid (1x1 block) */}
                {showBlockGrid && (
                  <GridOverlay
                    showGrid={showBlockGrid}
                    gridSize={1}
                    originX={mapData.origin_x}
                    originZ={mapData.origin_z}
                  />
                )}

                {/* Chunk grid (16x16 blocks) */}
                {showChunkGrid && (
                  <GridOverlay
                    showGrid={showChunkGrid}
                    gridSize={16}
                    originX={mapData.origin_x}
                    originZ={mapData.origin_z}
                  />
                )}

                {/* Highlight for the selected block with proper scaling */}
                {activeBlockCoords && (
                  <Rectangle
                    bounds={[
                      [activeBlockCoords.z, activeBlockCoords.x],
                      [activeBlockCoords.z + blockSize, activeBlockCoords.x + blockSize],
                    ]}
                    pathOptions={{ color: 'yellow', weight: 2, fillOpacity: 0.1 }}
                  />
                )}

                <MouseTracker
                  onMouseMove={setHoverCoords}
                  onClick={handleBlockClick}
                  zoomLevel={zoomLevel}
                  minActiveZoom={mapData ? mapData.maxZoom - 2 : 0}
                />

                <div className="leaflet-top leaflet-right z-[1000]">
                  <div className="leaflet-control leaflet-bar flex flex-col">
                    <ZoomInButton />
                    <ZoomOutButton />
                  </div>
                </div>
              </MapContainer>

              <HoverInfo
                pixelCoords={selectedRawCoords ?? hoverCoords}
                blockInfo={activeBlockCoords ? activeBlockInfo : null}
                visible={showInfo}
                isActive={!!activeBlockCoords}
                mapOrigin={mapData ? { x: mapData.origin_x, z: mapData.origin_z } : { x: 0, z: 0 }}
                activeBlockCoords={activeBlockCoords}
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
                Dimensions: {mapDimensionsInBlocks.width} × {mapDimensionsInBlocks.height} blocks |
                Zoom: {zoomLevel}/{mapData.maxZoom}
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
