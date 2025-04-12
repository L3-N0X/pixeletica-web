import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Pane,
  Heading,
  Text,
  Button,
  Spinner,
  Dialog,
  toaster,
  EmptyState,
  PlusIcon,
  MapMarkerIcon,
  Card,
  Badge,
} from 'evergreen-ui';
import { mapsApi, conversionApi } from '../services/api';
import { MapInfo } from '../types/api';
import MapCard from '../components/MapCard';
import FilterBar, { SortOption, FilterOption } from '../components/FilterBar';
import useFavorites from '../hooks/useFavorites';
import useRecentMaps from '../hooks/useRecentMaps';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

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
  };

  const confirmDelete = async () => {
    if (!mapToDelete) return;

    try {
      setIsDeleting(true);
      await conversionApi.deleteConversion(mapToDelete);

      // Remove from state
      setMaps((prevMaps) => prevMaps.filter((map) => map.id !== mapToDelete));

      toaster.success('Map deleted successfully');
    } catch (err) {
      console.error('Failed to delete map:', err);
      toaster.danger('Failed to delete the map');
    } finally {
      setIsDeleting(false);
      setMapToDelete(null);
    }
  };

  // Filter and sort maps
  const filteredMaps = useMemo(() => {
    // Apply search filter
    let result = [...maps];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (map) =>
          map.name.toLowerCase().includes(searchLower) ||
          (map.description && map.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter
    if (filterOption === 'favorites') {
      result = result.filter((map) => isFavorite(map.id));
    } else if (filterOption === 'recent') {
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
    <Pane>
      {/* Hero Section */}
      <Card
        elevation={1}
        background="rgba(17, 34, 24, 0.5)"
        marginBottom={32}
        paddingY={isMobile ? 24 : 48}
        paddingX={isMobile ? 16 : 32}
        borderRadius={8}
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
      >
        <Heading
          size={900}
          marginBottom={16}
          fontFamily="'Merriweather', serif"
          textAlign="center"
          color="white"
        >
          Welcome to Minecraft Pixel Art Creator
        </Heading>
        <Text size={500} color="muted" maxWidth={600} marginBottom={24} textAlign="center">
          Convert your favorite images to stunning Minecraft block art with our advanced conversion
          tool
        </Text>
        <Button
          appearance="primary"
          height={48}
          paddingX={24}
          as={Link}
          to="/create"
          iconBefore={PlusIcon}
          fontSize={16}
        >
          Create New Pixel Art
        </Button>
      </Card>

      {/* Filter Bar in Card */}
      <Card
        elevation={1}
        background="rgba(17, 34, 24, 0.5)"
        marginBottom={32}
        padding={16}
        borderRadius={8}
      >
        <FilterBar
          search={search}
          setSearch={setSearch}
          sortOption={sortOption}
          setSortOption={setSortOption}
          filterOption={filterOption}
          setFilterOption={setFilterOption}
        />
      </Card>

      {loading ? (
        <Pane display="flex" alignItems="center" justifyContent="center" height={300}>
          <Spinner />
        </Pane>
      ) : error ? (
        <Pane background="redTint" padding={16} borderRadius={4}>
          <Text color="danger">{error}</Text>
        </Pane>
      ) : filteredMaps.length === 0 ? (
        <EmptyState
          background="dark"
          title={
            filterOption === 'all'
              ? 'No maps available'
              : filterOption === 'favorites'
                ? 'No favorite maps'
                : 'No recent maps'
          }
          orientation="horizontal"
          icon={<MapMarkerIcon color="#4B9E91" size={40} />}
          iconBgColor="#1A1A1A"
          description={
            filterOption === 'all'
              ? 'Get started by creating your first pixel art'
              : filterOption === 'favorites'
                ? 'Add maps to your favorites to see them here'
                : 'Recently viewed maps will appear here'
          }
          primaryCta={
            filterOption === 'all' ? (
              <Button appearance="primary" as={Link} to="/create">
                Create New
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card
          elevation={1}
          background="rgba(17, 34, 24, 0.5)"
          padding={isMobile ? 16 : 24}
          borderRadius={8}
        >
          <Heading
            size={600}
            marginBottom={24}
            fontFamily="'Source Serif Pro', serif"
            display="flex"
            alignItems="center"
          >
            <MapMarkerIcon color="#92e8b8" marginRight={12} size={18} />
            {filterOption === 'all'
              ? 'Available Maps'
              : filterOption === 'favorites'
                ? 'Favorite Maps'
                : 'Recent Maps'}
            {filteredMaps.length > 0 && (
              <Badge color="neutral" marginLeft={8}>
                {filteredMaps.length}
              </Badge>
            )}
          </Heading>

          <Pane
            display="grid"
            gridTemplateColumns={
              isMobile
                ? '1fr'
                : isTablet
                  ? 'repeat(2, 1fr)'
                  : 'repeat(auto-fill, minmax(280px, 1fr))'
            }
            gap={24}
          >
            {filteredMaps.map((map) => (
              <MapCard
                key={map.id}
                map={map}
                onDelete={filterOption === 'all' ? handleDeleteMap : undefined}
              />
            ))}
          </Pane>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        isShown={mapToDelete !== null}
        title="Delete Map"
        intent="danger"
        onCloseComplete={() => setMapToDelete(null)}
        onConfirm={confirmDelete}
        confirmLabel="Delete"
        isConfirmLoading={isDeleting}
      >
        Are you sure you want to delete this map? This action cannot be undone.
      </Dialog>
    </Pane>
  );
};

export default HomePage;
