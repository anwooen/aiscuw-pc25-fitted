import { useStore } from '../store/useStore';
import { getWardrobeStats, meetsMinimumRequirements } from '../utils/outfitGenerator';

export const useWardrobe = () => {
  const wardrobe = useStore((state) => state.wardrobe);
  const addClothingItem = useStore((state) => state.addClothingItem);
  const removeClothingItem = useStore((state) => state.removeClothingItem);

  const stats = getWardrobeStats(wardrobe);
  const canSwipe = meetsMinimumRequirements(wardrobe);

  return {
    wardrobe,
    addClothingItem,
    removeClothingItem,
    stats,
    canSwipe,
  };
};
