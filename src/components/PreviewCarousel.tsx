import React, { useState } from 'react';
import {
  Box,
  Flex,
  IconButton,
  Card,
  CardBody,
  Text,
  Image,
  Circle,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FileInfo } from '../types/api';
import { conversionApi } from '../services/api';

interface PreviewCarouselProps {
  files: FileInfo[];
  taskId: string;
}

const PreviewCarousel: React.FC<PreviewCarouselProps> = ({ files, taskId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [_loadedFiles, setLoadedFiles] = useState<Set<string>>(new Set());
  const [_errorFiles, setErrorFiles] = useState<Set<string>>(new Set());

  // Filter only image files
  const imageFiles = files.filter(
    (file) => file.type.startsWith('image/') || file.type === 'text/html'
  );

  if (imageFiles.length === 0) {
    return (
      <Card
        bg="gray.100" // Light background for empty state
        boxShadow="sm"
      >
        <CardBody display="flex" alignItems="center" justifyContent="center" height="300px">
          <Text color="gray.500">No preview files available</Text>
        </CardBody>
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
    setLoadedFiles((prev) => new Set(prev).add(fileId));
  };

  const handleError = (fileId: string) => {
    setErrorFiles((prev) => new Set(prev).add(fileId));
  };

  return (
    <Box position="relative" height="100%" minH="300px">
      {/* Image/Preview Container */}
      <Flex
        align="center"
        justify="center"
        height="100%"
        bg="#1A1A1A"
        borderRadius="md"
        overflow="hidden"
      >
        {isHtml ? (
          <Box as="iframe"
            src={fileUrl}
            title={currentFile.filename}
            width="100%"
            height="100%"
            border="none"
            onLoad={() => handleLoad(currentFile.fileId)}
            onError={() => handleError(currentFile.fileId)}
          />
        ) : (
          <Image
            src={fileUrl}
            alt={currentFile.filename}
            maxW="100%"
            maxH="100%"
            objectFit="contain"
            onLoad={() => handleLoad(currentFile.fileId)}
            onError={() => handleError(currentFile.fileId)}
          />
        )}
      </Flex>

      {/* Navigation Arrows */}
      {imageFiles.length > 1 && (
        <>
          <IconButton
            icon={<ChevronLeftIcon boxSize={6} />}
            aria-label="Previous image"
            variant="ghost"
            colorScheme="blackAlpha"
            position="absolute"
            left={2}
            top="50%"
            transform="translateY(-50%)"
            onClick={handlePrev}
          />
          <IconButton
            icon={<ChevronRightIcon boxSize={6} />}
            aria-label="Next image"
            variant="ghost"
            colorScheme="blackAlpha"
            position="absolute"
            right={2}
            top="50%"
            transform="translateY(-50%)"
            onClick={handleNext}
          />
        </>
      )}

      {/* Filename and Navigation Dots */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        bg="rgba(0,0,0,0.7)"
        p={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Text color="white" fontSize="sm">
          {currentFile.filename}
        </Text>

        {imageFiles.length > 1 && (
          <Flex gap={2} mt={1}>
            {imageFiles.map((_, idx) => (
              <Circle
                key={idx}
                size={2}
                bg={idx === currentIndex ? 'white' : 'whiteAlpha.500'}
                cursor="pointer"
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default PreviewCarousel;
