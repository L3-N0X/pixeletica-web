import React from 'react';
import { Link } from 'react-router-dom';
import { Pane, Heading, Text, Button } from 'evergreen-ui';

const NotFoundPage: React.FC = () => {
  return (
    <Pane
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="60vh"
    >
      <Heading size={900} marginBottom={16}>
        404
      </Heading>
      <Heading size={700} marginBottom={8}>
        Page Not Found
      </Heading>
      <Text size={500} marginBottom={32} color="muted">
        The page you're looking for doesn't exist.
      </Text>
      <Button appearance="primary" as={Link} to="/">
        Return to Home
      </Button>
    </Pane>
  );
};

export default NotFoundPage;
