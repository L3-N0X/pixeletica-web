import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Pane, Spinner, Tooltip, IconButton, toaster } from 'evergreen-ui';
import { MapViewState } from '../../types/mapTypes';
import { useMapUrlState } from '../../hooks/useMapUrlState';
import MapTileLayer from './MapTileLayer.tsx';
import GridOverlay from './GridOverlay';
import MapInfoPanel from './MapInfoPanel';
import SharePanel from './SharePanel';
import { getMapMetadata } from '../../services/mapService';

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

  // Share panel state
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);

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

  // Open share panel
  const handleOpenSharePanel = useCallback(() => {
    setIsSharePanelOpen(true);
  }, []);

  // Copy share URL to clipboard
  const handleCopyShareUrl = useCallback(() => {
    const url = getShareableUrl(viewState);
    navigator.clipboard.writeText(url);
    toaster.success('Share URL copied to clipboard!');
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
    toaster.success('Bookmark saved!');
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
      <Pane display="flex" alignItems="center" justifyContent="center" height="100vh">
        <div>{error}</div>
      </Pane>
    );
  }

  return (
    <Pane height="100%" position="relative">
      {isLoading && (
        <Pane
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
        </Pane>
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
            <Pane position="absolute" bottom={16} right={16} display="flex" flexDirection="column">
              <Tooltip content="Zoom In">
                <IconButton
                  icon="zoom-in"
                  appearance="minimal"
                  onClick={() => zoomIn()}
                  marginBottom={8}
                />
              </Tooltip>
              <Tooltip content="Zoom Out">
                <IconButton
                  icon="zoom-out"
                  appearance="minimal"
                  onClick={() => zoomOut()}
                  marginBottom={8}
                />
              </Tooltip>
              <Tooltip content="Reset View">
                <IconButton
                  icon="home"
                  appearance="minimal"
                  onClick={handleResetView}
                  marginBottom={8}
                />
              </Tooltip>
              <Tooltip content="Share This View">
                <IconButton
                  icon="share"
                  appearance="minimal"
                  onClick={handleOpenSharePanel}
                  marginBottom={8}
                />
              </Tooltip>
              <Tooltip content="Bookmark This View">
                <IconButton icon="bookmark" appearance="minimal" onClick={handleBookmarkView} />
              </Tooltip>
            </Pane>

            {/* Grid controls */}
            <Pane
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
                  icon="grid-view"
                  appearance={showBlockGrid ? 'primary' : 'default'}
                  onClick={handleToggleBlockGrid}
                />
              </Tooltip>
              <Tooltip content="Toggle Chunk Grid">
                <IconButton
                  icon="grid-view"
                  intent="danger"
                  appearance={showChunkGrid ? 'primary' : 'default'}
                  onClick={handleToggleChunkGrid}
                />
              </Tooltip>
            </Pane>
          </>
        )}
      </TransformWrapper>

      {/* Info Panel */}
      <MapInfoPanel
        mapId={mapId || ''}
        metadata={metadata}
        selectedBlockId={viewState.selectedBlockId}
        selectedChunk={viewState.selectedChunk}
      />

      {/* Share Panel */}
      <SharePanel
        isOpen={isSharePanelOpen}
        onClose={() => setIsSharePanelOpen(false)}
        shareUrl={getShareableUrl(viewState)}
        onCopy={handleCopyShareUrl}
      />
    </Pane>
  );
};

export default MapViewer;
