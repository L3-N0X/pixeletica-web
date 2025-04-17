import { Button } from '@/components/ui/button';
import { H1, H3, P } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { listMaps, MapInfo, getMapMetadata, MapMetadata, getMapThumbnailUrl } from '@/api/maps';
import { Link } from 'react-router-dom';

export default function Maps() {
  const [maps, setMaps] = useState<MapInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapMetadata, setMapMetadata] = useState<Record<string, MapMetadata>>({});

  // Fetch maps data on component mount
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        setIsLoading(true);
        const response = await listMaps();
        setMaps(response.maps);

        // Fetch metadata for each map to get dimensions
        const metadataPromises = response.maps.map((map) =>
          getMapMetadata(map.id)
            .then((metadata) => ({ id: map.id, metadata }))
            .catch((err) => {
              console.error(`Error fetching metadata for map ${map.id}:`, err);
              return { id: map.id, metadata: null };
            })
        );

        const metadataResults = await Promise.allSettled(metadataPromises);
        const metadataMap: Record<string, MapMetadata> = {};

        metadataResults.forEach((result) => {
          if (result.status === 'fulfilled' && result.value.metadata) {
            metadataMap[result.value.id] = result.value.metadata;
          }
        });

        setMapMetadata(metadataMap);
      } catch (err) {
        console.error('Error fetching maps:', err);
        setError('Failed to load maps. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaps();
  }, []);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Get dimensions string if metadata is available
  const getDimensions = (mapId: string) => {
    const metadata = mapMetadata[mapId];
    if (metadata && metadata.width && metadata.height) {
      return `${metadata.width}×${metadata.height}`;
    }
    return 'Unknown size';
  };

  return (
    <div className="space-y-6 container mx-auto">
      <div>
        <H1 className="mb-2">Explore Maps</H1>
        <P className="text-muted-foreground">
          Browse your converted pixel art designs for inspiration
        </P>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-16 w-16 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Loading maps...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="p-6 text-center bg-destructive/10 border-destructive text-destructive">
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      ) : maps.length === 0 ? (
        <Card className="p-8 text-center">
          <H3 className="mb-2">No Maps Found</H3>
          <P className="text-muted-foreground mb-6">
            You haven't created any maps yet. Start by creating your first pixel art map!
          </P>
          <Button asChild>
            <Link to="/create">Create New Map</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {maps.map((map) => (
            <Card
              key={map.id}
              className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300"
            >
              <div className="aspect-video relative overflow-hidden bg-muted">
                <img
                  src={getMapThumbnailUrl(map.id)}
                  alt={map.name}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                  }}
                />
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <div className="mb-2 flex-grow">
                  <H3 className="text-base line-clamp-1">{map.name}</H3>
                  {map.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {map.description}
                    </p>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground mt-auto">
                  <span className="truncate">{formatDate(map.created)}</span>
                  <span>{getDimensions(map.id)}</span>
                </div>
                <div className="flex flex-col items-center gap-2 justify-between mt-3">
                  <Button variant="secondary" size="sm" asChild className="w-full">
                    <Link to={`/maps/${map.id}`}>Open in Map Viewer</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to={`/results/${map.id}`}>View Results</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
