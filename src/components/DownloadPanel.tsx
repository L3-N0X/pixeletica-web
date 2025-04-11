import React, { useState } from 'react';
import {
  Pane,
  Card,
  Heading,
  Button,
  IconButton,
  Text,
  toaster,
  Badge,
  Spinner,
} from 'evergreen-ui';
import { FileInfo } from '../types/api';
import { conversionApi } from '../services/api';

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
        const response = await conversionApi.downloadSelectedFiles(taskId, { fileIds });

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

      toaster.success(`Download initiated for ${selectedFiles.size} file(s)`);
    } catch (error) {
      console.error('Download failed:', error);
      toaster.danger('Failed to download files');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card
      position="sticky"
      bottom={0}
      left={0}
      right={0}
      elevation={3}
      background="tint2"
      padding={16}
      display="flex"
      alignItems="center"
      zIndex={10}
      border="1px solid"
      borderColor="default"
    >
      <Pane>
        <Heading size={400}>
          {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
        </Heading>
        <Text size={300} color="muted">
          Total size: {formattedTotalSize}
        </Text>
      </Pane>

      <Pane flex={1} />

      <Button appearance="minimal" onClick={onClearSelection}>
        Clear Selection
      </Button>

      <Button
        appearance="primary"
        intent="success"
        iconBefore={downloading ? undefined : 'download'}
        marginLeft={8}
        onClick={downloadSelectedFiles}
        disabled={downloading}
      >
        {downloading ? <Spinner size={16} /> : 'Download Selected'}
      </Button>
    </Card>
  );
};

export default DownloadPanel;
