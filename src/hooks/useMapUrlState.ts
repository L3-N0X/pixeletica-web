import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapViewState } from '../types/mapTypes';
import { debounce } from './useDebounce';

interface UseMapUrlStateProps {
  mapId: string;
  defaultState: MapViewState;
}

export const useMapUrlState = ({ mapId, defaultState }: UseMapUrlStateProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Parse state from URL query parameters
  const getInitialState = useCallback(() => {
    if (!mapId) return defaultState;

    const searchParams = new URLSearchParams(location.search);

    // Parse coordinates and zoom
    const x = parseFloat(searchParams.get('x') || '') || defaultState.x;
    const y = parseFloat(searchParams.get('y') || '') || defaultState.y;
    const zoom = parseFloat(searchParams.get('zoom') || '') || defaultState.zoom;

    // Parse selected entities
    const selectedBlockId = searchParams.get('block') || undefined;

    // Parse chunk if available
    let selectedChunk: { x: number; z: number } | undefined;
    const chunkX = searchParams.get('chunkX');
    const chunkZ = searchParams.get('chunkZ');

    if (chunkX && chunkZ) {
      selectedChunk = {
        x: parseInt(chunkX, 10),
        z: parseInt(chunkZ, 10),
      };
    }

    return {
      x,
      y,
      zoom,
      selectedBlockId,
      selectedChunk,
      isLoading: defaultState.isLoading,
    };
  }, [location.search, mapId, defaultState]);

  // Update URL when state changes (debounced)
  const updateUrlFromState = useCallback(
    debounce((state: MapViewState) => {
      const searchParams = new URLSearchParams();

      // Only add non-default values to keep URL clean
      if (state.x !== defaultState.x) searchParams.set('x', state.x.toString());
      if (state.y !== defaultState.y) searchParams.set('y', state.y.toString());
      if (state.zoom !== defaultState.zoom) searchParams.set('zoom', state.zoom.toString());

      // Add selected entities if any
      if (state.selectedBlockId) searchParams.set('block', state.selectedBlockId);
      if (state.selectedChunk) {
        searchParams.set('chunkX', state.selectedChunk.x.toString());
        searchParams.set('chunkZ', state.selectedChunk.z.toString());
      }

      // Update URL without full page reload
      navigate(`/map/${mapId}?${searchParams.toString()}`, { replace: true });
    }, 300),
    [navigate, mapId, defaultState]
  );

  // Get a shareable URL with the current view state
  const getShareableUrl = useCallback(
    (state: MapViewState) => {
      const searchParams = new URLSearchParams();

      // Add all relevant state to the URL
      searchParams.set('x', state.x.toString());
      searchParams.set('y', state.y.toString());
      searchParams.set('zoom', state.zoom.toString());

      if (state.selectedBlockId) searchParams.set('block', state.selectedBlockId);
      if (state.selectedChunk) {
        searchParams.set('chunkX', state.selectedChunk.x.toString());
        searchParams.set('chunkZ', state.selectedChunk.z.toString());
      }

      // Generate absolute URL
      const baseUrl = window.location.origin;
      return `${baseUrl}/map/${mapId}?${searchParams.toString()}`;
    },
    [mapId]
  );

  return {
    getInitialState,
    updateUrlFromState,
    getShareableUrl,
  };
};
