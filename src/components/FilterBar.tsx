import React from 'react';
import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Tabs,
  TabList,
  Tab,
} from '@chakra-ui/react';
import { SearchIcon, StarIcon } from '@chakra-ui/icons';
import { BsFilter, BsFolder } from 'react-icons/bs'; // React Icons for additional icons

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
  const tabIndex = { all: 0, favorites: 1, recent: 2 }[filterOption];

  // Handle tab change
  const handleTabChange = (index: number) => {
    const options: FilterOption[] = ['all', 'favorites', 'recent'];
    setFilterOption(options[index]);
  };

  return (
    <Box mb={6}>
      <Flex align="center" mb={4}>
        {/* Search Input */}
        <InputGroup maxW="300px" mr={4}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search maps..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </InputGroup>
        <Box flex={1} /> {/* Spacer */}
        {/* Sort Select */}
        <Select
          value={sortOption}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSortOption(e.target.value as SortOption)
          }
          ml={2}
          maxW="180px"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
        </Select>
      </Flex>

      {/* Filter Tabs */}
      <Tabs index={tabIndex} onChange={handleTabChange} variant="line">
        <TabList>
          <Tab>
            <Flex align="center">
              <Box as={BsFilter} mr={2} />
              All Maps
            </Flex>
          </Tab>
          <Tab>
            <Flex align="center">
              <StarIcon mr={2} />
              Favorites
            </Flex>
          </Tab>
          <Tab>
            <Flex align="center">
              <Box as={BsFolder} mr={2} />
              Recent
            </Flex>
          </Tab>
        </TabList>
      </Tabs>
    </Box>
  );
};

export default FilterBar;
