import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Pane, Heading, Button, Text, Alert } from 'evergreen-ui';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call the optional onReset callback
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <Pane
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          padding={32}
          background="#1A1A1A"
          border="1px solid #555"
          borderRadius={8}
          margin={16}
        >
          <Alert intent="danger" title="Something went wrong" marginBottom={16} />

          <Heading size={600} marginBottom={16}>
            An error occurred
          </Heading>

          <Text marginBottom={24}>
            {this.state.error?.message || 'The application encountered an unexpected error.'}
          </Text>

          <Button appearance="primary" onClick={this.handleReset}>
            Try Again
          </Button>

          {process.env.NODE_ENV !== 'production' && this.state.errorInfo && (
            <Pane marginTop={24} width="100%">
              <Heading size={300} marginBottom={8}>
                Error Details:
              </Heading>
              <Pane background="#000" padding={12} borderRadius={4} maxHeight={200} overflow="auto">
                <Text fontFamily="mono" size={300} color="#EEE">
                  {this.state.error?.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </Text>
              </Pane>
            </Pane>
          )}
        </Pane>
      );
    }

    return this.props.children;
  }
}
