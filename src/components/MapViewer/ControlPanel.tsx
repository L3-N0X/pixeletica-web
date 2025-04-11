import React from 'react';
import {
  Pane,
  IconButton,
  Button,
  Checkbox,
  Tooltip,
  Card,
  Position,
  ShareIcon,
  ZoomInIcon,
  ZoomOutIcon,
  ResetIcon,
} from 'evergreen-ui';

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
    <Card
      position="absolute"
      bottom={16}
      left="50%"
      transform="translateX(-50%)"
      elevation={2}
      background="tint2"
      padding={8}
      display="flex"
      alignItems="center"
      borderRadius={8}
    >
      <Tooltip content="Zoom In" position={Position.TOP}>
        <IconButton
          icon={ZoomInIcon}
          marginRight={8}
          onClick={onZoomIn}
          disabled={currentZoom >= maxZoom}
        />
      </Tooltip>

      <Tooltip content="Zoom Out" position={Position.TOP}>
        <IconButton icon={ZoomOutIcon} marginRight={8} onClick={onZoomOut} />
      </Tooltip>

      <Tooltip content="Reset View" position={Position.TOP}>
        <IconButton icon={ResetIcon} marginRight={16} onClick={onReset} />
      </Tooltip>

      <Pane borderLeft="1px solid" borderColor="muted" height={24} marginRight={16} />

      <Checkbox
        label="Block Grid"
        checked={showBlockGrid}
        onChange={onToggleBlockGrid}
        marginRight={8}
      />

      <Checkbox
        label="Chunk Grid"
        checked={showChunkGrid}
        onChange={onToggleChunkGrid}
        marginRight={16}
      />

      <Pane borderLeft="1px solid" borderColor="muted" height={24} marginRight={16} />

      <Tooltip content="Copy Shareable Link" position={Position.TOP}>
        <Button iconBefore={ShareIcon} onClick={onCopyLink}>
          Share
        </Button>
      </Tooltip>
    </Card>
  );
};

export default ControlPanel;
