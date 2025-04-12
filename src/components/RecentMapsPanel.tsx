import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Flex, Heading, Text, Button, Card, CardBody, Stack } from '@chakra-ui/react';
import useRecentMaps from '../hooks/useRecentMaps';

interface RecentMapsPanelProps {
  onSelectMap?: (mapId: string) => void;
}

const RecentMapsPanel: React.FC<RecentMapsPanelProps> = ({ onSelectMap }) => {
  const { recentMaps, clearRecentMaps } = useRecentMaps();

  if (recentMaps.length === 0) {
    return (
      <Box padding={4}>
        <Text color="gray.500">No recently viewed maps</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Flex align="center" padding="8px 16px">
        <Heading size="sm">Recent Maps</Heading>
        <Box flex={1} />
        <Button variant="ghost" size="sm" onClick={clearRecentMaps}>
          Clear
        </Button>
      </Flex>

      <Stack borderSpacing={2} px={2}>
        {recentMaps.map((map) => {
          const date = new Date(map.timestamp);
          const timeAgo = getTimeAgo(date);

          return (
            <Card.Root
              key={map.id}
              p={3}
              bg="gray.75"
              mx={2}
              my={1}
              _hover={{ shadow: 'md', bg: 'gray.100' }}
              cursor="pointer"
            >
              <CardBody p={0}>
                <RouterLink
                  to={`/map/${map.id}`}
                  onClick={() => onSelectMap?.(map.id)}
                  style={{ textDecoration: 'none' }}
                >
                  <Text fontWeight={500} color="text">
                    {map.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {timeAgo}
                  </Text>
                </RouterLink>
              </CardBody>
            </Card.Root>
          );
        })}
      </Stack>
    </Box>
  );
};

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }
  if (diffHours > 0) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  if (diffMins > 0) {
    return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
  }
  return 'Just now';
}

export default RecentMapsPanel;
