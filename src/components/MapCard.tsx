import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card as ChakraCard, // Rename to avoid conflict
  CardBody,
  Heading,
  Text,
  IconButton,
  Badge,
  Image,
  Flex,
  useRecipe,
} from '@chakra-ui/react';
import { cardRecipe } from '../theme/recipes/card.recipe';
import { MapInfo } from '../types/api';
import useFavorites from '../hooks/useFavorites';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { LuDelete, LuHeart, LuHeartCrack } from 'react-icons/lu';

interface MapCardProps {
  map: MapInfo;
  onDelete?: (mapId: string) => void;
}

const MapCard: React.FC<MapCardProps> = ({ map, onDelete }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(map.id);
  const { isMobile } = useResponsiveLayout();

  // Get card styles from theme recipe
  const styles = useRecipe({ recipe: cardRecipe, variant: 'default' });

  // Format the date
  const formattedDate = new Date(map.created).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <RouterLink to={`/map/${map.id}`} style={{ textDecoration: 'none' }}>
      <ChakraCard.Root
        {...styles}
        overflow="hidden" // Ensure image corners are clipped
        position="relative"
        transition="all 0.2s ease"
        bg="rgba(17, 34, 24, 0.8)"
        borderColor="rgba(81, 123, 102, 0.3)"
        _hover={{
          transform: 'translateY(-4px)',
          boxShadow: 'lg', // Use theme shadow token
          borderColor: 'rgba(146, 232, 184, 0.4)',
        }}
      >
        {/* Favorite and Delete buttons */}
        <Flex
          position="absolute"
          top={3} // Adjust position
          right={3}
          zIndex={2}
          gap={2} // Use theme spacing
        >
          <IconButton
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            colorScheme={isFav ? 'yellow' : 'gray'} // Use colorScheme
            variant="ghost" // Use ghost for minimal appearance
            rounded={'full'}
            size="sm"
            bg="rgba(0,0,0,0.7)"
            color={isFav ? 'yellow.400' : 'white'}
            boxShadow="md"
            _hover={{ bg: 'rgba(0,0,0,0.9)' }}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              // Add type for event
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(map.id);
            }}
          >
            {isFav ? <LuHeartCrack /> : <LuHeart />}
          </IconButton>

          {onDelete && (
            <IconButton
              aria-label="Delete map"
              colorScheme="red" // Use colorScheme
              variant="ghost"
              rounded={'full'}
              size="sm"
              bg="rgba(0,0,0,0.7)"
              color="red.400"
              boxShadow="md"
              _hover={{ bg: 'rgba(0,0,0,0.9)' }}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                // Add type for event
                e.preventDefault();
                e.stopPropagation();
                onDelete(map.id);
              }}
            >
              <LuDelete />
            </IconButton>
          )}
        </Flex>

        {/* Image and Content */}
        <Box position="relative" height="200px" overflow="hidden">
          <Image
            src={map.thumbnail}
            alt={map.name}
            width="100%"
            height="100%"
            objectFit="cover"
            loading="lazy"
          />
          {/* Gradient overlay */}
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            height="80px"
            bgGradient="linear(to-t, rgba(5, 10, 7, 0.8), transparent)"
          />
        </Box>

        <CardBody p={isMobile ? 3 : 4}>
          {' '}
          {/* Use CardBody and responsive padding */}
          <Heading size="md" mb={2} fontFamily="body">
            {' '}
            {/* Use noOfLines */}
            {map.name}
          </Heading>
          {map.description && (
            <Text
              color="muted"
              fontSize="sm"
              mb={3}
              lineHeight="short" // Use theme line height
              title={map.description}
            >
              {map.description}
            </Text>
          )}
          <Flex align="center" justify="space-between">
            <Text fontSize="xs" color="muted">
              {' '}
              {/* Adjust size */}
              {formattedDate}
            </Text>
            <Badge colorScheme="blue" variant="subtle">
              {' '}
              {/* Use colorScheme */}
              View Map
            </Badge>
          </Flex>
        </CardBody>
      </ChakraCard.Root>
    </RouterLink>
  );
};

export default MapCard;
