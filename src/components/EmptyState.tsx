import React from 'react';
import { Box, Flex, Heading, Text, Icon } from '@chakra-ui/react';
import { FaBookmark } from 'react-icons/fa'; // Example using react-icons

interface EmptyStateProps {
  title: string;
  description?: string;
  orientation?: 'vertical' | 'horizontal';
  iconBgColor?: string;
  icon?: 'bookmark' | string; // Allow specific icons or potentially others
  height?: number | string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  orientation = 'vertical',
  iconBgColor = 'gray.100', // Use theme token
  icon,
  height = 'auto',
}) => {
  // Render the appropriate icon based on the icon prop
  const renderIcon = () => {
    if (icon === 'bookmark') {
      // Use react-icons or Chakra icons
      return <Icon as={FaBookmark} boxSize={6} color="gray.500" />;
    }
    // Add more icon mappings as needed
    return null; // Return null if no icon specified or matched
  };

  const iconElement = renderIcon(); // Get the icon element

  return (
    <Flex
      direction={orientation === 'horizontal' ? 'row' : 'column'}
      align="center"
      justify="center"
      p={8}
      bg="gray.75" // Use theme token
      borderRadius="md" // Use theme token for consistency
      h={height}
      textAlign={orientation === 'horizontal' ? 'left' : 'center'}
    >
      {iconElement && ( // Render only if iconElement is not null
        <Flex
          boxSize="48px" // Use boxSize for square dimensions
          borderRadius="full" // Use 'full' for circle
          align="center"
          justify="center"
          bg={iconBgColor}
          mr={orientation === 'horizontal' ? 4 : 0}
          mb={orientation === 'vertical' ? 4 : 0}
        >
          {iconElement}
        </Flex>
      )}
      <Box>
        <Heading size="lg" mb={2} color="text">
          {' '}
          {/* Use theme token */}
          {title}
        </Heading>
        {description && (
          <Text fontSize="md" color="muted">
            {' '}
            {/* Use theme token */}
            {description}
          </Text>
        )}
      </Box>
    </Flex>
  );
};

export default EmptyState;
