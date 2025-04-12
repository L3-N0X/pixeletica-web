import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Link as ChakraLink,
  Button,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Link as ReactRouterLink } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // Responsive header height
  const headerHeight = useBreakpointValue({ base: '56px', md: '64px' });
  const mainPaddingTop = useBreakpointValue({ base: '72px', md: '80px' }); // Header height + padding

  return (
    <Flex direction="column" minHeight="100vh" bg="gray.900" color="white">
      {/* Header */}
      <Flex
        as="header"
        position="fixed"
        top="0"
        left="0"
        right="0"
        zIndex="sticky"
        height={headerHeight}
        px={{ base: 4, md: 8 }}
        align="center"
        justify="space-between"
        bgGradient="linear(to-r, #050a07, #112218)"
        boxShadow="sm"
        color="#dde9e3" // off-white text
      >
        {/* Left: Logo */}
        <Box>
          <ChakraLink asChild _hover={{ textDecoration: 'none' }}>
            <ReactRouterLink to="/">
              <Heading size="md" fontFamily="'Merriweather', serif">
                Pixeletica
              </Heading>
            </ReactRouterLink>
          </ChakraLink>
        </Box>

        {/* Center: Main Navigation */}
        <Flex as="nav" gap={{ base: 4, md: 8 }}>
          <ChakraLink asChild _hover={{ textDecoration: 'underline' }} fontSize="sm">
            <ReactRouterLink to="/">Maps</ReactRouterLink>
          </ChakraLink>
          <ChakraLink asChild _hover={{ textDecoration: 'underline' }} fontSize="sm">
            <ReactRouterLink to="/upload">Upload Image</ReactRouterLink>
          </ChakraLink>
          <ChakraLink
            href="https://github.com/Lotus-Primus/pixeletica-web"
            target="_blank"
            rel="noopener noreferrer"
            _hover={{ textDecoration: 'underline' }}
            fontSize="sm"
          >
            GitHub
          </ChakraLink>
        </Flex>

        {/* Right: Action Buttons */}
        <Box>
          <ReactRouterLink to="/create">
            <Button
              colorScheme="teal" // Using teal as primary, adjust if needed based on theme
              size="sm"
              bg="#92e8b8" // primary color from plan
              color="#050a07" // dark text for contrast
              _hover={{ bg: '#7acba1' }} // Slightly darker hover
            >
              Create New Pixel Art
            </Button>
          </ReactRouterLink>
        </Box>
      </Flex>

      {/* Main Content Area */}
      <Box
        as="main"
        flex="1"
        overflow="auto"
        pt={mainPaddingTop} // Padding top to avoid overlap with fixed header
        px={{ base: 4, md: 8 }} // Consistent padding
        pb={4} // Padding bottom for spacing
      >
        {children}
      </Box>

      {/* Footer */}
      <Box
        as="footer"
        py={4} // Padding top and bottom
        px={{ base: 4, md: 8 }}
        bg="#112218" // Slightly lighter than header gradient end
        borderTop="1px solid"
        borderColor="gray.700" // Subtle border
        textAlign="center"
      >
        <Text color="#517b66" fontSize="xs">
          {' '}
          {/* Muted green text */}
          Pixeletica &copy; {new Date().getFullYear()} - Convert images to Minecraft block art
        </Text>
      </Box>
    </Flex>
  );
};

export default MainLayout;
