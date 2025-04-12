import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Link as ChakraLink,
  Button,
  IconButton,
  useDisclosure,
  Kbd,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { BsSearch, BsPlus, BsList } from 'react-icons/bs';

// Import UI components
import {
  DrawerRoot,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerBackdrop,
  DrawerCloseTrigger,
} from './ui/drawer';

// Import the SearchBox component
import SearchBox from './SearchBox';

const Layout: React.FC = () => {
  const location = useLocation();
  const { open, onOpen, onClose } = useDisclosure();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/create', label: 'Create' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Flex height="100vh" width="100%" direction="column" bg="gray.50">
      {/* Header */}
      <Flex
        as="header"
        position="sticky"
        top={0}
        zIndex={100}
        px={{ base: 4, md: 6 }}
        py={4}
        bgGradient="linear(to-b, gray.50, gray.75)"
        borderBottom="1px solid"
        borderColor="rgba(81, 123, 102, 0.3)"
        align="center"
        height={{ base: '56px', md: '64px' }}
        boxShadow="sm"
      >
        {/* SearchBox component - invisible but listens for Ctrl+K */}
        <SearchBox onSearch={(query) => console.log('Search for:', query)} />

        {/* Logo */}
        <RouterLink to="/" style={{ textDecoration: 'none' }}>
          <Flex alignItems="center" _hover={{ textDecoration: 'none' }}>
            <Heading size="lg" color="white" fontFamily="heading">
              Pixeletica
            </Heading>
          </Flex>
        </RouterLink>

        {/* Desktop Navigation */}
        <Flex display={{ base: 'none', md: 'flex' }} flex={1} justify="center" mx={4}>
          {navLinks.map((link) => (
            <Box
              key={link.path}
              mx={4}
              color={isActive(link.path) ? 'primary.500' : 'text'}
              fontWeight={isActive(link.path) ? 'medium' : 'normal'}
              position="relative"
              _hover={{ color: 'white', textDecoration: 'none' }}
              _after={{
                content: '""',
                position: 'absolute',
                width: '100%',
                height: '2px',
                bottom: '-5px',
                left: 0,
                bgColor: isActive(link.path) ? 'primary.500' : 'transparent',
                transition: 'all 0.3s ease',
              }}
            >
              <RouterLink to={link.path} style={{ textDecoration: 'none' }}>
                {link.label}
              </RouterLink>
            </Box>
          ))}
        </Flex>

        {/* Actions */}
        <Flex align="center">
          {/* Mobile Menu Button */}
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            aria-label="Open menu"
            variant="ghost"
            onClick={onOpen}
            color="white"
            _hover={{ bg: 'gray.600' }}
          >
            <Box as={BsList} />
          </IconButton>
          {/* Desktop Create Button */}
          <Flex align="center">
            {/* Search button */}
            <Button
              variant="ghost"
              size="sm"
              mr={3}
              onClick={() =>
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
              }
            >
              <Box as={BsSearch} mr={2} />
              Search{' '}
              <Kbd ml={2} fontSize="xs">
                Ctrl+K
              </Kbd>
            </Button>

            <RouterLink to="/create">
              <Button display={{ base: 'none', md: 'inline-flex' }} variant="solid" size="sm">
                <Box as={BsPlus} mr={2} />
                Create New Pixel Art
              </Button>
            </RouterLink>
          </Flex>
        </Flex>
      </Flex>

      {/* Main Content Area */}
      <Flex as="main" flex={1} overflow="hidden" position="relative">
        {/* Mobile Drawer */}
        <DrawerRoot open={open} onOpenChange={(isOpen) => (isOpen ? onOpen() : onClose())}>
          <DrawerBackdrop />
          <DrawerContent bg="gray.75" maxW="280px">
            <DrawerCloseTrigger color="white" />
            <DrawerHeader borderBottomWidth="1px" borderColor="rgba(81, 123, 102, 0.3)">
              <Heading size="md" fontFamily="heading" color="white">
                Navigation
              </Heading>
            </DrawerHeader>
            <DrawerBody p={4}>
              <Flex direction="column" mb={6}>
                {navLinks.map((link) => (
                  <Box
                    key={link.path}
                    display="block"
                    p={3}
                    my={1}
                    color={isActive(link.path) ? 'primary.500' : 'text'}
                    bg={isActive(link.path) ? 'rgba(146, 232, 184, 0.1)' : 'transparent'}
                    borderRadius="md"
                    _hover={{ textDecoration: 'none', bg: 'gray.600' }}
                  >
                    <RouterLink to={link.path} style={{ textDecoration: 'none' }} onClick={onClose}>
                      {link.label}
                    </RouterLink>
                  </Box>
                ))}
                <RouterLink to="/create">
                  <Button variant="solid" w="100%" mt={4} onClick={onClose}>
                    <Box as={BsPlus} mr={2} />
                    Create New Pixel Art
                  </Button>
                </RouterLink>
              </Flex>
            </DrawerBody>
          </DrawerContent>
        </DrawerRoot>

        {/* Desktop Sidebar */}
        <Box
          display={{ base: 'none', lg: 'block' }}
          w="280px"
          h="100%"
          p={4}
          pt={6}
          bg="rgba(17, 34, 24, 0.5)"
          borderRight="1px solid"
          borderColor="rgba(81, 123, 102, 0.2)"
          overflow="auto"
        >
          <Heading size="md" mb={4} fontFamily="heading" color="white">
            Recent Activity
          </Heading>
          <Box mb={8}>
            <Box p={3} bg="rgba(81, 123, 102, 0.1)" borderRadius="md" mb={2}>
              <Heading size="sm" color="gray.300">
                Recent maps will appear here
              </Heading>
            </Box>
          </Box>
          <Heading size="md" mb={4} fontFamily="heading" color="white">
            Filters
          </Heading>
          {/* Filter options */}
        </Box>

        {/* Page Content */}
        <Box flex={1} overflow="auto" p={{ base: 4, md: 6 }} display="flex" flexDirection="column">
          <Box maxW="1920px" w="100%" mx="auto">
            <Outlet />
          </Box>
        </Box>
      </Flex>

      {/* Footer */}
      <Box
        as="footer"
        p={{ base: 4, md: 6 }}
        bg="gray.75"
        borderTop="1px solid"
        borderColor="rgba(81, 123, 102, 0.3)"
        textAlign={{ base: 'center', md: 'left' }}
      >
        <Flex
          maxW="1920px"
          mx="auto"
          direction={{ base: 'column', md: 'row' }}
          align="center"
          justify="space-between"
        >
          <Heading size="xs" color="muted" fontFamily="body">
            Pixeletica • Minecraft Pixel Art Converter
          </Heading>
          <Flex display={{ base: 'none', md: 'flex' }} mt={{ base: 2, md: 0 }}>
            <ChakraLink mr={4} color="muted" href="#" textDecoration="none">
              About
            </ChakraLink>
            <ChakraLink mr={4} color="muted" href="#" textDecoration="none">
              Privacy
            </ChakraLink>
            <ChakraLink color="muted" href="#" textDecoration="none">
              Contact
            </ChakraLink>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
};

export default Layout;
