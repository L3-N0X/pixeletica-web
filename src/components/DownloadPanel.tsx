import React, { useState } from 'react';
import { Card, Heading, Button, Text, Spinner, Box, IconButton } from '@chakra-ui/react';
import { FileInfo } from '../types/api';
import { conversionApi } from '../services/api';
import { LuDownload } from 'react-icons/lu';

interface DownloadPanelProps {
  taskId: string;
  selectedFiles: Set<string>;
  allFiles: FileInfo[];
  onClearSelection: () => void;
}

const DownloadPanel: React.FC<DownloadPanelProps> = ({
  taskId,
  selectedFiles,
  allFiles,
  onClearSelection,
}) => {
  const [downloading, setDownloading] = useState(false);

  // No files selected, nothing to show
  if (selectedFiles.size === 0) {
    return null;
  }

  // Calculate total selected size
  const selectedFilesList = allFiles.filter((file) => selectedFiles.has(file.fileId));
  const totalSelectedSizeBytes = selectedFilesList.reduce((sum, file) => sum + file.size, 0);
  const formattedTotalSize = formatFileSize(totalSelectedSizeBytes);

  function formatFileSize(size: number) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  // Download selected files
  const downloadSelectedFiles = async () => {
    if (selectedFiles.size === 0) return;

    try {
      setDownloading(true);

      if (selectedFiles.size === allFiles.length) {
        // Download all files with direct URL
        window.open(conversionApi.getAllFilesZipUrl(taskId), '_blank');
      } else if (selectedFiles.size === 1) {
        // For single file, download directly
        const fileId = Array.from(selectedFiles)[0];
        const file = allFiles.find((f) => f.fileId === fileId);
        if (file) {
          window.open(conversionApi.getFileUrl(taskId, fileId), '_blank');
        }
      } else {
        // For multiple selected files, use the selective download endpoint
        const fileIds = Array.from(selectedFiles);

        // For browsers that support Blob downloads
        const response = await conversionApi.downloadSelectedFiles(taskId, fileIds);

        // Create a download link
        const url = window.URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `pixeletica_${taskId}_selection.zip`);
        document.body.appendChild(link);
        link.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        link.remove();
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card.Root
      position="sticky"
      bottom={0}
      left={0}
      right={0}
      background="tint2"
      padding={16}
      display="flex"
      alignItems="center"
      zIndex={10}
      border="1px solid"
      borderColor="default"
    >
      <Box flex={1} display="flex" alignItems="center">
        <Heading size="md" marginRight={8}>
          {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
        </Heading>
        <Text fontSize="sm" color="muted">
          Total size: {formattedTotalSize}
        </Text>
      </Box>

      <Box flex={1} />

      <Button appearance="minimal" onClick={onClearSelection}>
        Clear Selection
      </Button>

      <IconButton
        appearance="primary"
        marginLeft={8}
        onClick={downloadSelectedFiles}
        disabled={downloading}
      >
        <LuDownload size={16} />
        {downloading ? <Spinner size="md" /> : 'Download Selected'}
      </IconButton>
    </Card.Root>
  );
};

export default DownloadPanel;
