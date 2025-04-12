import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Heading, Text, Button } from '@chakra-ui/react';

const NotFoundPage: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="60vh"
    >
      <Heading size="xl" marginBottom={16}>
        404
      </Heading>
      <Heading size="lg" marginBottom={8}>
        Page Not Found
      </Heading>
      <Text fontSize="md" marginBottom={32} color="muted">
        The page you're looking for doesn't exist.
      </Text>

      <RouterLink to="/">
        <Button appearance="primary" size="lg" colorScheme="teal">
          Return to Home
        </Button>
      </RouterLink>
    </Box>
  );
};

export default NotFoundPage;
