import React, { useState, useEffect } from 'react';
import { Box, Heading, Spinner } from '@chakra-ui/react';
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
      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
        <Spinner />
      </Box>
    );
  }

  if (error || !mapName || !metadata) {
    return (
      <Box>
        <Heading size="lg" marginBottom={16}>
          Error
        </Heading>
        <Box backgroundColor="#2e2e2e" padding={16} borderRadius={4}>
          <p>{error || 'Invalid map name or metadata not available.'}</p>
        </Box>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Heading size="md" marginBottom={16}>
        {metadata.displayName}
      </Heading>

      <Box display="flex" flex={1} height="calc(100% - 40px)">
        <Box flex={1} height="100%" position="relative">
          <PixelArtViewer metadata={metadata} mapName={mapName} onBlockSelect={handleBlockSelect} />
        </Box>

        {selectedBlock && (
          <DetailsPanel block={selectedBlock} onClose={() => setSelectedBlock(null)} />
        )}
      </Box>
    </Box>
  );
};

export default MapViewerPage;
