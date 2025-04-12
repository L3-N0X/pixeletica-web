import React, { useState } from 'react';
import { Box, Card, Heading, Text, Badge, IconButton } from '@chakra-ui/react';
import { ChunkCoord } from '../../types/mapTypes';
import { MapMetadata } from '../../hooks/useMapMetadata';
import BookmarkBox from './BookmarkPanel';
import { LuBookmark } from 'react-icons/lu';

interface MapInfoPanelProps {
  mapId: string;
  metadata: MapMetadata | null;
  selectedBlockId?: string;
  selectedChunk?: ChunkCoord;
}

const MapInfoBox: React.FC<MapInfoPanelProps> = ({
  mapId,
  metadata,
  selectedBlockId,
  selectedChunk,
}) => {
  const [isBookmarkBoxOpen, setIsBookmarkBoxOpen] = useState(false);

  // Helper function to get properties safely
  const getSafeProperty = (obj: any, property: string, defaultValue: any = undefined) => {
    return obj && obj[property] !== undefined ? obj[property] : defaultValue;
  };

  return (
    <Card.Root
      position="absolute"
      top={16}
      left={16}
      width={320}
      padding={16}
      background="rgba(23, 29, 37, 0.85)"
      backdropFilter="blur(10px)"
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom={16}>
        <Heading size="xl" color="white">
          Map Information
        </Heading>
        <IconButton
          appearance="minimal"
          onClick={() => setIsBookmarkBoxOpen(true)}
          title="View bookmarks"
        >
          <LuBookmark size={24} color="white" />
        </IconButton>
      </Box>

      {/* Map metadata */}
      {metadata && (
        <Box>
          <Heading size="md" marginBottom={8}>
            {getSafeProperty(metadata, 'displayName', 'Untitled Map')}
          </Heading>

          {getSafeProperty(metadata, 'description') && (
            <Text color="muted" marginBottom={16}>
              {metadata.description}
            </Text>
          )}

          <Box marginBottom={16}>
            <Badge color="blue" marginRight={8}>
              Size: {metadata.width}x{metadata.height}
            </Badge>
          </Box>
        </Box>
      )}

      {/* Selected block info */}
      {selectedBlockId && metadata?.blocks && metadata.blocks[selectedBlockId] && (
        <Box marginTop={16} padding={12} background="rgba(255,255,255,0.1)" borderRadius={4}>
          <Heading size="md" marginBottom={8}>
            Selected Block
          </Heading>
          <Text>{getSafeProperty(metadata.blocks[selectedBlockId], 'name', 'Unknown Block')}</Text>
          <Badge marginTop={8} color="neutral">
            {selectedBlockId}
          </Badge>
        </Box>
      )}

      {/* Selected chunk info */}
      {selectedChunk && (
        <Box marginTop={16} padding={12} background="rgba(255,255,255,0.1)" borderRadius={4}>
          <Heading size="md" marginBottom={8}>
            Selected Chunk
          </Heading>
          <Text>
            Chunk: {selectedChunk.x}, {selectedChunk.z}
          </Text>
        </Box>
      )}

      {/* Bookmark Boxl */}
      <BookmarkBox
        isOpen={isBookmarkBoxOpen}
        onClose={() => setIsBookmarkBoxOpen(false)}
        mapId={mapId}
      />
    </Card.Root>
  );
};

export default MapInfoBox;
