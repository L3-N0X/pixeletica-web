import React from 'react';
import { Pane, Heading, Text, Link as EvergreenLink } from 'evergreen-ui';
import { Link } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Pane display="flex" flexDirection="column" height="100vh" backgroundColor="#121212">
      <Pane 
        elevation={1} 
        padding={16} 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between"
        backgroundColor="#1e1e1e"
        borderBottom="1px solid #2e2e2e"
      >
        <Pane>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Heading size={700} color="#e0e0e0">Pixeletica</Heading>
          </Link>
        </Pane>
        
        <Pane display="flex" gap={24}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Text color="#e0e0e0">Maps</Text>
          </Link>
          <Link to="/upload" style={{ textDecoration: 'none' }}>
            <Text color="#e0e0e0">Upload Image</Text>
          </Link>
          <EvergreenLink href="https://github.com/yourusername/pixeletica" target="_blank">
            <Text color="#e0e0e0">GitHub</Text>
          </EvergreenLink>
        </Pane>
      </Pane>
      
      <Pane flex={1} overflow="auto" padding={16}>
        {children}
      </Pane>
      
      <Pane 
        padding={16} 
        backgroundColor="#1e1e1e" 
        borderTop="1px solid #2e2e2e"
        textAlign="center"
      >
        <Text color="#9e9e9e" size={300}>
          Pixeletica &copy; {new Date().getFullYear()} - Convert images to Minecraft block art
        </Text>
      </Pane>
    </Pane>
  );
};

export default MainLayout;
