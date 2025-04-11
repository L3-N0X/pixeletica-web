import React from 'react';
import { Pane, Spinner, Heading, Text } from 'evergreen-ui';

interface LoadingFallbackProps {
  message?: string;
  size?: number;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Loading...',
  size = 32,
}) => {
  return (
    <Pane
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
      width="100%"
      padding={32}
    >
      <Spinner size={size} marginBottom={16} />

      {message && (
        <Heading size={500} marginBottom={8}>
          {message}
        </Heading>
      )}

      <Text size={300} color="muted">
        Please wait...
      </Text>
    </Pane>
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
    <Pane position="relative">
      <Pane opacity={0.4} position="relative" pointerEvents={isLoading ? 'none' : 'auto'}>
        {children}
      </Pane>

      <Pane
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        background="rgba(0, 0, 0, 0.5)"
        zIndex={1000}
      >
        <Pane
          background="#1A1A1A"
          borderRadius={8}
          padding={24}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Spinner size={24} marginBottom={16} />
          <Text color="white">{message || 'Loading...'}</Text>
        </Pane>
      </Pane>
    </Pane>
  );
};
