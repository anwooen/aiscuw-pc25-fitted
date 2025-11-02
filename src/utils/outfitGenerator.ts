import type { ClothingItem, Outfit, UserProfile, StylePreference } from '../types';

// Color compatibility matrix based on color theory
// Each color maps to colors it pairs well with
const COLOR_COMPATIBILITY: Record<string, string[]> = {
  // Neutrals go with everything
  black: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'red', 'blue', 'green', 'purple', 'pink', 'yellow', 'orange'],
  white: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'red', 'blue', 'green', 'purple', 'pink', 'yellow', 'orange'],
  gray: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'red', 'blue', 'green', 'purple', 'pink', 'yellow', 'orange'],
  grey: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'red', 'blue', 'green', 'purple', 'pink', 'yellow', 'orange'],
  beige: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'blue', 'green', 'pink', 'red'],
  brown: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'green', 'orange', 'yellow', 'red'],

  // Navy is versatile
  navy: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'red', 'pink', 'yellow', 'orange', 'green'],

  // Primary colors
  red: ['black', 'white', 'gray', 'grey', 'navy', 'beige', 'blue', 'pink'],
  blue: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'red', 'yellow', 'orange', 'pink', 'green'],
  yellow: ['black', 'white', 'gray', 'grey', 'navy', 'brown', 'blue', 'purple', 'green'],

  // Secondary colors
  green: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'yellow', 'orange', 'blue'],
  purple: ['black', 'white', 'gray', 'grey', 'yellow', 'pink', 'navy'],
  orange: ['black', 'white', 'gray', 'grey', 'navy', 'brown', 'blue', 'green'],
  pink: ['black', 'white', 'gray', 'grey', 'beige', 'navy', 'blue', 'purple', 'red'],
};

/**
 * Calculate color compatibility score between two clothing items
 * Returns a score from 0-1 (1 being most compatible)
 */
export const calculateColorCompatibility = (item1: ClothingItem, item2: ClothingItem): number => {
  if (!item1.colors.length || !item2.colors.length) return 0.5; // Neutral if no color info

  let compatibilityScore = 0;
  let comparisons = 0;

  // Check all color combinations between the two items
  for (const color1 of item1.colors) {
    const normalizedColor1 = color1.toLowerCase();
    for (const color2 of item2.colors) {
      const normalizedColor2 = color2.toLowerCase();
      comparisons++;

      // Same color always matches
      if (normalizedColor1 === normalizedColor2) {
        compatibilityScore += 1;
        continue;
      }

      // Check compatibility matrix
      const compatible = COLOR_COMPATIBILITY[normalizedColor1]?.includes(normalizedColor2) ||
                        COLOR_COMPATIBILITY[normalizedColor2]?.includes(normalizedColor1);

      if (compatible) {
        compatibilityScore += 0.8;
      } else {
        // Unknown combinations get a lower score
        compatibilityScore += 0.3;
      }
    }
  }

  return comparisons > 0 ? compatibilityScore / comparisons : 0.5;
};

/**
 * Calculate style compatibility score for an outfit
 * Returns a score from 0-1 based on user preferences
 */
export const calculateStyleScore = (
  items: ClothingItem[],
  userProfile: UserProfile
): number => {
  // Collect all styles from the outfit items
  const outfitStyles: StylePreference[] = [];

  for (const item of items) {
    if (item.style) {
      outfitStyles.push(...item.style);
    }
  }

  if (outfitStyles.length === 0) return 0.5; // Neutral if no style info

  // Calculate weighted score based on user preferences
  let totalScore = 0;
  let maxPossibleScore = 0;

  for (const style of outfitStyles) {
    const userPreference = userProfile.stylePreferences[style] || 5;
    totalScore += userPreference;
    maxPossibleScore += 10; // Max preference is 10
  }

  return maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0.5;
};

/**
 * Calculate favorite color bonus
 * Returns additional score if outfit contains user's favorite colors
 */
export const calculateFavoriteColorBonus = (
  items: ClothingItem[],
  favoriteColors: string[]
): number => {
  if (!favoriteColors.length) return 0;

  const outfitColors = items.flatMap(item =>
    item.colors.map(c => c.toLowerCase())
  );

  const favoriteMatches = favoriteColors.filter(fav =>
    outfitColors.includes(fav.toLowerCase())
  );

  // Bonus score: 0 to 0.2 based on how many favorite colors are present
  return Math.min(favoriteMatches.length / favoriteColors.length, 1) * 0.2;
};

/**
 * Score a complete outfit based on color compatibility, style, and user preferences
 */
export const scoreOutfit = (outfit: ClothingItem[], userProfile: UserProfile): number => {
  if (outfit.length < 2) return 0;

  // Calculate pairwise color compatibility
  let colorScore = 0;
  let pairs = 0;

  for (let i = 0; i < outfit.length; i++) {
    for (let j = i + 1; j < outfit.length; j++) {
      colorScore += calculateColorCompatibility(outfit[i], outfit[j]);
      pairs++;
    }
  }

  const avgColorScore = pairs > 0 ? colorScore / pairs : 0.5;

  // Calculate style score
  const styleScore = calculateStyleScore(outfit, userProfile);

  // Calculate favorite color bonus
  const favoriteBonus = calculateFavoriteColorBonus(outfit, userProfile.favoriteColors);

  // Weighted final score
  // Color compatibility: 50%, Style: 40%, Favorite colors: 10%
  const finalScore = (avgColorScore * 0.5) + (styleScore * 0.4) + (favoriteBonus * 0.1);

  return finalScore;
};

// Generate outfit combinations from wardrobe
export const generateOutfits = (
  wardrobe: ClothingItem[],
  profile: UserProfile,
  count: number = 10
): Outfit[] => {
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

  const outfitCandidates: { items: ClothingItem[]; score: number }[] = [];

  // Generate combinations with scoring
  // If wardrobe is small, generate all combinations
  // If large, sample randomly
  const maxCombinations = tops.length * bottoms.length * shoes.length;
  const shouldSampleRandomly = maxCombinations > count * 20;

  if (shouldSampleRandomly) {
    // Random sampling for large wardrobes
    const attempts = count * 10;
    const usedCombinations = new Set<string>();

    for (let i = 0; i < attempts && outfitCandidates.length < count * 2; i++) {
      const top = tops[Math.floor(Math.random() * tops.length)];
      const bottom = bottoms[Math.floor(Math.random() * bottoms.length)];
      const shoe = shoes[Math.floor(Math.random() * shoes.length)];

      const comboKey = `${top.id}-${bottom.id}-${shoe.id}`;
      if (usedCombinations.has(comboKey)) continue;

      const items: ClothingItem[] = [top, bottom, shoe];

      // Randomly add accessory (30% chance)
      if (accessories.length > 0 && Math.random() > 0.7) {
        const accessory = accessories[Math.floor(Math.random() * accessories.length)];
        items.push(accessory);
      }

      // Randomly add outerwear (50% chance)
      if (outerwear.length > 0 && Math.random() > 0.5) {
        const outer = outerwear[Math.floor(Math.random() * outerwear.length)];
        items.push(outer);
      }

      usedCombinations.add(comboKey);
      const score = scoreOutfit(items, profile);

      // Only keep outfits with decent scores (> 0.3)
      if (score > 0.3) {
        outfitCandidates.push({ items, score });
      }
    }
  } else {
    // Generate all combinations for smaller wardrobes
    for (const top of tops) {
      for (const bottom of bottoms) {
        for (const shoe of shoes) {
          const items: ClothingItem[] = [top, bottom, shoe];

          // Optionally add outerwear (50% chance if available)
          if (outerwear.length > 0 && Math.random() > 0.5) {
            const randomOuterwear = outerwear[Math.floor(Math.random() * outerwear.length)];
            items.push(randomOuterwear);
          }

          // Optionally add accessory (30% chance if available)
          if (accessories.length > 0 && Math.random() > 0.7) {
            const randomAccessory = accessories[Math.floor(Math.random() * accessories.length)];
            items.push(randomAccessory);
          }

          const score = scoreOutfit(items, profile);

          // Only keep outfits with decent scores (> 0.3)
          if (score > 0.3) {
            outfitCandidates.push({ items, score });
          }
        }
      }
    }
  }

  // Sort by score (highest first) and take top N
  outfitCandidates.sort((a, b) => b.score - a.score);

  // Convert to Outfit objects
  const outfits: Outfit[] = outfitCandidates.slice(0, count).map(candidate => ({
    id: crypto.randomUUID(),
    items: candidate.items,
    createdAt: new Date(),
    liked: undefined,
  }));

  return outfits;
};

// Simple color compatibility check (legacy - kept for backwards compatibility)
const areColorsCompatible = (items: ClothingItem[]): boolean => {
  // Use the new scoring system - accept if average pairwise compatibility > 0.3
  if (items.length < 2) return true;

  let totalCompatibility = 0;
  let pairs = 0;

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      totalCompatibility += calculateColorCompatibility(items[i], items[j]);
      pairs++;
    }
  }

  return pairs > 0 ? (totalCompatibility / pairs) > 0.3 : true;
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
