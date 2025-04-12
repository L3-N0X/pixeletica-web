import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heading,
  Text,
  Spinner,
  Alert,
  Card,
  Tabs,
  IconButton,
  Link as RouterLink,
  Box,
  Drawer,
  Portal,
  CloseButton,
} from '@chakra-ui/react';
import { conversionApi } from '../services/api';
import { TaskResponse, TaskStatus, FileInfo } from '../types/api';
import FileCategoryGroup from '../components/FileCategoryGroup';
import DownloadPanel from '../components/DownloadPanel';
import FilePreview from '../components/FilePreview';
import { toaster } from '@/components/ui/toaster';
import { LuDownload, LuEye, LuHouse, LuMap, LuX } from 'react-icons/lu';

const POLLING_INTERVAL = 2000; // 2 seconds

const StatusPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<TaskResponse | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingTimeout, setPollingTimeout] = useState<number | null>(null);

  // UI States
  const [selectedTab, setSelectedTab] = useState<'files' | 'preview'>('files');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [previewSidesheet, setPreviewSidesheet] = useState<boolean>(false);
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);

  // Fetch task status
  const fetchStatus = async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      const response = await conversionApi.getConversionStatus(taskId);
      setTask(response);
      setError(null);

      // If task is completed, fetch files
      if (response.status === 'completed') {
        const filesResponse = await conversionApi.listFiles(taskId);
        setFiles(filesResponse.files);
      }
    } catch (err) {
      console.error('Failed to fetch task status:', err);
      setError('Failed to load task status. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Setup polling for task status
  useEffect(() => {
    // First fetch
    fetchStatus();

    // Setup polling if task is not completed or failed
    const pollStatus = () => {
      if (!task || (task.status !== 'completed' && task.status !== 'failed')) {
        const timeoutId = window.setTimeout(async () => {
          await fetchStatus();
          pollStatus();
        }, POLLING_INTERVAL);

        setPollingTimeout(timeoutId);
      }
    };

    pollStatus();

    // Cleanup
    return () => {
      if (pollingTimeout !== null) {
        clearTimeout(pollingTimeout);
      }
    };
  }, [taskId, task?.status]);

  // Handle task cancellation
  const handleCancel = async () => {
    if (!taskId) return;

    if (window.confirm('Are you sure you want to cancel this conversion?')) {
      try {
        await conversionApi.deleteConversion(taskId);
        toaster.create({
          title: 'Conversion cancelled successfully',
          type: 'success',
        });

        navigate('/');
      } catch (err) {
        console.error('Failed to cancel task:', err);
        setError('Failed to cancel conversion. Please try again.');
        toaster.create({
          title: 'Failed to cancel conversion',
          type: 'error',
        });
      }
    }
  };

  // File selection handlers
  const handleSelectFile = (fileId: string, selected: boolean) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(fileId);
      } else {
        newSet.delete(fileId);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedFiles(new Set());
  };

  // Group files by category
  const filesByCategory = useMemo(() => {
    const groups: Record<string, FileInfo[]> = {};

    files.forEach((file) => {
      if (!groups[file.category]) {
        groups[file.category] = [];
      }
      groups[file.category].push(file);
    });

    return groups;
  }, [files]);

  // Find a representative file for the preview tab
  const previewableFile = useMemo(() => {
    // First try to find a rendered PNG image
    const rendered = files.find(
      (file) => file.category === 'rendered' && file.type === 'image/png'
    );
    if (rendered) return rendered;

    // Then try for a dithered image
    const dithered = files.find(
      (file) => file.category === 'dithered' && file.type.startsWith('image/')
    );
    if (dithered) return dithered;

    // Then try HTML preview
    const html = files.find((file) => file.type === 'text/html');
    if (html) return html;

    // Default to first image file
    return files.find((file) => file.type.startsWith('image/'));
  }, [files]);

  // Get status UI properties
  const getStatusProps = (status: TaskStatus) => {
    switch (status) {
      case 'queued':
        return { label: 'Queued', color: 'blue' };
      case 'processing':
        return { label: 'Processing', color: 'orange' };
      case 'completed':
        return { label: 'Completed', color: 'green' };
      case 'failed':
        return { label: 'Failed', color: 'red' };
      default:
        return { label: 'Unknown', color: 'gray' };
    }
  };

  if (!taskId) {
    return (
      <Box>
        <Alert.Root title="Invalid Task ID">No task ID was provided.</Alert.Root>
      </Box>
    );
  }

  return (
    <Box maxWidth={1000} marginX="auto">
      <Heading size="md" marginBottom={8}>
        Conversion Status
      </Heading>
      <Text fontSize="md" color="muted" marginBottom={24}>
        Task ID: {taskId}
      </Text>

      {loading && !task ? (
        <Box display="flex" alignItems="center" justifyContent="center" height={200}>
          <Spinner />
        </Box>
      ) : error ? (
        <Alert.Root title="Error" marginBottom={16}>
          {error}
        </Alert.Root>
      ) : task ? (
        <Box>
          {/* Status Display */}
          <Card.Root
            background="tint2"
            padding={16}
            marginBottom={24}
            display="flex"
            flexDirection="column"
            gap={16}
          >
            <Box display="flex" alignItems="center">
              <Heading size="md">Status: </Heading>
              <Text
                color={getStatusProps(task.status).color}
                fontSize="md"
                marginLeft={8}
                fontWeight={500}
              >
                {getStatusProps(task.status).label}
              </Text>

              {task.status === 'processing' && <Spinner size="md" marginLeft={8} />}
            </Box>

            {task.status === 'processing' && (
              <Box>
                <Text fontSize="md" marginBottom={8}>
                  Progress: {task.progress != null ? `${task.progress}%` : 'Initializing...'}
                </Text>
                <Box
                  width="100%"
                  height={8}
                  borderRadius={4}
                  background="tint1"
                  position="relative"
                  overflow="hidden"
                >
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    height="100%"
                    width={task.progress != null ? `${task.progress}%` : '0%'}
                    background="blue"
                    borderRadius={4}
                    transition="width 0.3s ease"
                  />
                </Box>
              </Box>
            )}

            {task.status === 'failed' && task.error && (
              <Alert.Root title="Conversion Failed">{task.error}</Alert.Root>
            )}

            {task.timestamp && (
              <Text fontSize="sm" color="muted">
                Last updated: {new Date(task.timestamp).toLocaleString()}
              </Text>
            )}
          </Card.Root>

          {/* Completed Task Actions */}
          {task.status === 'completed' && (
            <Box marginBottom={24}>
              <Heading size="md" marginBottom={16}>
                Conversion Completed
              </Heading>

              {files.length > 0 ? (
                <>
                  <Box marginBottom={24}>
                    <Text>
                      Your pixel art has been successfully converted! You can now view it in the
                      interactive map viewer or download the generated files.
                    </Text>
                  </Box>

                  <Box display="flex" gap={16} marginBottom={24}>
                    <RouterLink href={`/map/${taskId}`}>
                      <IconButton appearance="primary" as={Link}>
                        <LuMap size={20} />
                        View in Map
                      </IconButton>
                    </RouterLink>

                    <RouterLink href={`/map/${taskId}`}>
                      <IconButton appearance="primary" marginRight={8}>
                        <LuDownload size={20} />
                        Download All Files
                      </IconButton>
                    </RouterLink>

                    {previewableFile && (
                      <IconButton
                        appearance="default"
                        onClick={() => {
                          setPreviewFile(previewableFile);
                          setPreviewSidesheet(true);
                        }}
                      >
                        <LuEye size={20} />
                        Quick Preview
                      </IconButton>
                    )}
                  </Box>

                  {/* File Browsing Tabs */}
                  <Tabs.Root marginBottom={16}>
                    <Tabs.Trigger id="files" value="files" onSelect={() => setSelectedTab('files')}>
                      Files
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      id="preview"
                      value="preview"
                      onSelect={() => setSelectedTab('preview')}
                      disabled={!previewableFile}
                    >
                      Preview
                    </Tabs.Trigger>
                  </Tabs.Root>

                  {/* Files Tab Content */}
                  {selectedTab === 'files' && (
                    <Box position="relative">
                      {/* Organized File Categories */}
                      {Object.entries(filesByCategory)
                        .sort(([categoryA], [categoryB]) => {
                          // Sort categories in a specific order
                          const order = ['rendered', 'dithered', 'web', 'schematic'];
                          const indexA = order.indexOf(categoryA);
                          const indexB = order.indexOf(categoryB);
                          return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
                        })
                        .map(([category, categoryFiles]) => (
                          <FileCategoryGroup
                            key={category}
                            title={category.charAt(0).toUpperCase() + category.slice(1)}
                            files={categoryFiles}
                            taskId={taskId ?? ''}
                            onSelectFile={handleSelectFile}
                            selectedFiles={selectedFiles}
                            expandedByDefault={category === 'rendered'}
                          />
                        ))}

                      {/* Download Selection Panel */}
                      <DownloadPanel
                        taskId={taskId ?? ''}
                        selectedFiles={selectedFiles}
                        allFiles={files}
                        onClearSelection={clearSelection}
                      />
                    </Box>
                  )}

                  {/* Preview Tab Content */}
                  {selectedTab === 'preview' && previewableFile && (
                    <Card.Root
                      background="tint2"
                      padding={16}
                      marginY={16}
                      height="600px"
                      display="flex"
                      flexDirection="column"
                    >
                      <Box marginBottom={16} display="flex" alignItems="center">
                        <Heading size="lg">{previewableFile.filename}</Heading>
                        <Box flex={1} />
                        <RouterLink
                          href={conversionApi.getFileUrl(taskId ?? '', previewableFile.fileId)}
                        >
                          <IconButton appearance="minimal">Download</IconButton>
                        </RouterLink>
                      </Box>
                      <Box flex={1} position="relative">
                        <FilePreview file={previewableFile} taskId={taskId ?? ''} />
                      </Box>
                    </Card.Root>
                  )}
                </>
              ) : (
                <Text>No files were generated. Please try again with different settings.</Text>
              )}
            </Box>
          )}

          {/* Cancel Button (only for in-progress tasks) */}
          {(task.status === 'queued' || task.status === 'processing') && (
            <IconButton onClick={handleCancel}>
              <LuX size={20} />
              Cancel Conversion
            </IconButton>
          )}

          {/* Return Home Button */}
          {(task.status === 'completed' || task.status === 'failed') && (
            <RouterLink href="/">
              <IconButton appearance="primary" marginTop={16}>
                <LuHouse size={20} />
                Return to Home
              </IconButton>
            </RouterLink>
          )}
        </Box>
      ) : (
        <Alert.Root title="Not Found">
          Task not found. It may have been deleted or the ID is incorrect.
        </Alert.Root>
      )}

      <Drawer.Root
        open={previewSidesheet}
        onOpenChange={(e) => {
          setPreviewSidesheet(e.open);
          if (!e.open) setPreviewFile(null);
        }}
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>{previewFile?.filename}</Drawer.Title>
                <RouterLink
                  href={
                    previewFile ? conversionApi.getFileUrl(taskId ?? '', previewFile.fileId) : '#'
                  }
                >
                  <IconButton appearance="primary" is="a">
                    <LuDownload size={20} />
                    Download
                  </IconButton>
                </RouterLink>
              </Drawer.Header>
              <Drawer.Body>
                {previewFile && (
                  <Box height="calc(100vh - 200px)">
                    <FilePreview file={previewFile} taskId={taskId ?? ''} />
                  </Box>
                )}
              </Drawer.Body>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top={4} right={4} />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Box>
  );
};

export default StatusPage;
