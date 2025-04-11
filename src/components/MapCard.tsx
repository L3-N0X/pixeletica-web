import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Pane, Heading, Text, IconButton } from 'evergreen-ui';
import { MapInfo } from '../types/api';
import useFavorites from '../hooks/useFavorites';

interface MapCardProps {
  map: MapInfo;
  onDelete?: (mapId: string) => void;
}

const MapCard: React.FC<MapCardProps> = ({ map, onDelete }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(map.id);

  // Format the date
  const formattedDate = new Date(map.created).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card
      elevation={1}
      background="tint2"
      padding={0}
      borderRadius={8}
      hoverElevation={2}
      position="relative"
    >
      {/* Favorite and Delete buttons */}
      <Pane
        position="absolute"
        top={8}
        right={8}
        zIndex={2}
        display="flex"
        alignItems="center"
        gap={4}
      >
        <IconButton
          icon={isFav ? 'star' : 'star-empty'}
          intent={isFav ? 'warning' : 'none'}
          appearance="minimal"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(map.id);
          }}
          background="rgba(0,0,0,0.6)"
          borderRadius="50%"
          size="small"
        />

        {onDelete && (
          <IconButton
            icon="trash"
            intent="danger"
            appearance="minimal"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(map.id);
            }}
            background="rgba(0,0,0,0.6)"
            borderRadius="50%"
            size="small"
          />
        )}
      </Pane>

      {/* Image and Content */}
      <Link
        to={`/map/${map.id}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <Pane position="relative">
          <img
            src={map.thumbnail}
            alt={map.name}
            style={{
              width: '100%',
              height: '180px',
              objectFit: 'cover',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
            }}
            loading="lazy"
          />
        </Pane>

        <Pane padding={16}>
          <Heading size={500} marginBottom={8} isTruncated>
            {map.name}
          </Heading>

          {map.description && (
            <Text
              color="muted"
              size={300}
              marginBottom={8}
              lineHeight={1.4}
              height={42}
              overflow="hidden"
              display="block"
              title={map.description}
            >
              {map.description.length > 70
                ? `${map.description.substring(0, 70)}...`
                : map.description}
            </Text>
          )}

          <Text size={300} color="muted" display="block">
            {formattedDate}
          </Text>
        </Pane>
      </Link>
    </Card>
  );
};

export default MapCard;
