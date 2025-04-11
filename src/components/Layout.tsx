import React from 'react';
import { Outlet } from 'react-router-dom';
import { Pane, Heading, Link } from 'evergreen-ui';
import { Link as RouterLink } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <Pane height="100vh" width="100%" display="flex" flexDirection="column" background="tint1">
      {/* Header */}
      <Pane
        padding={16}
        background="tint2"
        borderBottom="1px solid"
        borderColor="default"
        display="flex"
        alignItems="center"
      >
        <Link is={RouterLink} to="/" textDecoration="none">
          <Heading size={700} color="white">
            Pixeletica
          </Heading>
        </Link>
        <Pane flex={1} />
        <Link is={RouterLink} to="/" marginRight={16} color="default">
          Home
        </Link>
        <Link is={RouterLink} to="/create" color="default">
          Create New
        </Link>
      </Pane>

      {/* Main content */}
      <Pane flex={1} overflow="auto" padding={16}>
        <Outlet />
      </Pane>

      {/* Footer */}
      <Pane
        padding={16}
        background="tint2"
        borderTop="1px solid"
        borderColor="default"
        textAlign="center"
      >
        <Heading size={300} color="muted">
          Pixeletica • Minecraft Pixel Art Converter
        </Heading>
      </Pane>
    </Pane>
  );
};

export default Layout;
