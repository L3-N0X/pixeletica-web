import { Button } from '@/components/ui/button';
import { H1, H3, Muted, P } from '@/components/ui/typography';

export default function Maps() {
  // Sample map data - in a real app this would come from an API
  const sampleMaps = [
    {
      id: 1,
      title: 'Castle Pixel Art',
      author: 'BlockMaster',
      dimensions: '64×64',
      created: '2025-03-28',
    },
    {
      id: 2,
      title: 'Space Invader',
      author: 'RetroGamer',
      dimensions: '32×32',
      created: '2025-04-01',
    },
    {
      id: 3,
      title: 'Minecraft Logo',
      author: 'PixelPro',
      dimensions: '128×64',
      created: '2025-03-15',
    },
    {
      id: 4,
      title: 'Sunset Landscape',
      author: 'ArtisticBlock',
      dimensions: '64×32',
      created: '2025-04-05',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <H1 className="mb-2">Explore Maps</H1>
        <P className="text-muted-foreground">
          Browse community-created pixel art designs for inspiration
        </P>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-full">
          <div className="grid gap-4 md:grid-cols-3">
            {sampleMaps.map((map) => (
              <div key={map.id} className="bg-card p-4 rounded-lg border border-border">
                <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center">
                  <Muted>Map Preview</Muted>
                </div>
                <H3 className="text-base">{map.title}</H3>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>by {map.author}</span>
                  <span>{map.dimensions}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <Button variant="outline" size="sm">
                    Open in Map Viewer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
