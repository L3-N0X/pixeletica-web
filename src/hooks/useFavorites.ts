import useLocalStorage from './useLocalStorage';

/**
 * A hook to manage favorite maps
 *
 * @returns Object with favorites data and methods to manage them
 */
function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<string[]>('pixeletica-favorites', []);

  const addFavorite = (mapId: string) => {
    setFavorites((prev) => {
      if (prev.includes(mapId)) return prev;
      return [...prev, mapId];
    });
  };

  const removeFavorite = (mapId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== mapId));
  };

  const toggleFavorite = (mapId: string) => {
    setFavorites((prev) => {
      if (prev.includes(mapId)) {
        return prev.filter((id) => id !== mapId);
      } else {
        return [...prev, mapId];
      }
    });
  };

  const isFavorite = (mapId: string) => {
    return favorites.includes(mapId);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}

export default useFavorites;
