import { useState } from 'react';
import { toaster } from 'evergreen-ui';
import { conversionApi } from '../services/api';

interface UseFileDownloadReturn {
  downloadFile: (taskId: string, fileId: string, filename?: string) => Promise<void>;
  downloadMultipleFiles: (taskId: string, fileIds: string[]) => Promise<void>;
  downloadAllFiles: (taskId: string) => void;
  isDownloading: boolean;
}

/**
 * Hook to handle file downloads from the conversion API
 */
export function useFileDownload(): UseFileDownloadReturn {
  const [isDownloading, setIsDownloading] = useState(false);

  /**
   * Download a single file
   */
  const downloadFile = async (taskId: string, fileId: string, filename?: string) => {
    setIsDownloading(true);
    try {
      // For single file downloads, we use a direct link
      const url = conversionApi.getFileUrl(taskId, fileId);
      const link = document.createElement('a');
      link.href = url;
      if (filename) {
        link.download = filename;
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toaster.success('File download started');
    } catch (error) {
      console.error('Failed to download file:', error);
      toaster.danger('Failed to download the file');
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Download multiple files as a ZIP archive
   */
  const downloadMultipleFiles = async (taskId: string, fileIds: string[]) => {
    setIsDownloading(true);
    try {
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

      toaster.success(`Downloaded ${fileIds.length} files as ZIP`);
    } catch (error) {
      console.error('Failed to download multiple files:', error);
      toaster.danger('Failed to download files');
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Download all files for a task
   */
  const downloadAllFiles = (taskId: string) => {
    setIsDownloading(true);
    try {
      // For all files, we use the direct download URL
      window.open(conversionApi.getAllFilesZipUrl(taskId), '_blank');
      toaster.success('Download of all files started');
    } catch (error) {
      console.error('Failed to download all files:', error);
      toaster.danger('Failed to download files');
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    downloadFile,
    downloadMultipleFiles,
    downloadAllFiles,
    isDownloading,
  };
}

export default useFileDownload;
