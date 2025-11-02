import type { ClothingItem, Outfit, UserProfile } from '../types';

// Generate outfit combinations from wardrobe
export const generateOutfits = (
  wardrobe: ClothingItem[],
  profile: UserProfile,
  count: number = 10
): Outfit[] => {
  const outfits: Outfit[] = [];

  // Separate items by category
  const tops = wardrobe.filter((item) => item.category === 'top');
  const bottoms = wardrobe.filter((item) => item.category === 'bottom');
  const shoes = wardrobe.filter((item) => item.category === 'shoes');
  const accessories = wardrobe.filter((item) => item.category === 'accessory');
  const outerwear = wardrobe.filter((item) => item.category === 'outerwear');

  // Need at least one top, bottom, and shoes to create an outfit
  if (tops.length === 0 || bottoms.length === 0 || shoes.length === 0) {
    return [];
  }

  // Generate random combinations
  const attempts = count * 3; // Try more times to get unique combinations
  const usedCombinations = new Set<string>();

  for (let i = 0; i < attempts && outfits.length < count; i++) {
    const top = tops[Math.floor(Math.random() * tops.length)];
    const bottom = bottoms[Math.floor(Math.random() * bottoms.length)];
    const shoe = shoes[Math.floor(Math.random() * shoes.length)];

    // Create combination key to avoid duplicates
    const comboKey = `${top.id}-${bottom.id}-${shoe.id}`;
    if (usedCombinations.has(comboKey)) continue;

    const items: ClothingItem[] = [top, bottom, shoe];

    // Randomly add accessory (30% chance)
    if (accessories.length > 0 && Math.random() > 0.7) {
      const accessory = accessories[Math.floor(Math.random() * accessories.length)];
      items.push(accessory);
    }

    // Randomly add outerwear (20% chance)
    if (outerwear.length > 0 && Math.random() > 0.8) {
      const outer = outerwear[Math.floor(Math.random() * outerwear.length)];
      items.push(outer);
    }

    // Check color compatibility (simple version)
    if (!areColorsCompatible(items)) continue;

    usedCombinations.add(comboKey);

    outfits.push({
      id: crypto.randomUUID(),
      items,
      createdAt: new Date(),
    });
  }

  return outfits;
};

// Simple color compatibility check
const areColorsCompatible = (items: ClothingItem[]): boolean => {
  // For now, just return true - we can add sophisticated color theory later
  // Future: check complementary colors, avoid too many bold colors, etc.
  return true;
};

// Check if wardrobe meets minimum requirements
export const meetsMinimumRequirements = (wardrobe: ClothingItem[]): boolean => {
  const tops = wardrobe.filter((item) => item.category === 'top').length;
  const bottoms = wardrobe.filter((item) => item.category === 'bottom').length;
  const shoes = wardrobe.filter((item) => item.category === 'shoes').length;

  return tops >= 5 && bottoms >= 3 && shoes >= 2 && wardrobe.length >= 10;
};

// Get wardrobe stats
export const getWardrobeStats = (wardrobe: ClothingItem[]) => {
  return {
    total: wardrobe.length,
    tops: wardrobe.filter((item) => item.category === 'top').length,
    bottoms: wardrobe.filter((item) => item.category === 'bottom').length,
    shoes: wardrobe.filter((item) => item.category === 'shoes').length,
    accessories: wardrobe.filter((item) => item.category === 'accessory').length,
    outerwear: wardrobe.filter((item) => item.category === 'outerwear').length,
  };
};
