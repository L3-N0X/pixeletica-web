import React from 'react';
import { Dialog, Box, Input, IconButton } from '@chakra-ui/react';
import { LuCopy } from 'react-icons/lu';

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
      });
  };

  return (
    <Dialog.Root onExitComplete={onClose} open={isOpen}>
      <Dialog.Header title="Share this view" />
      <Dialog.Content>
        <Dialog.Body>
          <Box display="flex" marginTop={16}>
            <Input value={shareUrl} readOnly width="100%" marginRight={8} />
            <IconButton appearance="primary" onClick={handleCopyClick} title="Copy to clipboard">
              <LuCopy size={16} />
            </IconButton>
          </Box>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default SharePanel;
