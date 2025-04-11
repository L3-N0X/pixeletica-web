import React from 'react';
import { Dialog, TextInputField, Button, Pane, Text } from 'evergreen-ui';

interface SharePanelProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  onCopy: () => void;
}

const SharePanel: React.FC<SharePanelProps> = ({ isOpen, onClose, shareUrl, onCopy }) => {
  return (
    <Dialog
      isShown={isOpen}
      title="Share This View"
      onCloseComplete={onClose}
      confirmLabel="Copy to Clipboard"
      onConfirm={onCopy}
      cancelLabel="Close"
    >
      <Pane>
        <Text>
          Share this exact view with others. The URL includes the current position, zoom level, and
          selected elements.
        </Text>

        <TextInputField
          label="Shareable URL"
          value={shareUrl}
          readOnly
          width="100%"
          marginTop={16}
          onClick={(e: React.MouseEvent<HTMLInputElement>) => {
            (e.target as HTMLInputElement).select();
          }}
        />

        <Text size={300} marginTop={8}>
          You can also bookmark this view using the bookmark button in the map controls.
        </Text>
      </Pane>
    </Dialog>
  );
};

export default SharePanel;
