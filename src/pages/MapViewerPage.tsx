import React, { useState, useEffect } from 'react';
import { Pane, Heading, Spinner } from 'evergreen-ui';
import { useParams } from 'react-router-dom';
import PixelArtViewer from '@components/PixelArtViewer';
import DetailsPanel from '@components/DetailsPanel';
import { getMapMetadata } from '@services/mapService';
import type { PixelArtMetadata, BlockDetails } from '@/types';

const MapViewerPage: React.FC = () => {
  const { mapName } = useParams<{ mapName: string }>();
  const [metadata, setMetadata] = useState<PixelArtMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<BlockDetails | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!mapName) return;

      try {
        setLoading(true);
        const data = await getMapMetadata(mapName);
        setMetadata(data);
      } catch (err) {
        setError('Failed to load map metadata. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [mapName]);

  const handleBlockSelect = (block: BlockDetails | null) => {
    setSelectedBlock(block);
  };

  if (loading) {
    return (
      <Pane display="flex" alignItems="center" justifyContent="center" height="100%">
        <Spinner />
      </Pane>
    );
  }

  if (error || !mapName || !metadata) {
    return (
      <Pane>
        <Heading size={700} marginBottom={16}>
          Error
        </Heading>
        <Pane backgroundColor="#2e2e2e" padding={16} borderRadius={4}>
          <p>{error || 'Invalid map name or metadata not available.'}</p>
        </Pane>
      </Pane>
    );
  }

  return (
    <Pane display="flex" flexDirection="column" height="100%">
      <Heading size={700} marginBottom={16}>
        {metadata.displayName}
      </Heading>

      <Pane display="flex" flex={1} height="calc(100% - 40px)">
        <Pane flex={1} height="100%" position="relative">
          <PixelArtViewer metadata={metadata} mapName={mapName} onBlockSelect={handleBlockSelect} />
        </Pane>

        {selectedBlock && (
          <DetailsPanel block={selectedBlock} onClose={() => setSelectedBlock(null)} />
        )}
      </Pane>
    </Pane>
  );
};

export default MapViewerPage;
