import { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Heading,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Code, // For displaying error details
} from '@chakra-ui/react';

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
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI using Chakra components
      return (
        <Flex
          direction="column"
          align="center"
          justify="center"
          p={8}
          bg="gray.800" // Use theme token or specific color
          border="1px solid"
          borderColor="gray.600"
          borderRadius="md"
          m={4}
          color="white" // Ensure text is visible on dark background
        >
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            mb={4}
            bg="red.900" // Darker red background
            borderRadius="md"
            p={4}
          >
            <AlertIcon boxSize="40px" mr={0} color="red.300" />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Something went wrong
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              {this.state.error?.message || 'The application encountered an unexpected error.'}
            </AlertDescription>
          </Alert>

          <Button variant="solid" colorScheme="red" onClick={this.handleReset} mb={6}>
            Try Again
          </Button>

          {process.env.NODE_ENV !== 'production' && this.state.errorInfo && (
            <Box mt={6} width="100%" textAlign="left">
              <Heading size="sm" mb={2}>
                Error Details:
              </Heading>
              <Box bg="blackAlpha.400" p={3} borderRadius="md" maxHeight="200px" overflow="auto">
                <Code colorScheme="red" fontSize="xs" whiteSpace="pre-wrap">
                  {this.state.error?.toString()}
                  {'\n\n'}
                  {this.state.errorInfo.componentStack}
                </Code>
              </Box>
            </Box>
          )}
        </Flex>
      );
    }

    return this.props.children;
  }
}
