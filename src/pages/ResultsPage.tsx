import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Button,
  Spinner,
  Card,
  Tabs,
  Text,
  Badge,
  IconButton,
  Table,
} from '@chakra-ui/react';
import {
  getConversionStatus,
  listConversionFiles,
  getFileDownloadUrl,
  getAllFilesDownloadUrl,
  downloadSelectedFiles,
} from '@services/conversionService';
import type { TaskResponse, FileInfo } from '@/types';
import { LuDownload, LuMap } from 'react-icons/lu';
import { Tooltip } from './../components/ui/tooltip';

const ResultsPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<TaskResponse | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);

  // Tabs for different file categories
  const tabs = [
    { name: 'All Files' },
    { name: 'Rendered' },
    { name: 'Dithered' },
    { name: 'Schematic' },
    { name: 'Web' },
  ];

  useEffect(() => {
    if (!taskId) return;

    const fetchTaskStatus = async () => {
      try {
        const status = await getConversionStatus(taskId);
        setTask(status);

        // If the task is still processing, poll every 2 seconds
        if (status.status === 'processing' || status.status === 'queued') {
          const timer = setTimeout(() => fetchTaskStatus(), 2000);
          return () => clearTimeout(timer);
        }

        // If task is complete, load file list
        if (status.status === 'completed') {
          const fileList = await listConversionFiles(taskId);
          setFiles(fileList.files);
        } else if (status.status === 'failed') {
          setError(`Task failed: ${status.error || 'Unknown error'}`);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching task status:', err);
        setError('Failed to load task information. Please try again later.');
        setLoading(false);
      }
    };

    fetchTaskStatus();
  }, [taskId]);

  // Filter files based on selected tab
  const filteredFiles =
    selectedTab === 0
      ? files
      : files.filter((file) => file.category === tabs[selectedTab].name.toLowerCase());

  // Handle checkbox selection of files
  const toggleFileSelection = (fileId: string) => {
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(selectedFiles.filter((id) => id !== fileId));
    } else {
      setSelectedFiles([...selectedFiles, fileId]);
    }
  };

  // Select all visible files
  const selectAllVisible = () => {
    const visibleFileIds = filteredFiles.map((file) => file.fileId);

    if (selectedFiles.length === visibleFileIds.length) {
      // If all are selected, deselect all
      setSelectedFiles([]);
    } else {
      // Otherwise select all visible
      setSelectedFiles(visibleFileIds);
    }
  };

  // Download selected files
  const handleDownloadSelected = async () => {
    if (selectedFiles.length === 0 || !taskId) return;

    setDownloading(true);
    try {
      const blob = await downloadSelectedFiles(taskId, selectedFiles);

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pixeletica_${taskId}_selected.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading files:', err);
      setError('Failed to download files. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Render loading state
  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
        <Box textAlign="center">
          <Spinner size="lg" marginBottom={16} />
          <Heading size="md">
            {task?.status === 'processing' && 'Processing...'}
            {task?.status === 'queued' && 'Waiting in queue...'}
            {!task && 'Loading...'}
          </Heading>
          {task?.progress != null && (
            <Box marginTop={16} display="flex" flexDirection="column" alignItems="center">
              <Text>{task.progress}% complete</Text>
              <Box width={300} height={6} borderRadius={3} marginTop={8}>
                <Box height={6} width={`${task.progress}%`} borderRadius={3} />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // Render error state
  if (error || !taskId || (task && task.status === 'failed')) {
    return (
      <Box>
        <Heading size="lg" marginBottom={16}>
          Error
        </Heading>
        <Card.Root backgroundColor="#2e2e2e" padding={16} marginBottom={24}>
          <Text>{error || task?.error || 'An error occurred.'}</Text>
        </Card.Root>
        <Button appearance="primary" onClick={() => navigate('/upload')}>
          Return to Upload Page
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="lg" marginBottom={8}>
        Conversion Results
      </Heading>
      <Text marginBottom={24}>Task ID: {taskId}</Text>

      <Card.Root>
        {/* Tab navigation */}
        <Tabs.Root marginBottom={16} flexBasis={240} padding={8}>
          {tabs.map((tab, index) => (
            <Tabs.Trigger
              key={tab.name}
              id={tab.name}
              value={tab.name}
              onSelect={() => setSelectedTab(index)}
              aria-controls={`panel-${tab.name}`}
              marginRight={8}
              padding={8}
            >
              {tab.name}
              <Badge marginLeft={8} color="neutral">
                {index === 0
                  ? files.length
                  : files.filter((f) => f.category === tab.name.toLowerCase()).length}
              </Badge>
            </Tabs.Trigger>
          ))}
        </Tabs.Root>

        {/* Action buttons */}
        <Box display="flex" justifyContent="space-between" alignItems="center" padding={16}>
          <Box>
            <Button
              marginRight={8}
              onClick={selectAllVisible}
              disabled={filteredFiles.length === 0}
            >
              {selectedFiles.length === filteredFiles.length && filteredFiles.length > 0
                ? 'Deselect All'
                : 'Select All'}
            </Button>
            <Button
              appearance="primary"
              marginRight={8}
              onClick={handleDownloadSelected}
              disabled={selectedFiles.length === 0 || downloading}
            >
              <LuDownload size={16} style={{ marginRight: 4 }} />
              {downloading ? <Spinner size="sm" /> : `Download (${selectedFiles.length})`}
            </Button>
          </Box>

          <Tooltip content="Download all files as ZIP">
            <RouterLink to={getAllFilesDownloadUrl(taskId)}>
              <IconButton appearance="default" size="lg" is="a" rel="noopener noreferrer">
                <LuDownload size={16} style={{ marginRight: 4 }} />
                Download All Files
              </IconButton>
            </RouterLink>
          </Tooltip>
        </Box>

        {/* File list */}
        <Box maxHeight="60vh" overflow="auto">
          <Table.Root>
            <Table.Header>
              <Table.ColumnHeader flexBasis={30}>{/* Checkbox column */}</Table.ColumnHeader>
              <Table.ColumnHeader>Filename</Table.ColumnHeader>
              <Table.ColumnHeader>Category</Table.ColumnHeader>
              <Table.ColumnHeader>Type</Table.ColumnHeader>
              <Table.ColumnHeader>Size</Table.ColumnHeader>
              <Table.ColumnHeader flexBasis={100}>Actions</Table.ColumnHeader>
            </Table.Header>
            <Table.Body>
              {filteredFiles.length === 0 ? (
                <Table.Row>
                  <Table.Cell is="td" {...{ colspan: 6 }} flex={1}>
                    <Text textAlign="center" display="block" padding={24}>
                      No files found in this category
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ) : (
                filteredFiles.map((file) => (
                  <Table.Row key={file.fileId} height={48}>
                    <Table.Cell flexBasis={30}>
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.fileId)}
                        onChange={() => toggleFileSelection(file.fileId)}
                      />
                    </Table.Cell>
                    <Table.Cell>{file.filename}</Table.Cell>
                    <Table.Cell>
                      <Badge
                        color={
                          file.category === 'rendered'
                            ? 'green'
                            : file.category === 'dithered'
                            ? 'blue'
                            : file.category === 'schematic'
                            ? 'orange'
                            : file.category === 'web'
                            ? 'purple'
                            : 'neutral'
                        }
                      >
                        {file.category}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>{file.type}</Table.Cell>
                    <Table.Cell>{formatFileSize(file.size)}</Table.Cell>
                    <Table.Cell flexBasis={100}>
                      <Tooltip content="Download">
                        <RouterLink to={getFileDownloadUrl(taskId, file.fileId)}>
                          <IconButton is="a" rel="noopener noreferrer" marginRight={8}>
                            <LuDownload size={16} />
                          </IconButton>
                        </RouterLink>
                      </Tooltip>
                      {file.category === 'rendered' && (
                        <Tooltip content="View in Map Viewer">
                          <IconButton
                            onClick={() => navigate(`/map/${file.filename.split('.')[0]}`)}
                          >
                            <LuMap size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>
        </Box>
      </Card.Root>

      <Box display="flex" justifyContent="space-between" marginTop={24}>
        <Button appearance="default" onClick={() => navigate('/upload')}>
          Convert Another Image
        </Button>

        {filteredFiles.some((f) => f.category === 'rendered') && (
          <IconButton
            appearance="primary"
            onClick={() => {
              const renderedFile = filteredFiles.find((f) => f.category === 'rendered');
              if (renderedFile) {
                navigate(`/map/${renderedFile.filename.split('.')[0]}`);
              }
            }}
          >
            Explore in Map Viewer
            <LuMap size={16} style={{ marginLeft: 4 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default ResultsPage;
