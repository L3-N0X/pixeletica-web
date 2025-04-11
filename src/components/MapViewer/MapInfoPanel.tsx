import React, { useState } from 'react';
import { Pane, Card, Heading, Text, Badge, Button, IconButton } from 'evergreen-ui';
import { ChunkCoord } from '../../types/mapTypes';
import BookmarkPanel from './BookmarkPanel';

// ...existing props and component code...

const MapInfoPanel = ({ mapId, metadata, selectedBlockId, selectedChunk }) => {
  // Add state for bookmark panel
  const [isBookmarkPanelOpen, setIsBookmarkPanelOpen] = useState(false);

  // ...existing component code...

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

      {/* ...existing panel content... */}

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
