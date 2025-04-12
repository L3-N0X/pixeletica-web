import React from 'react';
import { Flex, Spinner, Heading, Text, Box } from '@chakra-ui/react';

interface LoadingFallbackProps {
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Loading...',
  size = 'xl',
}) => {
  return (
    <Flex direction="column" align="center" justify="center" h="100%" w="100%" p={8}>
      <Spinner size={size} mb={4} color="primary.500" />

      {message && (
        <Heading size="md" mb={2} textAlign="center">
          {message}
        </Heading>
      )}

      <Text color="gray.200" fontSize="sm">
        Please wait...
      </Text>
    </Flex>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message, children }) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <Box position="relative">
      <Box opacity={0.4} position="relative" pointerEvents={isLoading ? 'none' : 'auto'}>
        {children}
      </Box>

      <Flex
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        align="center"
        justify="center"
        bg="rgba(0, 0, 0, 0.5)"
        zIndex={1000}
      >
        <Box
          bg="gray.50"
          borderRadius="md"
          p={6}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Spinner size="md" mb={4} color="primary.500" />
          <Text color="white">{message || 'Loading...'}</Text>
        </Box>
      </Flex>
    </Box>
  );
};
