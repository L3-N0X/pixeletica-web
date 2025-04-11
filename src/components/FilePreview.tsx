import React, { useState } from 'react';
import { Pane, Spinner } from 'evergreen-ui';
import { FileInfo } from '../types/api';
import { conversionApi } from '../services/api';

interface FilePreviewProps {
  file: FileInfo;
  taskId: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, taskId }) => {
  const [loading, setLoading] = useState(true);

  // Get file URL based on file type
  const fileUrl = conversionApi.getFileUrl(taskId, file.fileId);

  // Determine preview type based on file MIME type
  const isImage = file.type.startsWith('image/');
  const isHtml = file.type === 'text/html';
  const isPdf = file.type === 'application/pdf';
  const isSchematic = file.filename.endsWith('.litematic') || file.filename.endsWith('.schematic');

  // Handle loading state
  const handleLoad = () => {
    setLoading(false);
  };

  // Handle error state
  const handleError = () => {
    setLoading(false);
  };

  return (
    <Pane position="relative" height="100%" width="100%" minHeight={200}>
      {loading && (
        <Pane
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          background="tint1"
          zIndex={1}
        >
          <Spinner />
        </Pane>
      )}

      {isImage && (
        <img
          src={fileUrl}
          alt={file.filename}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            background: '#1A1A1A',
          }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {isHtml && (
        <iframe
          src={fileUrl}
          title={file.filename}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            minHeight: '400px',
          }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {isPdf && (
        <iframe
          src={`${fileUrl}#view=FitH`}
          title={file.filename}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            minHeight: '400px',
          }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {isSchematic && (
        <Pane
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
          background="tint2"
          padding={16}
          borderRadius={4}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 16V7.97H16V3H5V16H3V19H21V16ZM12 16L10 13L11.5 10.5L9.5 8H14L15.5 10.5L14 13L12 16Z"
              fill="#4B9E91"
              stroke="#4B9E91"
              strokeWidth="0.5"
            />
          </svg>
        </Pane>
      )}

      {!isImage && !isHtml && !isPdf && !isSchematic && (
        <Pane
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
          background="tint2"
          padding={16}
          borderRadius={4}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z"
              fill="#999999"
            />
          </svg>
        </Pane>
      )}
    </Pane>
  );
};

export default FilePreview;
