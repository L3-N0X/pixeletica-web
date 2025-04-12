import React, { useState } from 'react';
import {
  Box,
  Card,
  Heading,
  IconButton,
  Text,
  Badge,
  Button,
  Dialog,
  Checkbox,
} from '@chakra-ui/react';
import { FileInfo } from '../types/api';
import { conversionApi } from '../services/api';
import FilePreview from './FilePreview';
import { LuChevronDown, LuChevronUp, LuDownload } from 'react-icons/lu';

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

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Calculate total file size
  const totalSizeBytes = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <Card.Root background="tint2" marginY={16} padding={0} borderRadius={8} overflow="hidden">
      <Box
        padding={16}
        display="flex"
        alignItems="center"
        background="tint3"
        borderBottom={expanded ? '1px solid' : 'none'}
        borderColor="default"
      >
        <IconButton appearance="minimal" onClick={() => setExpanded(!expanded)} marginRight={8}>
          {expanded ? <LuChevronUp /> : <LuChevronDown />}
        </IconButton>

        <Heading size="md">{title}</Heading>

        <Badge color="blue" marginLeft={8}>
          {files.length} file{files.length !== 1 ? 's' : ''}
        </Badge>

        <Text marginLeft={16} color="muted" fontSize="lg">
          {formatFileSize(totalSizeBytes)}
        </Text>

        <Box flex={1} />

        <Checkbox.Root
          checked={files.every((file) => selectedFiles.has(file.fileId))}
          onChange={(e) => {
            const isChecked = (e.target as HTMLInputElement).checked;
            files.forEach((file) => onSelectFile(file.fileId, isChecked));
          }}
        />
      </Box>

      {expanded && (
        <Box>
          {sortedFiles.map((file) => (
            <Box
              key={file.fileId}
              padding={12}
              display="flex"
              alignItems="center"
              borderBottom="1px solid"
              borderColor="default"
              background="tint2"
            >
              <Checkbox.Root
                checked={selectedFiles.has(file.fileId)}
                onChange={(e) => onSelectFile(file.fileId, (e.target as HTMLInputElement).checked)}
                marginRight={12}
              />

              <Box flex={1}>
                <Text>{file.filename}</Text>
                <Text fontSize="md" color="muted">
                  {formatFileSize(file.size)} • {file.type}
                </Text>
              </Box>

              <Button appearance="minimal" marginRight={8} onClick={() => setPreviewFile(file)}>
                Preview
              </Button>

              <IconButton
                appearance="minimal"
                is="a"
                onClick={async () => {
                  const downloadRef = await conversionApi.downloadSelectedFiles(taskId, [
                    file.fileId,
                  ]);
                  if (downloadRef) {
                    window.location.href = downloadRef;
                  }
                }}
              >
                <LuDownload />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      {previewFile && (
        <Dialog.Root open={previewFile !== null} onExitComplete={() => setPreviewFile(null)}>
          <Dialog.Header title="File Preview" />
          <Box height="70vh">
            <FilePreview file={previewFile} taskId={taskId} />
          </Box>
        </Dialog.Root>
      )}
    </Card.Root>
  );
};

export default FileCategoryGroup;
