import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Flex, Heading, Link, useDisclosure, Kbd, Stack, HStack } from '@chakra-ui/react';
import { Button } from './ui/button';
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
        boxShadow="sm"
      >
        <Flex
          maxW="1920px"
          mx="auto"
          width="100%"
          align="left"
          gap="5rem"
          direction={{ base: 'column', md: 'row' }}
          display="flex"
        >
          {/* Logo */}
          <RouterLink to="/" style={{ textDecoration: 'none' }}>
            <Flex alignItems="center" _hover={{ textDecoration: 'none' }}>
              <Heading fontSize="4xl" color="white" fontFamily="heading" lineHeight="1.0">
                Pixeletica
              </Heading>
            </Flex>
          </RouterLink>

          <HStack
            direction="row"
            h="20"
            display={{ base: 'none', md: 'flex' }}
            gap="2rem"
            justifyContent="start"
            flex={1}
            alignItems="center"
            flexGrow={1}
          >
            {navLinks.map((link) => (
              <RouterLink to={link.path} style={{ textDecoration: 'none' }} key={link.path}>
                <Box
                  key={link.path}
                  display="block"
                  p={3}
                  my={1}
                  fontSize={'2xl'}
                  fontWeight="medium"
                  color={isActive(link.path) ? 'primary.500' : 'text'}
                  _hover={
                    isActive(link.path)
                      ? {
                          textDecoration: 'none',
                        }
                      : {
                          color: 'primary.400',
                        }
                  }
                >
                  {link.label.toUpperCase()}
                </Box>
              </RouterLink>
            ))}
          </HStack>
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
          <Heading
            size="xs"
            color="muted"
            fontFamily="body"
            alignSelf={{ base: 'center', md: 'left' }}
          >
            Pixeletica • Minecraft Pixel Art Converter
          </Heading>
          {/* <Flex display={{ base: 'none', md: 'flex' }} mt={{ base: 2, md: 0 }}>
            <ChakraLink mr={4} color="muted" href="#" textDecoration="none">
              About
            </ChakraLink>
            <ChakraLink mr={4} color="muted" href="#" textDecoration="none">
              Privacy
            </ChakraLink>
            <ChakraLink color="muted" href="#" textDecoration="none">
              Contact
            </ChakraLink>
          </Flex> */}
        </Flex>
      </Box>
    </Flex>
  );
};

export default Layout;
