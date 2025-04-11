import React from 'react';
import { Pane, Heading, Button, Text } from 'evergreen-ui';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <Pane
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
      textAlign="center"
    >
      <Heading size={900} marginBottom={16}>
        404
      </Heading>
      <Heading size={700} marginBottom={24}>
        Page Not Found
      </Heading>
      <Text marginBottom={32}>The page you are looking for doesn't exist or has been moved.</Text>
      <Link to="/">
        <Button appearance="primary">Back to Home</Button>
      </Link>
    </Pane>
  );
};

export default NotFoundPage;
