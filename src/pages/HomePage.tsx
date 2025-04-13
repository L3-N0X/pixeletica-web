import {
  Badge,
  Box,
  Card,
  CardBody,
  Container,
  EmptyState,
  Flex,
  Grid,
  Heading,
  Highlight,
  Icon,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Button } from '../components/ui/button';
import React, { useEffect, useMemo, useState } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { LuMap } from 'react-icons/lu';
import { Link as RouterLink } from 'react-router-dom';
import FilterBar, { FilterOption, SortOption } from '../components/FilterBar';
import MapCard from '../components/MapCard';
import useFavorites from '../hooks/useFavorites';
import useRecentMaps from '../hooks/useRecentMaps';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { mapsApi } from '../services/api';
import { MapInfo } from '../types/api';

const HomePage: React.FC = () => {
  const { isMobile, isTablet } = useResponsiveLayout();

  // State
  const [maps, setMaps] = useState<MapInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');

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
        mb={8}
        py={isMobile ? 6 : 12}
        px={isMobile ? 4 : 8}
        borderRadius="lg"
        boxShadow="md"
        textAlign="center"
      >
        <Heading
          fontSize="9rem"
          as="h1"
          fontFamily="heading"
          textAlign="center"
          color="white"
          lineHeight="0.97"
          textTransform="uppercase"
          fontWeight="extrabold"
          letterSpacing={{ base: '0', md: '0.1rem' }}
        >
          <Highlight
            query="Pixeletica"
            styles={{
              color: 'primary.500',
              background: 'transparent',
            }}
          >
            Welcome to Pixeletica
          </Highlight>
          <Text
            fontSize="4xl"
            mb={6}
            color="gray.600"
            fontWeight="normal"
            fontFamily={'body'}
            textTransform={'none'}
          >
            Explore and create pixel art maps with ease.
          </Text>
        </Heading>
        {/* Create button */}
        <RouterLink to="/create" style={{ textDecoration: 'none' }}>
          <Button size="xl">Create New Pixel Art</Button>
        </RouterLink>
      </Box>

      {/* Filter Bar */}
      <Box mb={8} borderRadius="lg" boxShadow="sm">
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
        <EmptyState.Root>
          <EmptyState.Content
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            textAlign="center"
            px={8}
            py={32}
            bg="gray.50"
            borderRadius="lg"
            boxShadow="md"
          >
            <EmptyState.Indicator color="gray.500">
              <LuMap size={72} />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title fontSize="2xl" fontWeight="bold" color="text">
                No Maps Found
              </EmptyState.Title>
              <EmptyState.Description fontSize="lg" color="muted" mt={2} mb={4}>
                No maps found matching your criteria. Try adjusting your filters or search terms.
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      ) : (
        <Card.Root variant="outline" borderRadius="lg" boxShadow="md">
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
                <MapCard key={map.id} map={map} />
              ))}
            </Grid>
          </CardBody>
        </Card.Root>
      )}
    </Container>
  );
};

export default HomePage;
