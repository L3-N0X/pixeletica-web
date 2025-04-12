import React from 'react';
import { Dialog, Pane, TextInput, IconButton, Text, Heading, toaster } from 'evergreen-ui';

interface SharePanelProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  onCopy: () => void;
}

const SharePanel: React.FC<SharePanelProps> = ({ isOpen, onClose, shareUrl, onCopy }) => {
  const handleCopyClick = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        onCopy();
      })
      .catch((err) => {
        console.error('Failed to copy URL:', err);
        toaster.danger('Failed to copy URL to clipboard');
      });
  };

  return (
    <Dialog
      isShown={isOpen}
      title="Share this map view"
      onCloseComplete={onClose}
      hasFooter={false}
      width={450}
    >
      <Pane>
        <Heading size={500} marginBottom={8}>
          Share a link to this exact view
        </Heading>
        <Text size={400} marginBottom={16}>
          Others can view the map exactly as you're seeing it now.
        </Text>

        <Pane display="flex" marginTop={16}>
          <TextInput value={shareUrl} readOnly width="100%" marginRight={8} />
          <IconButton
            icon="clipboard"
            appearance="primary"
            onClick={handleCopyClick}
            title="Copy to clipboard"
          />
        </Pane>
      </Pane>
    </Dialog>
  );
};

export default SharePanel;
