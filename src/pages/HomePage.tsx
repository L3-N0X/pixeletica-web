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
  TrashIcon,
  MapMarkerIcon,
} from 'evergreen-ui';
import { mapsApi, conversionApi } from '../services/api';
import { MapInfo } from '../types/api';
import MapCard from '../components/MapCard';
import FilterBar, { SortOption, FilterOption } from '../components/FilterBar';
import useFavorites from '../hooks/useFavorites';
import useRecentMaps from '../hooks/useRecentMaps';

const HomePage: React.FC = () => {
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
  const { favorites, isFavorite } = useFavorites();
  const { recentMaps, addRecentMap } = useRecentMaps();

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
      <Pane display="flex" alignItems="center" marginBottom={24}>
        <Heading size={900} marginRight={16}>
          Pixeletica
        </Heading>
        <Text size={500} color="muted">
          Convert images to Minecraft block art
        </Text>
        <Pane flex={1} />
        <Button appearance="primary" height={40} as={Link} to="/create" iconBefore={PlusIcon}>
          Create New Pixel Art
        </Button>
      </Pane>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        sortOption={sortOption}
        onSortChange={setSortOption}
        filterOption={filterOption}
        onFilterChange={setFilterOption}
      />

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
          primaryAction={
            filterOption === 'all' ? (
              <Button appearance="primary" as={Link} to="/create">
                Create New
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Pane>
          <Heading size={600} marginBottom={16}>
            {filterOption === 'all'
              ? 'Available Maps'
              : filterOption === 'favorites'
                ? 'Favorite Maps'
                : 'Recent Maps'}
            {filteredMaps.length > 0 && ` (${filteredMaps.length})`}
          </Heading>
          <Pane display="grid" gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={16}>
            {filteredMaps.map((map) => (
              <MapCard
                key={map.id}
                map={map}
                onDelete={filterOption === 'all' ? handleDeleteMap : undefined}
              />
            ))}
          </Pane>
        </Pane>
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
