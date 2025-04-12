import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Pane,
  Heading,
  Text,
  Button,
  Spinner,
  Alert,
  Card,
  TabNavigation,
  Tab,
  IconButton,
  toaster,
  SideSheet,
  Position,
} from 'evergreen-ui';
import { conversionApi } from '../services/api';
import { TaskResponse, TaskStatus, FileInfo } from '../types/api';
import FileCategoryGroup from '../components/FileCategoryGroup';
import DownloadPanel from '../components/DownloadPanel';
import FilePreview from '../components/FilePreview';

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
        toaster.notify('Conversion cancelled successfully');
        navigate('/');
      } catch (err) {
        console.error('Failed to cancel task:', err);
        setError('Failed to cancel conversion. Please try again.');
        toaster.danger('Failed to cancel conversion');
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
      <Pane>
        <Alert intent="danger" title="Invalid Task ID">
          No task ID was provided.
        </Alert>
      </Pane>
    );
  }

  return (
    <Pane maxWidth={1000} marginX="auto">
      <Heading size={700} marginBottom={8}>
        Conversion Status
      </Heading>
      <Text size={400} color="muted" marginBottom={24}>
        Task ID: {taskId}
      </Text>

      {loading && !task ? (
        <Pane display="flex" alignItems="center" justifyContent="center" height={200}>
          <Spinner />
        </Pane>
      ) : error ? (
        <Alert intent="danger" title="Error" marginBottom={16}>
          {error}
        </Alert>
      ) : task ? (
        <Pane>
          {/* Status Display */}
          <Card
            elevation={1}
            background="tint2"
            padding={16}
            marginBottom={24}
            display="flex"
            flexDirection="column"
            gap={16}
          >
            <Pane display="flex" alignItems="center">
              <Heading size={500}>Status: </Heading>
              <Text
                color={getStatusProps(task.status).color}
                size={500}
                marginLeft={8}
                fontWeight={500}
              >
                {getStatusProps(task.status).label}
              </Text>

              {task.status === 'processing' && <Spinner size={16} marginLeft={8} />}
            </Pane>

            {task.status === 'processing' && (
              <Pane>
                <Text size={300} marginBottom={8}>
                  Progress: {task.progress != null ? `${task.progress}%` : 'Initializing...'}
                </Text>
                <Pane
                  width="100%"
                  height={8}
                  borderRadius={4}
                  background="tint1"
                  position="relative"
                  overflow="hidden"
                >
                  <Pane
                    position="absolute"
                    top={0}
                    left={0}
                    height="100%"
                    width={task.progress != null ? `${task.progress}%` : '0%'}
                    background="blue"
                    borderRadius={4}
                    transition="width 0.3s ease"
                  />
                </Pane>
              </Pane>
            )}

            {task.status === 'failed' && task.error && (
              <Alert intent="danger" title="Conversion Failed">
                {task.error}
              </Alert>
            )}

            {task.timestamp && (
              <Text size={300} color="muted">
                Last updated: {new Date(task.timestamp).toLocaleString()}
              </Text>
            )}
          </Card>

          {/* Completed Task Actions */}
          {task.status === 'completed' && (
            <Pane marginBottom={24}>
              <Heading size={500} marginBottom={16}>
                Conversion Completed
              </Heading>

              {files.length > 0 ? (
                <>
                  <Pane marginBottom={24}>
                    <Text>
                      Your pixel art has been successfully converted! You can now view it in the
                      interactive map viewer or download the generated files.
                    </Text>
                  </Pane>

                  <Pane display="flex" gap={16} marginBottom={24}>
                    <Button
                      appearance="primary"
                      intent="success"
                      iconBefore="map"
                      as={Link}
                      to={`/map/${taskId}`}
                    >
                      View in Map
                    </Button>

                    <Button
                      appearance="default"
                      iconBefore="download"
                      is="a"
                      href={conversionApi.getAllFilesZipUrl(taskId)}
                      target="_blank"
                    >
                      Download All Files
                    </Button>

                    {previewableFile && (
                      <Button
                        appearance="default"
                        iconBefore="eye-open"
                        onClick={() => {
                          setPreviewFile(previewableFile);
                          setPreviewSidesheet(true);
                        }}
                      >
                        Quick Preview
                      </Button>
                    )}
                  </Pane>

                  {/* File Browsing Tabs */}
                  <TabNavigation marginBottom={16}>
                    <Tab
                      id="files"
                      isSelected={selectedTab === 'files'}
                      onSelect={() => setSelectedTab('files')}
                    >
                      Files
                    </Tab>
                    <Tab
                      id="preview"
                      isSelected={selectedTab === 'preview'}
                      onSelect={() => setSelectedTab('preview')}
                      disabled={!previewableFile}
                    >
                      Preview
                    </Tab>
                  </TabNavigation>

                  {/* Files Tab Content */}
                  {selectedTab === 'files' && (
                    <Pane position="relative">
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
                    </Pane>
                  )}

                  {/* Preview Tab Content */}
                  {selectedTab === 'preview' && previewableFile && (
                    <Card
                      elevation={1}
                      background="tint2"
                      padding={16}
                      marginY={16}
                      height="600px"
                      display="flex"
                      flexDirection="column"
                    >
                      <Pane marginBottom={16} display="flex" alignItems="center">
                        <Heading size={500}>{previewableFile.filename}</Heading>
                        <Pane flex={1} />
                        <Button
                          iconBefore="download"
                          appearance="minimal"
                          is="a"
                          href={conversionApi.getFileUrl(taskId ?? '', previewableFile.fileId)}
                          target="_blank"
                          download
                        >
                          Download
                        </Button>
                      </Pane>
                      <Pane flex={1} position="relative">
                        <FilePreview file={previewableFile} taskId={taskId ?? ''} />
                      </Pane>
                    </Card>
                  )}
                </>
              ) : (
                <Text>No files were generated. Please try again with different settings.</Text>
              )}
            </Pane>
          )}

          {/* Cancel Button (only for in-progress tasks) */}
          {(task.status === 'queued' || task.status === 'processing') && (
            <Button intent="danger" onClick={handleCancel}>
              Cancel Conversion
            </Button>
          )}

          {/* Return Home Button */}
          {(task.status === 'completed' || task.status === 'failed') && (
            <Button as={Link} to="/" marginTop={16}>
              Return to Home
            </Button>
          )}
        </Pane>
      ) : (
        <Alert intent="warning" title="Not Found">
          Task not found. It may have been deleted or the ID is incorrect.
        </Alert>
      )}

      {/* Large Preview Side Sheet */}
      {previewFile && (
        <SideSheet
          position={Position.RIGHT}
          isShown={previewSidesheet}
          onCloseComplete={() => {
            setPreviewSidesheet(false);
            setPreviewFile(null);
          }}
          width="80%"
          preventBodyScrolling
        >
          <Pane padding={16}>
            <Pane display="flex" alignItems="center" marginBottom={16}>
              <IconButton
                icon="arrow-left"
                marginRight={16}
                onClick={() => {
                  setPreviewSidesheet(false);
                  setPreviewFile(null);
                }}
              />
              <Heading size={600}>{previewFile.filename}</Heading>
              <Pane flex={1} />
              <Button
                iconBefore="download"
                appearance="primary"
                is="a"
                href={conversionApi.getFileUrl(taskId ?? '', previewFile.fileId)}
                target="_blank"
                download
              >
                Download
              </Button>
            </Pane>

            <Pane height="calc(100vh - 120px)">
              <FilePreview file={previewFile} taskId={taskId ?? ''} />
            </Pane>
          </Pane>
        </SideSheet>
      )}
    </Pane>
  );
};

export default StatusPage;
