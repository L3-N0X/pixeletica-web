import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Pane,
  Heading,
  Button,
  Spinner,
  Card,
  Tab,
  Tablist,
  Text,
  Badge,
  IconButton,
  Table,
  Tooltip,
} from 'evergreen-ui';
import {
  getConversionStatus,
  listConversionFiles,
  getFileDownloadUrl,
  getAllFilesDownloadUrl,
  downloadSelectedFiles,
} from '@services/conversionService';
import type { TaskResponse, FileInfo } from '@types';

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
      <Pane display="flex" alignItems="center" justifyContent="center" height="100%">
        <Pane textAlign="center">
          <Spinner size={32} marginBottom={16} />
          <Heading size={500}>
            {task?.status === 'processing' && 'Processing...'}
            {task?.status === 'queued' && 'Waiting in queue...'}
            {!task && 'Loading...'}
          </Heading>
          {task?.progress !== null && (
            <Pane marginTop={16} display="flex" flexDirection="column" alignItems="center">
              <Text>{task.progress}% complete</Text>
              <Pane width={300} height={6} backgroundColor="#2e2e2e" borderRadius={3} marginTop={8}>
                <Pane
                  height={6}
                  width={`${task.progress}%`}
                  backgroundColor="#00897b"
                  borderRadius={3}
                />
              </Pane>
            </Pane>
          )}
        </Pane>
      </Pane>
    );
  }

  // Render error state
  if (error || !taskId || (task && task.status === 'failed')) {
    return (
      <Pane>
        <Heading size={700} marginBottom={16}>
          Error
        </Heading>
        <Card backgroundColor="#2e2e2e" padding={16} marginBottom={24} elevation={1}>
          <Text color="#ff8a80">{error || task?.error || 'An error occurred.'}</Text>
        </Card>
        <Button appearance="primary" onClick={() => navigate('/upload')}>
          Return to Upload Page
        </Button>
      </Pane>
    );
  }

  return (
    <Pane>
      <Heading size={700} marginBottom={8}>
        Conversion Results
      </Heading>
      <Text marginBottom={24}>Task ID: {taskId}</Text>

      <Card backgroundColor="#2e2e2e" elevation={1}>
        {/* Tab navigation */}
        <Tablist marginBottom={16} flexBasis={240} padding={8}>
          {tabs.map((tab, index) => (
            <Tab
              key={tab.name}
              id={tab.name}
              onSelect={() => setSelectedTab(index)}
              isSelected={index === selectedTab}
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
            </Tab>
          ))}
        </Tablist>

        {/* Action buttons */}
        <Pane
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          padding={16}
          borderBottom="1px solid #3e3e3e"
        >
          <Pane>
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
              iconBefore={downloading ? undefined : 'download'}
            >
              {downloading ? <Spinner size={16} /> : `Download (${selectedFiles.length})`}
            </Button>
          </Pane>

          <Tooltip content="Download all files as ZIP">
            <IconButton
              icon="download"
              appearance="default"
              size="large"
              is="a"
              href={taskId ? getAllFilesDownloadUrl(taskId) : '#'}
              target="_blank"
              rel="noopener noreferrer"
            />
          </Tooltip>
        </Pane>

        {/* File list */}
        <Pane maxHeight="60vh" overflow="auto">
          <Table>
            <Table.Head>
              <Table.TextHeaderCell flexBasis={30}>{/* Checkbox column */}</Table.TextHeaderCell>
              <Table.TextHeaderCell>Filename</Table.TextHeaderCell>
              <Table.TextHeaderCell>Category</Table.TextHeaderCell>
              <Table.TextHeaderCell>Type</Table.TextHeaderCell>
              <Table.TextHeaderCell>Size</Table.TextHeaderCell>
              <Table.TextHeaderCell flexBasis={100}>Actions</Table.TextHeaderCell>
            </Table.Head>
            <Table.Body>
              {filteredFiles.length === 0 ? (
                <Table.Row>
                  <Table.TextCell colSpan={6} textAlign="center" padding={24}>
                    No files found in this category
                  </Table.TextCell>
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
                    <Table.TextCell>{file.filename}</Table.TextCell>
                    <Table.TextCell>
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
                    </Table.TextCell>
                    <Table.TextCell>{file.type}</Table.TextCell>
                    <Table.TextCell>{formatFileSize(file.size)}</Table.TextCell>
                    <Table.Cell flexBasis={100}>
                      <Tooltip content="Download">
                        <IconButton
                          icon="download"
                          is="a"
                          href={taskId ? getFileDownloadUrl(taskId, file.fileId) : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          marginRight={8}
                        />
                      </Tooltip>
                      {file.category === 'rendered' && (
                        <Tooltip content="View in Map Viewer">
                          <IconButton
                            icon="map"
                            onClick={() => navigate(`/map/${file.filename.split('.')[0]}`)}
                          />
                        </Tooltip>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </Pane>
      </Card>

      <Pane display="flex" justifyContent="space-between" marginTop={24}>
        <Button appearance="default" onClick={() => navigate('/upload')}>
          Convert Another Image
        </Button>

        {filteredFiles.some((f) => f.category === 'rendered') && (
          <Button
            appearance="primary"
            iconAfter="arrow-right"
            onClick={() => {
              const renderedFile = filteredFiles.find((f) => f.category === 'rendered');
              if (renderedFile) {
                navigate(`/map/${renderedFile.filename.split('.')[0]}`);
              }
            }}
          >
            Explore in Map Viewer
          </Button>
        )}
      </Pane>
    </Pane>
  );
};

export default ResultsPage;
