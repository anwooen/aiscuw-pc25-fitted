import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { generateOutfits } from '../utils/outfitGenerator';
import type { Outfit } from '../types';

export const useOutfitGenerator = (count: number = 10) => {
  const wardrobe = useStore((state) => state.wardrobe);
  const profile = useStore((state) => state.profile);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = () => {
    setLoading(true);
    // Add slight delay for UX (feels more intentional)
    setTimeout(() => {
      const generated = generateOutfits(wardrobe, profile, count);
      setOutfits(generated);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    if (wardrobe.length > 0) {
      generate();
    }
  }, [wardrobe.length]);

  return {
    outfits,
    loading,
    regenerate: generate,
  };
};
