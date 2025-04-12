import React, { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  Spinner,
  Badge,
  Grid,
  Flex,
  Icon,
  // VStack removed as it's unused
  Container,
  // Modal components
  Dialog, // Changed from Modal
  DialogContent, // Changed from ModalContent
  DialogHeader, // Changed from ModalHeader
  DialogFooter, // Changed from ModalFooter
  DialogBody, // Changed from ModalBody
  CloseButton, // Changed from ModalCloseButton
  useDisclosure,
  // Card
  Card,
  CardBody,
} from '@chakra-ui/react';
import { FaPlus, FaMapMarkerAlt } from 'react-icons/fa';
import { mapsApi, conversionApi } from '../services/api';
import { MapInfo } from '../types/api';
import MapCard from '../components/MapCard';
import FilterBar, { SortOption, FilterOption } from '../components/FilterBar';
import useFavorites from '../hooks/useFavorites';
import useRecentMaps from '../hooks/useRecentMaps';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import EmptyState from '../components/EmptyState';

const HomePage: React.FC = () => {
  const { isMobile, isTablet } = useResponsiveLayout();

  // State
  const [maps, setMaps] = useState<MapInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [mapToDelete, setMapToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal disclosure - fixed property name
  const { open: isOpen, onOpen, onClose } = useDisclosure();

  // Custom hooks
  const { isFavorite } = useFavorites();
  const { recentMaps } = useRecentMaps();

  // Load maps from API
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        setLoading(true);
        const response = await mapsApi.listMaps();
        setMaps(response.maps);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch maps:', err);
        setError('Failed to load available maps. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaps();
  }, []);

  // Handle map deletion
  const handleDeleteMap = (mapId: string) => {
    setMapToDelete(mapId);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!mapToDelete) return;

    try {
      setIsDeleting(true);
      await conversionApi.deleteConversion(mapToDelete);

      // Remove from state
      setMaps((prevMaps) => prevMaps.filter((map) => map.id !== mapToDelete));
    } catch (err) {
      console.error('Failed to delete map:', err);
    } finally {
      setIsDeleting(false);
      setMapToDelete(null);
      onClose();
    }
  };

  // Filter and sort maps
  const filteredMaps = useMemo(() => {
    // Make sure maps is an array before using the spread operator
    let result = Array.isArray(maps) ? [...maps] : [];

    if (search && result.length > 0) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (map) =>
          map.name.toLowerCase().includes(searchLower) ||
          (map.description && map.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter
    if (filterOption === 'favorites' && result.length > 0) {
      result = result.filter((map) => isFavorite(map.id));
    } else if (filterOption === 'recent' && result.length > 0 && recentMaps?.length > 0) {
      const recentIds = new Set(recentMaps.map((r) => r.id));
      result = result.filter((map) => recentIds.has(map.id));
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.created).getTime() - new Date(a.created).getTime();
        case 'oldest':
          return new Date(a.created).getTime() - new Date(b.created).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return result;
  }, [maps, search, sortOption, filterOption, isFavorite, recentMaps]);

  return (
    <Container maxWidth="container.xl" px={isMobile ? 4 : 8}>
      {/* Hero Section */}
      <Box
        bg="rgba(17, 34, 24, 0.5)"
        mb={8}
        py={isMobile ? 6 : 12}
        px={isMobile ? 4 : 8}
        borderRadius="lg"
        boxShadow="md"
        textAlign="center"
      >
        <Heading as="h1" size="2xl" mb={4} fontFamily="heading" textAlign="center" color="white">
          Welcome to Minecraft Pixel Art Creator
        </Heading>
        <Text
          fontSize="lg"
          color="gray.200"
          maxW="container.md"
          mx="auto"
          mb={6}
          textAlign="center"
        >
          Convert your favorite images to stunning Minecraft block art with our advanced conversion
          tool
        </Text>
        {/* Create button */}
        <RouterLink to="/create" style={{ textDecoration: 'none' }}>
          <Button height="48px" fontSize="md" fontWeight="medium" transition="all 0.2s ease">
            <Icon as={FaPlus} mr={2} boxSize={5} />
            Create New Pixel Art
          </Button>
        </RouterLink>
      </Box>

      {/* Filter Bar */}
      <Box bg="rgba(17, 34, 24, 0.5)" mb={8} p={4} borderRadius="lg" boxShadow="sm">
        <FilterBar
          search={search}
          setSearch={setSearch}
          sortOption={sortOption}
          setSortOption={setSortOption}
          filterOption={filterOption}
          setFilterOption={setFilterOption}
        />
      </Box>

      {loading ? (
        <Flex align="center" justify="center" height="300px">
          {/* Fixed spinner props */}
          <Spinner size="xl" color="primary.500" />
        </Flex>
      ) : error ? (
        <Box bg="red.500" color="white" p={4} borderRadius="md">
          <Text>{error}</Text>
        </Box>
      ) : filteredMaps.length === 0 ? (
        <Box bg="rgba(17, 34, 24, 0.5)" borderRadius="lg" boxShadow="sm">
          <EmptyState
            title={
              filterOption === 'all'
                ? 'No maps available'
                : filterOption === 'favorites'
                ? 'No favorite maps'
                : 'No recent maps'
            }
            orientation="horizontal"
            icon="bookmark"
            iconBgColor="#1A1A1A"
            description={
              filterOption === 'all'
                ? 'Get started by creating your first pixel art'
                : filterOption === 'favorites'
                ? 'Add maps to your favorites to see them here'
                : 'Recently viewed maps will appear here'
            }
          />
          {filterOption === 'all' && (
            <Box textAlign="center" pb={6}>
              {/* Create button */}
              <RouterLink to="/create" style={{ textDecoration: 'none' }}>
                <Button colorScheme="primary" mt={4}>
                  Create New
                </Button>
              </RouterLink>
            </Box>
          )}
        </Box>
      ) : (
        /* Fix the Card implementation */
        <Card.Root
          variant="outline"
          bg="rgba(17, 34, 24, 0.5)"
          borderRadius="lg"
          boxShadow="md"
          borderColor="rgba(81, 123, 102, 0.2)"
        >
          <CardBody p={isMobile ? 4 : 6}>
            <Flex align="center" mb={6}>
              <Icon as={FaMapMarkerAlt} color="primary.500" mr={3} boxSize={5} />
              <Heading size="md" fontFamily="body" display="flex" alignItems="center">
                {filterOption === 'all'
                  ? 'Available Maps'
                  : filterOption === 'favorites'
                  ? 'Favorite Maps'
                  : 'Recent Maps'}
                {filteredMaps.length > 0 && (
                  <Badge
                    ml={2}
                    colorScheme="gray"
                    variant="solid"
                    fontSize="xs"
                    borderRadius="full"
                    px={2}
                  >
                    {filteredMaps.length}
                  </Badge>
                )}
              </Heading>
            </Flex>

            <Grid
              templateColumns={
                isMobile
                  ? '1fr'
                  : isTablet
                  ? 'repeat(2, 1fr)'
                  : 'repeat(auto-fill, minmax(280px, 1fr))'
              }
              gap={6}
            >
              {filteredMaps.map((map) => (
                <MapCard
                  key={map.id}
                  map={map}
                  onDelete={filterOption === 'all' ? handleDeleteMap : undefined}
                />
              ))}
            </Grid>
          </CardBody>
        </Card.Root>
      )}

      {/* Delete Confirmation Modal - updated to Dialog components */}
      <Dialog.Root open={isOpen} onExitComplete={onClose}>
        <Dialog.Trigger asChild>
          <Button colorScheme="red" variant="outline" onClick={onOpen}>
            Delete Map
          </Button>
        </Dialog.Trigger>
        <DialogBody bg="blackAlpha.700" backdropFilter="blur(5px)" />
        <DialogContent bg="gray.75">
          <DialogHeader color="text">Delete Map</DialogHeader>
          <CloseButton onClick={onClose} position="absolute" right={3} top={3} />
          <DialogBody>
            <Text color="text">
              Are you sure you want to delete this map? This action cannot be undone.
            </Text>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog.Root>
    </Container>
  );
};

export default HomePage;
