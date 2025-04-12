import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Box, Spinner, IconButton } from '@chakra-ui/react';
import { MapViewState } from '../../types/mapTypes';
import { useMapUrlState } from '../../hooks/useMapUrlState';
import MapTileLayer from './MapTileLayer.tsx';
import GridOverlay from './GridOverlay';
import { getMapMetadata } from '../../services/mapService';
import { Tooltip } from '../ui/tooltip.tsx';
import { LuBookmark, LuGrid2X2, LuRepeat, LuShare, LuZoomIn, LuZoomOut } from 'react-icons/lu';
import MapInfoBox from './MapInfoPanel.tsx';
import SharePanel from './SharePanel.tsx';

const MapViewer = () => {
  const { mapId } = useParams<{ mapId: string }>();
  const [metadata, setMetadata] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBlockGrid, setShowBlockGrid] = useState(true);
  const [showChunkGrid, setShowChunkGrid] = useState(true);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  // Default map state
  const defaultState: MapViewState = {
    x: 0,
    y: 0,
    zoom: 1,
    isLoading: true,
  };

  // Use URL state management
  const { getInitialState, updateUrlFromState, getShareableUrl } = useMapUrlState({
    mapId: mapId || '',
    defaultState,
  });

  // Current view state
  const [viewState, setViewState] = useState<MapViewState>(getInitialState());

  // Share Boxl state
  const [isSharePanelOpen, setIsShareBoxOpen] = useState(false);

  // Update the viewport size when the component mounts or window resizes
  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    updateViewportSize();

    // Add resize listener
    window.addEventListener('resize', updateViewportSize);

    // Clean up
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  // Load map metadata
  useEffect(() => {
    if (!mapId) return;

    setIsLoading(true);
    getMapMetadata(mapId)
      .then((data) => {
        setMetadata(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(`Failed to load map data: ${err.message}`);
        setIsLoading(false);
      });
  }, [mapId]);

  // Handle view state changes
  const handleViewStateChange = useCallback(
    (newState: Partial<MapViewState>) => {
      setViewState((prevState) => {
        const updatedState = { ...prevState, ...newState };
        // Update URL with new state (debounced)
        updateUrlFromState(updatedState);
        return updatedState;
      });
    },
    [updateUrlFromState]
  );

  // Handle transform changes (from react-zoom-pan-pinch)
  const handleTransformChange = useCallback(
    ({ state }: any) => {
      handleViewStateChange({
        x: state.positionX,
        y: state.positionY,
        zoom: state.scale,
      });
    },
    [handleViewStateChange]
  );

  // Handle block selection
  const handleBlockSelect = useCallback(
    (blockId: string) => {
      handleViewStateChange({ selectedBlockId: blockId });
    },
    [handleViewStateChange]
  );

  // Handle chunk selection
  const handleChunkSelect = useCallback(
    (x: number, z: number) => {
      handleViewStateChange({ selectedChunk: { x, z } });
    },
    [handleViewStateChange]
  );

  // Open share Boxl
  const handleOpenShareBoxl = useCallback(() => {
    setIsShareBoxOpen(true);
  }, []);

  // Copy share URL to clipboard
  const handleCopyShareUrl = useCallback(() => {
    const url = getShareableUrl(viewState);
    navigator.clipboard.writeText(url);
  }, [getShareableUrl, viewState]);

  // Bookmark current view
  const handleBookmarkView = useCallback(() => {
    if (!mapId) return;

    const url = getShareableUrl(viewState);
    const name = prompt('Enter a name for this bookmark:');
    if (!name) return;

    // Save bookmark to local storage
    const bookmarks = JSON.parse(localStorage.getItem('mapBookmarks') || '{}');
    if (!bookmarks[mapId]) bookmarks[mapId] = [];

    bookmarks[mapId].push({
      name,
      url,
      date: new Date().toISOString(),
      state: {
        x: viewState.x,
        y: viewState.y,
        zoom: viewState.zoom,
        selectedBlockId: viewState.selectedBlockId,
        selectedChunk: viewState.selectedChunk,
      },
    });

    localStorage.setItem('mapBookmarks', JSON.stringify(bookmarks));
  }, [getShareableUrl, mapId, viewState]);

  // Reset view to initial position
  const handleResetView = useCallback(() => {
    handleViewStateChange({
      x: 0,
      y: 0,
      zoom: 1,
      selectedBlockId: undefined,
      selectedChunk: undefined,
    });
  }, [handleViewStateChange]);

  // Toggle grid visibility
  const handleToggleBlockGrid = () => setShowBlockGrid((prev) => !prev);
  const handleToggleChunkGrid = () => setShowChunkGrid((prev) => !prev);

  if (error) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
        <div>{error}</div>
      </Box>
    );
  }

  return (
    <Box height="100%" position="relative">
      {isLoading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={100}
          backgroundColor="rgba(0,0,0,0.5)"
        >
          <Spinner />
        </Box>
      )}

      <TransformWrapper
        initialScale={viewState.zoom}
        initialPositionX={viewState.x}
        initialPositionY={viewState.y}
        onTransformed={handleTransformChange}
        limitToBounds={false}
        minScale={0.1}
        maxScale={10}
      >
        {({ zoomIn, zoomOut }) => (
          <>
            <TransformComponent>
              {metadata && (
                <>
                  <MapTileLayer
                    mapId={mapId || ''}
                    metadata={metadata}
                    zoom={viewState.zoom}
                    onBlockSelect={handleBlockSelect}
                    selectedBlockId={viewState.selectedBlockId}
                  />
                  <GridOverlay
                    width={viewportSize.width}
                    height={viewportSize.height}
                    scale={viewState.zoom}
                    position={{ x: viewState.x, y: viewState.y }}
                    metadata={metadata}
                    showBlockGrid={showBlockGrid}
                    showChunkGrid={showChunkGrid}
                    onChunkSelect={handleChunkSelect}
                    selectedChunk={viewState.selectedChunk}
                  />
                </>
              )}
            </TransformComponent>

            {/* Controls */}
            <Box position="absolute" bottom={16} right={16} display="flex" flexDirection="column">
              <Tooltip content="Zoom In">
                <IconButton appearance="minimal" onClick={() => zoomIn()} marginBottom={8}>
                  <LuZoomIn size={24} color="white" />
                </IconButton>
              </Tooltip>
              <Tooltip content="Zoom Out">
                <IconButton appearance="minimal" onClick={() => zoomOut()} marginBottom={8}>
                  <LuZoomOut size={24} color="white" />
                </IconButton>
              </Tooltip>
              <Tooltip content="Reset View">
                <IconButton appearance="minimal" onClick={handleResetView} marginBottom={8}>
                  <LuRepeat size={24} color="white" />
                </IconButton>
              </Tooltip>
              <Tooltip content="Share This View">
                <IconButton appearance="minimal" onClick={handleOpenShareBoxl} marginBottom={8}>
                  <LuShare size={24} color="white" />
                </IconButton>
              </Tooltip>
              <Tooltip content="Bookmark This View">
                <IconButton appearance="minimal" onClick={handleBookmarkView}>
                  <LuBookmark size={24} color="white" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Grid controls */}
            <Box
              position="absolute"
              bottom={16}
              left={16}
              display="flex"
              gap={8}
              background="rgba(23, 29, 37, 0.85)"
              padding={8}
              borderRadius={8}
            >
              <Tooltip content="Toggle Block Grid">
                <IconButton
                  appearance={showBlockGrid ? 'primary' : 'default'}
                  onClick={handleToggleBlockGrid}
                >
                  <LuGrid2X2 size={24} color="white" />
                </IconButton>
              </Tooltip>
              <Tooltip content="Toggle Chunk Grid">
                <IconButton
                  appearance={showChunkGrid ? 'primary' : 'default'}
                  onClick={handleToggleChunkGrid}
                >
                  <LuGrid2X2 size={24} color="white" style={{ transform: 'rotate(45deg)' }} />
                </IconButton>
              </Tooltip>
            </Box>
          </>
        )}
      </TransformWrapper>

      {/* Info Boxl */}
      <MapInfoBox
        mapId={mapId || ''}
        metadata={metadata}
        selectedBlockId={viewState.selectedBlockId}
        selectedChunk={viewState.selectedChunk}
      />

      {/* Share Boxl */}
      <SharePanel
        isOpen={isSharePanelOpen}
        onClose={() => setIsShareBoxOpen(false)}
        shareUrl={getShareableUrl(viewState)}
        onCopy={handleCopyShareUrl}
      />
    </Box>
  );
};

export default MapViewer;
