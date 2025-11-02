import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { getWardrobeStats, meetsMinimumRequirements } from '../utils/outfitGenerator';

export const useWardrobe = () => {
  const wardrobe = useStore((state) => state.wardrobe);
  const addClothingItem = useStore((state) => state.addClothingItem);
  const removeClothingItem = useStore((state) => state.removeClothingItem);

  // Memoize expensive calculations
  const stats = useMemo(() => getWardrobeStats(wardrobe), [wardrobe]);
  const canSwipe = useMemo(() => meetsMinimumRequirements(wardrobe), [wardrobe]);

  return {
    wardrobe,
    addClothingItem,
    removeClothingItem,
    stats,
    canSwipe,
  };
};
