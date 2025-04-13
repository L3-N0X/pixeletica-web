import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Pixeletica</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create beautiful 2D pixel map arts & schematics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-10">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-2xl font-semibold mb-2">Create Map Art</h2>
          <p className="text-muted-foreground mb-4">
            Create a new map art design by uploading an image. We will convert it into a map art,
            multiple formats available.
          </p>
          <Link to="/create" className="w-full">
            <Button variant="default" className="w-full">
              Start Creating
            </Button>
          </Link>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-2xl font-semibold mb-2">Browse Maps</h2>
          <p className="text-muted-foreground mb-4">
            Explore already created maps and find inspiration for your next project.
          </p>
          <Link to="/maps" className="w-full">
            <Button variant="default" className="w-full">
              View Maps
            </Button>
          </Link>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-2xl font-semibold mb-2">Tutorial</h2>
          <p className="text-muted-foreground mb-4">
            Learn how to use Pixeletica with our step-by-step tutorial and guides.
          </p>
          <Link to="/tutorial" className="w-full">
            <Button variant="outline" className="w-full">
              View Tutorial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
