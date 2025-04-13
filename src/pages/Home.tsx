import { Button } from '@/components/ui/button';
import { H1, H2, Lead, P } from '@/components/ui/typography';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <H1 className="mb-4">Welcome to Pixeletica</H1>
        <Lead className="max-w-2xl mx-auto">Create beautiful 2D pixel map arts & schematics</Lead>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-10">
        <div className="bg-card p-6 rounded-lg border border-border flex flex-col ">
          <div>
            <H2 className="mb-2">Create Map Art</H2>
            <P className="text-muted-foreground mb-4">
              Create a new map art design by uploading an image. We will convert it into a map art,
              multiple formats available.
            </P>
          </div>
          <Link to="/create" className="w-full mt-auto">
            <Button variant="default" className="w-full">
              Start Creating
            </Button>
          </Link>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border flex flex-col ">
          <div>
            <H2 className="mb-2">Browse Maps</H2>
            <P className="text-muted-foreground mb-4">
              Explore already created maps and find inspiration for your next project.
            </P>
          </div>
          <Link to="/maps" className="w-full mt-auto">
            <Button variant="default" className="w-full">
              View Maps
            </Button>
          </Link>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border flex flex-col ">
          <div>
            <H2 className="mb-2">Tutorial</H2>
            <P className="text-muted-foreground mb-4">
              Learn how to use Pixeletica with our step-by-step tutorial and guides.
            </P>
          </div>
          <Link to="/tutorial" className="w-full mt-auto">
            <Button variant="outline" className="w-full">
              View Tutorial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
