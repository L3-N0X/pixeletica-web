import { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapViewState } from '../types/mapTypes';
import { parseMapViewParams, createMapViewParams } from '../utils/urlUtils';
import { debounce } from '../utils/debounce';

interface UseMapUrlStateOptions {
  mapId: string;
  defaultState: MapViewState;
}

/**
 * Hook to synchronize map view state with URL parameters
 */
export const useMapUrlState = ({ mapId, defaultState }: UseMapUrlStateOptions) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Parse initial state from URL
  const getInitialState = useCallback(() => {
    const urlState = parseMapViewParams(location.search);
    return { ...defaultState, ...urlState };
  }, [defaultState, location.search]);

  // Update URL with current state
  const updateUrlFromState = useCallback(
    debounce((state: Partial<MapViewState>) => {
      const params = createMapViewParams(state);
      navigate(`/map/${mapId}?${params.toString()}`, { replace: true });
    }, 500),
    [mapId, navigate]
  );

  // Create a shareable URL with the current view state
  const getShareableUrl = useCallback(
    (state: Partial<MapViewState>) => {
      const baseUrl = `${window.location.origin}/map/${mapId}`;
      const params = createMapViewParams(state);
      return `${baseUrl}?${params.toString()}`;
    },
    [mapId]
  );

  return {
    getInitialState,
    updateUrlFromState,
    getShareableUrl,
  };
};
