import { BoundedTileLayerProps } from '@/types/map-types';
import { BLOCK_SIZE } from '@/constants/map-constants';
import L from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export function BoundedTileLayerComponent({
  mapId,
  metadata,
  layerName = 'Minecraft Map',
}: BoundedTileLayerProps) {
  const map = useMap();
  const baseUrl = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || '/api';

  useEffect(() => {
    if (!metadata || !mapId || !map) return; // Ensure map instance is available

    // Define the getTileUrl function directly
    const getTileUrl = (coords: L.Coords): string => {
      const zoom = coords.z;

      const zoomLevelData = metadata.zoomLevels?.find((zl) => zl.zoomLevel === zoom);
      const tilesX = zoomLevelData?.tiles_x ?? 1;
      const tilesZ = zoomLevelData?.tiles_z ?? 1;
      const maxTileX = tilesX - 1;
      const maxTileY = tilesZ - 1;

      if (coords.x < 0 || coords.y < 0 || coords.x > maxTileX || coords.y > maxTileY) {
        console.warn(
          // Use warn for visibility
          `Tile out of bounds: z=${zoom}, x=${coords.x}, y=${coords.y}. Max: x=${maxTileX}, y=${maxTileY}`
        );
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      }

      const tileUrl = `${baseUrl}/map/${mapId}/tiles/${zoom}/${coords.x}/${coords.y}.${
        metadata.tileFormat || 'png'
      }`;
      console.debug(`[TileLayer] Requesting tile: ${tileUrl}`);
      return tileUrl;
    };

    // Create the instance using L.TileLayer directly with the custom getTileUrl
    // Pass an empty string initially for the URL template, as getTileUrl overrides it.
    const tileLayer = new L.TileLayer('', {
      attribution: `© ${layerName}`,
      maxZoom: metadata.maxZoom ?? 10,
      minZoom: metadata.minZoom ?? 0,
      noWrap: true,
      tileSize: metadata.tileSize,
      className: 'pixelated-image',
      // getTileUrl cannot be passed in options
    });

    // Assign the custom getTileUrl function AFTER creating the instance
    tileLayer.getTileUrl = getTileUrl;

    // Add using whenReady, checking for the tile pane
    map.whenReady(() => {
      // Check map instance and specifically if the tile pane exists
      const tilePane = map.getPane('tilePane');
      if (map && typeof map.addLayer === 'function' && tilePane) {
        tileLayer.addTo(map);

        // Convert metadata dimensions to block coordinates for proper bounds
        const widthInBlocks = metadata.width / BLOCK_SIZE;
        const heightInBlocks = metadata.height / BLOCK_SIZE;

        // Calculate bounds in block coordinates (divide by 16 since 16px = 1 block)
        const mapBounds = L.latLngBounds([
          [0, 0], // Top-left corner
          [heightInBlocks, widthInBlocks], // Bottom-right corner
        ]);

        map.fitBounds(mapBounds);

        // Log current center after fitting bounds
        const center = map.getCenter();
      } else {
        console.error(
          'Map or tilePane unavailable when trying to add layer. Map:',
          !!map,
          'addLayer:',
          typeof map?.addLayer,
          'tilePane:',
          !!tilePane
        );
      }
    });

    // Cleanup
    return () => {
      // Check map instance and if layer exists before removing
      if (map && typeof map.removeLayer === 'function' && map.hasLayer(tileLayer)) {
        map.removeLayer(tileLayer);
      }
    };
    // Dependencies: map instance, metadata, mapId, layerName, baseUrl
  }, [map, mapId, metadata, layerName, baseUrl]);

  return null; // This component doesn't render anything itself
}
