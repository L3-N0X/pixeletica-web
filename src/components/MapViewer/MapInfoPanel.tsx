import React, { useState } from 'react';
import { Pane, Card, Heading, Text, Badge, IconButton } from 'evergreen-ui';
import { ChunkCoord } from '../../types/mapTypes';
import BookmarkPanel from './BookmarkPanel';
import { MapMetadata } from '../../hooks/useMapMetadata';

interface MapInfoPanelProps {
  mapId: string;
  metadata: MapMetadata | null;
  selectedBlockId?: string;
  selectedChunk?: ChunkCoord;
}

const MapInfoPanel: React.FC<MapInfoPanelProps> = ({
  mapId,
  metadata,
  selectedBlockId,
  selectedChunk,
}) => {
  const [isBookmarkPanelOpen, setIsBookmarkPanelOpen] = useState(false);

  // Helper function to get properties safely
  const getSafeProperty = (obj: any, property: string, defaultValue: any = undefined) => {
    return obj && obj[property] !== undefined ? obj[property] : defaultValue;
  };

  return (
    <Card
      elevation={2}
      position="absolute"
      top={16}
      left={16}
      width={320}
      padding={16}
      background="rgba(23, 29, 37, 0.85)"
      backdropFilter="blur(10px)"
    >
      <Pane display="flex" alignItems="center" justifyContent="space-between" marginBottom={16}>
        <Heading size={600} color="white">
          Map Information
        </Heading>
        <IconButton
          icon="bookmark"
          appearance="minimal"
          onClick={() => setIsBookmarkPanelOpen(true)}
          title="View bookmarks"
        />
      </Pane>

      {/* Map metadata */}
      {metadata && (
        <Pane>
          <Heading size={500} marginBottom={8}>
            {getSafeProperty(metadata, 'displayName', 'Untitled Map')}
          </Heading>

          {getSafeProperty(metadata, 'description') && (
            <Text color="muted" marginBottom={16}>
              {metadata.description}
            </Text>
          )}

          <Pane marginBottom={16}>
            <Badge color="blue" marginRight={8}>
              Size: {metadata.width}x{metadata.height}
            </Badge>
          </Pane>
        </Pane>
      )}

      {/* Selected block info */}
      {selectedBlockId && metadata?.blocks && metadata.blocks[selectedBlockId] && (
        <Pane marginTop={16} padding={12} background="rgba(255,255,255,0.1)" borderRadius={4}>
          <Heading size={400} marginBottom={8}>
            Selected Block
          </Heading>
          <Text>{getSafeProperty(metadata.blocks[selectedBlockId], 'name', 'Unknown Block')}</Text>
          <Badge marginTop={8} color="neutral">
            {selectedBlockId}
          </Badge>
        </Pane>
      )}

      {/* Selected chunk info */}
      {selectedChunk && (
        <Pane marginTop={16} padding={12} background="rgba(255,255,255,0.1)" borderRadius={4}>
          <Heading size={400} marginBottom={8}>
            Selected Chunk
          </Heading>
          <Text>
            Chunk: {selectedChunk.x}, {selectedChunk.z}
          </Text>
        </Pane>
      )}

      {/* Bookmark Panel */}
      <BookmarkPanel
        isOpen={isBookmarkPanelOpen}
        onClose={() => setIsBookmarkPanelOpen(false)}
        mapId={mapId}
      />
    </Card>
  );
};

export default MapInfoPanel;
