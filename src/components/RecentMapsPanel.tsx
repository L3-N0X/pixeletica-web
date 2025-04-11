import React from 'react';
import { Link } from 'react-router-dom';
import { Pane, Heading, Text, Button, Card } from 'evergreen-ui';
import useRecentMaps from '../hooks/useRecentMaps';

interface RecentMapsPanelProps {
  onSelectMap?: (mapId: string) => void;
}

const RecentMapsPanel: React.FC<RecentMapsPanelProps> = ({ onSelectMap }) => {
  const { recentMaps, clearRecentMaps } = useRecentMaps();

  if (recentMaps.length === 0) {
    return (
      <Pane padding={16}>
        <Text color="muted">No recently viewed maps</Text>
      </Pane>
    );
  }

  return (
    <Pane>
      <Pane display="flex" alignItems="center" padding="8px 16px">
        <Heading size={400}>Recent Maps</Heading>
        <Pane flex={1} />
        <Button appearance="minimal" size="small" onClick={clearRecentMaps}>
          Clear
        </Button>
      </Pane>

      <Pane>
        {recentMaps.map((map) => {
          const date = new Date(map.timestamp);
          const timeAgo = getTimeAgo(date);

          return (
            <Card
              key={map.id}
              padding={12}
              background="tint2"
              marginX={8}
              marginY={4}
              hoverElevation={1}
              cursor="pointer"
              as={Link}
              to={`/map/${map.id}`}
              onClick={() => onSelectMap?.(map.id)}
              display="flex"
              flexDirection="column"
              textDecoration="none"
            >
              <Text color="default" fontWeight={500}>
                {map.name}
              </Text>
              <Text size={300} color="muted">
                {timeAgo}
              </Text>
            </Card>
          );
        })}
      </Pane>
    </Pane>
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
