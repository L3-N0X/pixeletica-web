import React, { useState, useEffect } from 'react';
import { Pane, Heading, Card, Paragraph, Spinner } from 'evergreen-ui';
import { Link } from 'react-router-dom';
import { getAvailableMaps } from '@services/mapService';
import type { PixelArtMetadata } from '@types';

const HomePage: React.FC = () => {
  const [maps, setMaps] = useState<PixelArtMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const data = await getAvailableMaps();
        setMaps(data);
      } catch (err) {
        setError('Failed to load available maps. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaps();
  }, []);

  if (loading) {
    return (
      <Pane display="flex" alignItems="center" justifyContent="center" height="100%">
        <Spinner />
      </Pane>
    );
  }

  if (error) {
    return (
      <Pane>
        <Heading size={700} marginBottom={16}>
          Available Maps
        </Heading>
        <Card backgroundColor="#2e2e2e" padding={16} marginBottom={16}>
          <Paragraph color="#ff8a80">{error}</Paragraph>
        </Card>
      </Pane>
    );
  }

  return (
    <Pane>
      <Heading size={700} marginBottom={16}>
        Available Maps
      </Heading>

      {maps.length === 0 ? (
        <Card backgroundColor="#2e2e2e" padding={16} marginBottom={16}>
          <Paragraph>No maps available. Upload an image to create a new map.</Paragraph>
        </Card>
      ) : (
        <Pane display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={16}>
          {maps.map((map) => (
            <Link key={map.name} to={`/map/${map.name}`} style={{ textDecoration: 'none' }}>
              <Card
                backgroundColor="#2e2e2e"
                padding={16}
                elevation={1}
                hoverElevation={2}
                height={200}
                display="flex"
                flexDirection="column"
                cursor="pointer"
              >
                <Heading size={500} marginBottom={8}>
                  {map.displayName}
                </Heading>
                <Paragraph color="#9e9e9e" size={300}>
                  {map.width}x{map.height} pixels
                </Paragraph>
                {map.description && (
                  <Paragraph color="#e0e0e0" size={300} marginTop={8}>
                    {map.description}
                  </Paragraph>
                )}
              </Card>
            </Link>
          ))}
        </Pane>
      )}
    </Pane>
  );
};

export default HomePage;
