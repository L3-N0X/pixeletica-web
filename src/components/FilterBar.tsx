import React from 'react';
import { Box, Flex, Input, Select, Tabs, createListCollection } from '@chakra-ui/react';
import { BsFilter, BsFolder, BsStar } from 'react-icons/bs';

// Type exports
export type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc';
export type FilterOption = 'all' | 'favorites' | 'recent';

interface FilterBarProps {
  search: string;
  setSearch: (value: string) => void;
  filterOption: FilterOption;
  setFilterOption: (value: FilterOption) => void;
  sortOption: SortOption;
  setSortOption: (value: SortOption) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  search,
  setSearch,
  filterOption,
  setFilterOption,
  sortOption,
  setSortOption,
}) => {
  // Map filterOption to tab index for Chakra Tabs
  const filterOptions: FilterOption[] = ['all', 'favorites', 'recent'];
  const tabIndex = filterOptions.indexOf(filterOption);

  return (
    <Box p={4} bg="white" boxShadow="md" borderRadius="md">
      <Flex direction={{ base: 'column', md: 'row' }} gap={4} align="center">
        <Input
          placeholder="Search maps..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
        {/* Sort Select */}
        <Select.Root
          collection={createListCollection({
            items: [
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'name-desc', label: 'Name (Z-A)' },
            ],
          })}
          value={[sortOption]}
          onValueChange={(details) => {
            if (details.value[0]) {
              setSortOption(details.value[0] as SortOption);
            }
          }}
          width="180px"
        >
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Sort by..." />
            </Select.Trigger>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              <Select.Item item={{ value: 'newest', label: 'Newest First' }}>
                Newest First
              </Select.Item>
              <Select.Item item={{ value: 'oldest', label: 'Oldest First' }}>
                Oldest First
              </Select.Item>
              <Select.Item item={{ value: 'name-asc', label: 'Name (A-Z)' }}>
                Name (A-Z)
              </Select.Item>
              <Select.Item item={{ value: 'name-desc', label: 'Name (Z-A)' }}>
                Name (Z-A)
              </Select.Item>
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Flex>
      {/* Filter Tabs - Added margin-top for better spacing */}
      <Tabs.Root defaultValue={filterOption} tabIndex={tabIndex} mt={4}>
        <Tabs.List>
          <Tabs.Trigger value="all" onClick={() => setFilterOption('all')}>
            <Flex align="center">
              <Box as={BsFilter} mr={2} />
              All Maps
            </Flex>
          </Tabs.Trigger>
          <Tabs.Trigger value="favorites" onClick={() => setFilterOption('favorites')}>
            <Flex align="center">
              <Box as={BsStar} mr={2} />
              Favorites
            </Flex>
          </Tabs.Trigger>
          <Tabs.Trigger value="recent" onClick={() => setFilterOption('recent')}>
            <Flex align="center">
              <Box as={BsFolder} mr={2} />
              Recent
            </Flex>
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>
    </Box>
  );
};

export default FilterBar;
