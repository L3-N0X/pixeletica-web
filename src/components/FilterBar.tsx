import React from 'react';
import {
  Pane,
  SearchInput,
  Button,
  SegmentedControl,
  Menu,
  Popover,
  Position,
  SidebarIcon,
} from 'evergreen-ui';

export type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc';
export type FilterOption = 'all' | 'favorites' | 'recent';

interface FilterBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  filterOption: FilterOption;
  onFilterChange: (option: FilterOption) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  sortOption,
  onSortChange,
  filterOption,
  onFilterChange,
}) => {
  return (
    <Pane
      display="flex"
      flexWrap="wrap"
      alignItems="center"
      gap={16}
      marginBottom={24}
      padding={16}
      background="tint2"
      borderRadius={8}
    >
      {/* Search */}
      <Pane flex={1} minWidth={200}>
        <SearchInput
          width="100%"
          placeholder="Search maps..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
        />
      </Pane>

      {/* Filter */}
      <Pane minWidth={300}>
        <SegmentedControl
          width="100%"
          options={[
            { label: 'All Maps', value: 'all' },
            { label: 'Favorites', value: 'favorites' },
            { label: 'Recent', value: 'recent' },
          ]}
          value={filterOption}
          onChange={(value) => onFilterChange(value as FilterOption)}
        />
      </Pane>

      {/* Sort */}
      <Pane>
        <Popover
          position={Position.BOTTOM_RIGHT}
          content={
            <Menu>
              <Menu.Group title="Sort by">
                <Menu.Item
                  icon={sortOption === 'newest' ? 'tick' : undefined}
                  onSelect={() => onSortChange('newest')}
                >
                  Newest First
                </Menu.Item>
                <Menu.Item
                  icon={sortOption === 'oldest' ? 'tick' : undefined}
                  onSelect={() => onSortChange('oldest')}
                >
                  Oldest First
                </Menu.Item>
                <Menu.Item
                  icon={sortOption === 'name-asc' ? 'tick' : undefined}
                  onSelect={() => onSortChange('name-asc')}
                >
                  Name (A-Z)
                </Menu.Item>
                <Menu.Item
                  icon={sortOption === 'name-desc' ? 'tick' : undefined}
                  onSelect={() => onSortChange('name-desc')}
                >
                  Name (Z-A)
                </Menu.Item>
              </Menu.Group>
            </Menu>
          }
        >
          <Button iconBefore={SidebarIcon}>Sort</Button>
        </Popover>
      </Pane>
    </Pane>
  );
};

export default FilterBar;
