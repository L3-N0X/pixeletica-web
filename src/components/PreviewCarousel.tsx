import React, { useState } from 'react';
import { Pane, IconButton, Card, Text } from 'evergreen-ui';
import { FileInfo } from '../types/api';
import { conversionApi } from '../services/api';

interface PreviewCarouselProps {
  files: FileInfo[];
  taskId: string;
}

const PreviewCarousel: React.FC<PreviewCarouselProps> = ({ files, taskId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Filter only image files
  const imageFiles = files.filter(
    (file) => file.type.startsWith('image/') || file.type === 'text/html'
  );

  if (imageFiles.length === 0) {
    return (
      <Card
        background="tint2"
        padding={16}
        display="flex"
        alignItems="center"
        justifyContent="center"
        height={300}
      >
        <Text color="muted">No preview files available</Text>
      </Card>
    );
  }

  const currentFile = imageFiles[currentIndex];
  const fileUrl = conversionApi.getFileUrl(taskId, currentFile.fileId);
  const isHtml = currentFile.type === 'text/html';

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + imageFiles.length) % imageFiles.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % imageFiles.length);
  };

  const handleLoad = (fileId: string) => {
    setLoading((prev) => ({ ...prev, [fileId]: false }));
  };

  const handleError = (fileId: string) => {
    setLoading((prev) => ({ ...prev, [fileId]: false }));
  };

  return (
    <Pane position="relative" height="100%" minHeight={300}>
      {/* Image Container */}
      <Pane
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
        background="#1A1A1A"
        borderRadius={4}
        overflow="hidden"
      >
        {isHtml ? (
          <iframe
            src={fileUrl}
            title={currentFile.filename}
            style={{ width: '100%', height: '100%', border: 'none' }}
            onLoad={() => handleLoad(currentFile.fileId)}
            onError={() => handleError(currentFile.fileId)}
          />
        ) : (
          <img
            src={fileUrl}
            alt={currentFile.filename}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
            onLoad={() => handleLoad(currentFile.fileId)}
            onError={() => handleError(currentFile.fileId)}
          />
        )}
      </Pane>

      {/* Navigation Arrows */}
      {imageFiles.length > 1 && (
        <>
          <IconButton
            icon="chevron-left"
            appearance="minimal"
            position="absolute"
            left={8}
            top="50%"
            transform="translateY(-50%)"
            onClick={handlePrev}
          />
          <IconButton
            icon="chevron-right"
            appearance="minimal"
            position="absolute"
            right={8}
            top="50%"
            transform="translateY(-50%)"
            onClick={handleNext}
          />
        </>
      )}

      {/* Filename and Navigation Dots */}
      <Pane
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        background="rgba(0,0,0,0.7)"
        padding={8}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Text color="white" size={300}>
          {currentFile.filename}
        </Text>

        {imageFiles.length > 1 && (
          <Pane display="flex" gap={8} marginTop={4}>
            {imageFiles.map((_, idx) => (
              <Pane
                key={idx}
                width={8}
                height={8}
                borderRadius="50%"
                background={idx === currentIndex ? 'white' : 'rgba(255,255,255,0.5)'}
                cursor="pointer"
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </Pane>
        )}
      </Pane>
    </Pane>
  );
};

export default PreviewCarousel;
