import React, { useState } from 'react';
import {
  Pane,
  Card,
  Heading,
  IconButton,
  Text,
  Badge,
  Button,
  Dialog,
  Checkbox,
} from 'evergreen-ui';
import { FileInfo } from '../types/api';
import { conversionApi } from '../services/api';
import FilePreview from './FilePreview';

interface FileCategoryGroupProps {
  title: string;
  files: FileInfo[];
  taskId: string;
  onSelectFile: (fileId: string, selected: boolean) => void;
  selectedFiles: Set<string>;
  expandedByDefault?: boolean;
}

const FileCategoryGroup: React.FC<FileCategoryGroupProps> = ({
  title,
  files,
  taskId,
  onSelectFile,
  selectedFiles,
  expandedByDefault = false,
}) => {
  const [expanded, setExpanded] = useState(expandedByDefault);
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);

  // Sort files by filename
  const sortedFiles = [...files].sort((a, b) => a.filename.localeCompare(b.filename));

  // Get category icon
  const getCategoryIcon = () => {
    switch (title.toLowerCase()) {
      case 'dithered':
        return 'media';
      case 'rendered':
        return 'grid-view';
      case 'schematic':
        return 'cube';
      case 'web':
        return 'code';
      default:
        return 'document';
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Calculate total file size
  const totalSizeBytes = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <Card
      elevation={1}
      background="tint2"
      marginY={16}
      padding={0}
      borderRadius={8}
      overflow="hidden"
    >
      <Pane
        padding={16}
        display="flex"
        alignItems="center"
        background="tint3"
        borderBottom={expanded ? '1px solid' : 'none'}
        borderColor="default"
      >
        <IconButton
          icon={expanded ? 'chevron-down' : 'chevron-right'}
          appearance="minimal"
          onClick={() => setExpanded(!expanded)}
          marginRight={8}
        />

        <IconButton icon={getCategoryIcon()} appearance="minimal" marginRight={8} />

        <Heading size={500}>{title}</Heading>

        <Badge color="blue" marginLeft={8}>
          {files.length} file{files.length !== 1 ? 's' : ''}
        </Badge>

        <Text marginLeft={16} color="muted" size={300}>
          {formatFileSize(totalSizeBytes)}
        </Text>

        <Pane flex={1} />

        <Checkbox
          label="Select All"
          checked={files.every((file) => selectedFiles.has(file.fileId))}
          indeterminate={
            files.some((file) => selectedFiles.has(file.fileId)) &&
            !files.every((file) => selectedFiles.has(file.fileId))
          }
          onChange={(e) => {
            const isChecked = e.target.checked;
            files.forEach((file) => onSelectFile(file.fileId, isChecked));
          }}
        />
      </Pane>

      {expanded && (
        <Pane>
          {sortedFiles.map((file) => (
            <Pane
              key={file.fileId}
              padding={12}
              display="flex"
              alignItems="center"
              borderBottom="1px solid"
              borderColor="default"
              background="tint2"
              _hover={{ background: 'tint3' }}
            >
              <Checkbox
                checked={selectedFiles.has(file.fileId)}
                onChange={(e) => onSelectFile(file.fileId, e.target.checked)}
                marginRight={12}
              />

              <Pane flex={1}>
                <Text>{file.filename}</Text>
                <Text size={300} color="muted">
                  {formatFileSize(file.size)} • {file.type}
                </Text>
              </Pane>

              <Button appearance="minimal" marginRight={8} onClick={() => setPreviewFile(file)}>
                Preview
              </Button>

              <IconButton
                icon="download"
                appearance="minimal"
                is="a"
                href={conversionApi.getFileUrl(taskId, file.fileId)}
                target="_blank"
                download
              />
            </Pane>
          ))}
        </Pane>
      )}

      {previewFile && (
        <Dialog
          isShown={previewFile !== null}
          title={previewFile.filename}
          width="80%"
          hasFooter={false}
          onCloseComplete={() => setPreviewFile(null)}
        >
          <Pane height="70vh">
            <FilePreview file={previewFile} taskId={taskId} />
          </Pane>
        </Dialog>
      )}
    </Card>
  );
};

export default FileCategoryGroup;
