import { Button } from '@/components/ui/button';
import { MinusIcon, PlusIcon } from '@radix-ui/react-icons';
import { useMap } from 'react-leaflet';

export function ZoomInButton() {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  return (
    <Button
      variant="default"
      size="icon"
      className="rounded-none rounded-t-md"
      onClick={handleZoomIn}
    >
      <PlusIcon className="h-4 w-4" />
    </Button>
  );
}

export function ZoomOutButton() {
  const map = useMap();

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <Button
      variant="default"
      size="icon"
      className="rounded-none border-t-0 rounded-b-md"
      onClick={handleZoomOut}
    >
      <MinusIcon className="h-4 w-4" />
    </Button>
  );
}
