import React from 'react';
import { Box, IconButton, Checkbox, Card } from '@chakra-ui/react';
import { Tooltip } from '../ui/tooltip';
import { LuCopy, LuRepeat, LuZoomIn, LuZoomOut } from 'react-icons/lu';

interface ControlPanelProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onCopyLink: () => void;
  showBlockGrid: boolean;
  showChunkGrid: boolean;
  onToggleBlockGrid: () => void;
  onToggleChunkGrid: () => void;
  currentZoom: number;
  maxZoom: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onCopyLink,
  showBlockGrid,
  showChunkGrid,
  onToggleBlockGrid,
  onToggleChunkGrid,
  currentZoom,
  maxZoom,
}) => {
  return (
    <Card.Root
      position="absolute"
      bottom={16}
      left="50%"
      transform="translateX(-50%)"
      background="tint2"
      padding={8}
      display="flex"
      alignItems="center"
      borderRadius={8}
    >
      <Tooltip content="Zoom In">
        <IconButton marginRight={8} onClick={onZoomIn} disabled={currentZoom >= maxZoom}>
          <LuZoomIn size={24} />
        </IconButton>
      </Tooltip>

      <Tooltip content="Zoom Out">
        <IconButton marginRight={8} onClick={onZoomOut}>
          <LuZoomOut size={24} />
        </IconButton>
      </Tooltip>

      <Tooltip content="Reset View">
        <IconButton marginRight={16} onClick={onReset}>
          <LuRepeat size={24} />
        </IconButton>
      </Tooltip>

      <Box borderLeft="1px solid" borderColor="muted" height={24} marginRight={16} />

      <Checkbox.Root checked={showBlockGrid} onChange={onToggleBlockGrid} marginRight={8} />

      <Checkbox.Root checked={showChunkGrid} onChange={onToggleChunkGrid} marginRight={16} />

      <Box borderLeft="1px solid" borderColor="muted" height={24} marginRight={16} />

      <Tooltip content="Copy Shareable Link">
        <IconButton onClick={onCopyLink}>
          <LuCopy size={24} />
          Share
        </IconButton>
      </Tooltip>
    </Card.Root>
  );
};

export default ControlPanel;
