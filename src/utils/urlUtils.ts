import { MapViewState } from '../types/mapTypes';

/**
 * Parse URL search parameters for map view state
 */
export const parseMapViewParams = (search: string): Partial<MapViewState> => {
  const params = new URLSearchParams(search);

  const state: Partial<MapViewState> = {};

  const x = params.get('x');
  const y = params.get('y');
  const zoom = params.get('zoom');
  const blockId = params.get('blockId');
  const chunkX = params.get('chunkX');
  const chunkZ = params.get('chunkZ');

  if (x) state.x = Number(x);
  if (y) state.y = Number(y);
  if (zoom) state.zoom = Number(zoom);
  if (blockId) state.selectedBlockId = blockId;
  if (chunkX && chunkZ) {
    state.selectedChunk = {
      x: Number(chunkX),
      z: Number(chunkZ),
    };
  }

  return state;
};

/**
 * Create URL search parameters from map view state
 */
export const createMapViewParams = (state: Partial<MapViewState>): URLSearchParams => {
  const params = new URLSearchParams();

  if (state.x !== undefined) params.set('x', Math.round(state.x).toString());
  if (state.y !== undefined) params.set('y', Math.round(state.y).toString());
  if (state.zoom !== undefined) params.set('zoom', state.zoom.toFixed(2));
  if (state.selectedBlockId) params.set('blockId', state.selectedBlockId);

  if (state.selectedChunk) {
    params.set('chunkX', state.selectedChunk.x.toString());
    params.set('chunkZ', state.selectedChunk.z.toString());
  }

  return params;
};

/**
 * Create a shareable URL for the current map view
 */
export const createShareableMapUrl = (mapId: string, state: Partial<MapViewState>): string => {
  const baseUrl = `${window.location.origin}/map/${mapId}`;
  const params = createMapViewParams(state);

  return `${baseUrl}?${params.toString()}`;
};
