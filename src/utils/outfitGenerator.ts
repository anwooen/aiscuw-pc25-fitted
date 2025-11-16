import type { ClothingItem, Outfit, UserProfile, StylePreference, WeatherData } from '../types';

// Color compatibility matrix based on color theory
// Each color maps to colors it pairs well with
const COLOR_COMPATIBILITY: Record<string, string[]> = {
  // Neutrals go with everything
  black: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'red', 'blue', 'green', 'purple', 'pink', 'yellow', 'orange', 'tan', 'khaki', 'cream', 'olive', 'maroon', 'burgundy'],
  white: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'red', 'blue', 'green', 'purple', 'pink', 'yellow', 'orange', 'tan', 'khaki', 'cream', 'olive', 'maroon', 'burgundy'],
  gray: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'red', 'blue', 'green', 'purple', 'pink', 'yellow', 'orange', 'tan', 'khaki', 'cream', 'olive', 'maroon', 'burgundy'],
  grey: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'red', 'blue', 'green', 'purple', 'pink', 'yellow', 'orange', 'tan', 'khaki', 'cream', 'olive', 'maroon', 'burgundy'],
  beige: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'blue', 'green', 'pink', 'red', 'tan', 'khaki', 'cream', 'olive'],
  brown: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'green', 'orange', 'yellow', 'red', 'tan', 'khaki', 'cream', 'olive'],
  tan: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'blue', 'green', 'red', 'tan', 'khaki', 'cream', 'olive'],
  khaki: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'blue', 'green', 'red', 'tan', 'khaki', 'cream', 'olive'],
  cream: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'blue', 'green', 'pink', 'red', 'tan', 'khaki', 'cream'],

  // Navy is versatile (acts like a neutral)
  navy: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'red', 'pink', 'yellow', 'orange', 'green', 'tan', 'khaki', 'cream', 'burgundy'],

  // Primary colors (limited pairings to avoid clashing)
  red: ['black', 'white', 'gray', 'grey', 'navy', 'beige', 'blue', 'pink', 'tan', 'khaki', 'cream'],
  blue: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'red', 'pink', 'green', 'tan', 'khaki', 'cream'],
  yellow: ['black', 'white', 'gray', 'grey', 'navy', 'brown', 'blue', 'purple', 'tan', 'khaki'],

  // Secondary colors
  green: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'blue', 'tan', 'khaki', 'cream', 'olive'],
  purple: ['black', 'white', 'gray', 'grey', 'pink', 'navy', 'cream'],
  orange: ['black', 'white', 'gray', 'grey', 'navy', 'brown', 'blue', 'tan', 'khaki', 'cream'],
  pink: ['black', 'white', 'gray', 'grey', 'beige', 'navy', 'blue', 'purple', 'red', 'cream'],

  // Earth tones
  olive: ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'navy', 'tan', 'khaki', 'cream', 'green'],
  burgundy: ['black', 'white', 'gray', 'grey', 'beige', 'navy', 'tan', 'khaki', 'cream'],
  maroon: ['black', 'white', 'gray', 'grey', 'beige', 'navy', 'tan', 'khaki', 'cream'],
};

// Color clash detection: combinations that should be avoided
const COLOR_CLASHES: string[][] = [
  // Warm color overload (too loud together)
  ['red', 'orange', 'yellow'],
  ['red', 'yellow', 'orange'],
  ['orange', 'red', 'yellow'],
  ['orange', 'yellow', 'red'],
  ['yellow', 'red', 'orange'],
  ['yellow', 'orange', 'red'],

  // Competing bright colors
  ['red', 'green'], // Christmas vibes unless intentional
  ['purple', 'orange'], // Too loud
  ['pink', 'orange'], // Clashing tones
  ['yellow', 'pink'], // Too bright
];

// Neutral colors that work as anchors
const NEUTRAL_COLORS = ['black', 'white', 'gray', 'grey', 'beige', 'navy', 'tan', 'khaki', 'cream'];

/**
 * Detect if outfit has clashing color combinations
 * Returns penalty score (0 = no clash, -0.3 = major clash)
 */
const detectColorClash = (outfit: ClothingItem[]): number => {
  const outfitColors = outfit.flatMap(item =>
    item.colors.map(c => c.toLowerCase())
  );

  // Check for known bad combinations
  for (const clash of COLOR_CLASHES) {
    const hasAllClashColors = clash.every(clashColor =>
      outfitColors.some(outfitColor => outfitColor.includes(clashColor))
    );

    if (hasAllClashColors) {
      return -0.3; // Major penalty for clashing colors
    }
  }

  // Check for monochrome outfits (all same color) - EXCEPT black/white
  const uniqueColors = new Set(outfitColors);
  if (uniqueColors.size === 1) {
    const singleColor = Array.from(uniqueColors)[0];
    // Allow all-black or all-white outfits
    if (singleColor !== 'black' && singleColor !== 'white') {
      return -0.2; // Penalty for monochrome (all blue, all red, etc.)
    }
  }

  return 0; // No clash detected
};

/**
 * Calculate neutral bonus for outfits with neutral shoes or neutral color schemes
 * Returns bonus score (0 to +0.2)
 */
const calculateNeutralBonus = (outfit: ClothingItem[]): number => {
  let bonus = 0;

  // Check if outfit has neutral shoes (black/white get priority)
  const shoes = outfit.find(item => item.category === 'shoes');
  if (shoes) {
    const shoeColors = shoes.colors.map(c => c.toLowerCase());
    if (shoeColors.some(c => c === 'black' || c === 'white')) {
      bonus += 0.15; // Big bonus for black/white shoes
    } else if (shoeColors.some(c => NEUTRAL_COLORS.includes(c))) {
      bonus += 0.1; // Smaller bonus for other neutral shoes
    }
  }

  // Check if overall outfit has neutral color scheme
  const allColors = outfit.flatMap(item => item.colors.map(c => c.toLowerCase()));
  const neutralColorCount = allColors.filter(c => NEUTRAL_COLORS.includes(c)).length;
  const neutralRatio = neutralColorCount / Math.max(allColors.length, 1);

  // Bonus for outfits that are mostly neutral (cleaner, safer)
  if (neutralRatio >= 0.7) {
    bonus += 0.05; // Small bonus for clean, neutral outfits
  }

  return Math.min(bonus, 0.2); // Cap at 0.2
};

/**
 * Calculate color compatibility score between two clothing items
 * Returns a score from 0-1 (1 being most compatible)
 * Uses hybrid approach: matrix for common colors, smart fallback for unusual combinations
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

      // Check compatibility matrix (primary approach)
      const compatible = COLOR_COMPATIBILITY[normalizedColor1]?.includes(normalizedColor2) ||
                        COLOR_COMPATIBILITY[normalizedColor2]?.includes(normalizedColor1);

      if (compatible) {
        compatibilityScore += 0.8;
      } else {
        // HYBRID FALLBACK: For unknown combinations, use smart heuristics
        // If at least one color is neutral, it's probably okay
        const color1IsNeutral = NEUTRAL_COLORS.includes(normalizedColor1);
        const color2IsNeutral = NEUTRAL_COLORS.includes(normalizedColor2);

        if (color1IsNeutral || color2IsNeutral) {
          compatibilityScore += 0.6; // Better score if one is neutral
        } else {
          // Both are non-neutral colors not in our matrix
          // Check if they're complementary tones (light + dark)
          const lightColors = ['cream', 'beige', 'tan', 'pink', 'yellow', 'light'];
          const darkColors = ['navy', 'black', 'brown', 'burgundy', 'maroon', 'dark'];

          const color1IsLight = lightColors.some(c => normalizedColor1.includes(c));
          const color2IsLight = lightColors.some(c => normalizedColor2.includes(c));
          const color1IsDark = darkColors.some(c => normalizedColor1.includes(c));
          const color2IsDark = darkColors.some(c => normalizedColor2.includes(c));

          if ((color1IsLight && color2IsDark) || (color1IsDark && color2IsLight)) {
            compatibilityScore += 0.5; // Light + dark often works
          } else {
            compatibilityScore += 0.3; // Truly unknown combination
          }
        }
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
 * Helper: Check if outfit has outerwear
 */
const hasOuterwear = (outfit: ClothingItem[]): boolean => {
  return outfit.some(item => item.category === 'outerwear');
};

/**
 * Helper: Check if outfit has shorts (bottom with "short" in description)
 */
const hasShorts = (outfit: ClothingItem[]): boolean => {
  return outfit.some(item =>
    item.category === 'bottom' &&
    (item.aiAnalysis?.description?.toLowerCase().includes('short') ?? false)
  );
};

/**
 * Helper: Check if outfit has long sleeves (top with "long" in description)
 */
const hasLongSleeves = (outfit: ClothingItem[]): boolean => {
  return outfit.some(item =>
    item.category === 'top' &&
    (item.aiAnalysis?.description?.toLowerCase().includes('long') ?? false)
  );
};

/**
 * Helper: Check if outfit has white bottoms
 */
const hasWhiteBottoms = (outfit: ClothingItem[]): boolean => {
  return outfit.some(item =>
    item.category === 'bottom' &&
    item.colors.some(color => color.toLowerCase() === 'white')
  );
};

/**
 * Helper: Check if outfit has dark colors (black, navy, brown, dark gray)
 */
const hasDarkColors = (outfit: ClothingItem[]): boolean => {
  const darkColors = ['black', 'navy', 'brown', 'dark gray', 'charcoal'];
  return outfit.some(item =>
    item.colors.some(color => darkColors.includes(color.toLowerCase()))
  );
};

/**
 * Calculate weather appropriateness score for an outfit
 * Returns a bonus/penalty from -0.3 to +0.3
 */
const calculateWeatherScore = (outfit: ClothingItem[], weather: WeatherData): number => {
  let score = 0;
  const temp = weather.temperature;

  // Temperature-based scoring
  if (temp < 50) {
    // Cold weather (<50°F)
    if (hasOuterwear(outfit)) score += 0.2;
    if (hasLongSleeves(outfit)) score += 0.15;
    if (hasShorts(outfit)) score -= 0.3; // Penalize shorts in cold
  } else if (temp > 70) {
    // Warm weather (>70°F)
    if (hasShorts(outfit)) score += 0.2;
    if (!hasLongSleeves(outfit)) score += 0.1; // Prefer short sleeves
    if (hasOuterwear(outfit)) score -= 0.2; // Too warm for jacket
    if (hasDarkColors(outfit)) score -= 0.1; // Dark colors absorb heat
  } else {
    // Mild weather (50-70°F) - most versatile
    score += 0.05; // Small bonus for being in the sweet spot
  }

  // Precipitation-based scoring
  if (weather.precipitation > 30) {
    // Rainy weather
    if (hasWhiteBottoms(outfit)) score -= 0.2; // Avoid mud stains
    // Could add: waterproof shoes bonus if we had that data
  }

  // Clamp score to reasonable range
  return Math.max(-0.3, Math.min(0.3, score));
};

/**
 * Calculate occasion appropriateness score for an outfit
 * Returns normalized score from 0-1 if AI occasion data available, null otherwise (fallback to existing algorithm)
 *
 * @param outfit - Array of clothing items
 * @param occasion - Target occasion (work, class, gym, casual, social, formal, date, interview)
 * @returns Score 0-1 if occasion data exists, null if should use fallback algorithm
 */
const calculateOccasionScore = (outfit: ClothingItem[], occasion: string): number | null => {
  // Collect all occasion scores from items
  const occasionScores: number[] = [];

  for (const item of outfit) {
    const occasionScoresData = item.aiAnalysis?.occasionScores;
    if (!occasionScoresData) {
      // If ANY item lacks occasion data, fall back to existing algorithm
      return null;
    }

    // Get the score for the target occasion
    const validOccasions = ['work', 'class', 'gym', 'casual', 'social', 'formal', 'date', 'interview'] as const;
    type ValidOccasion = typeof validOccasions[number];

    if (validOccasions.includes(occasion as ValidOccasion)) {
      const score = occasionScoresData[occasion as ValidOccasion];
      occasionScores.push(score);
    } else {
      // Unknown occasion, use neutral score
      occasionScores.push(5); // 5/10 = neutral
    }
  }

  // If we have no scores, fall back
  if (occasionScores.length === 0) {
    return null;
  }

  // Calculate average occasion score and normalize to 0-1
  const avgScore = occasionScores.reduce((sum, score) => sum + score, 0) / occasionScores.length;
  return avgScore / 10; // Convert 0-10 scale to 0-1
};

/**
 * Score a complete outfit based on color compatibility, style, user preferences, weather, and occasion
 */
export const scoreOutfit = (
  outfit: ClothingItem[],
  userProfile: UserProfile,
  weather?: WeatherData,
  occasion?: string
): number => {
  if (outfit.length < 2) return 0;

  // SMART FALLBACK: Check if we have occasion data
  const occasionScore = occasion ? calculateOccasionScore(outfit, occasion) : null;

  // If occasion scoring is requested AND available, use occasion-based algorithm
  if (occasionScore !== null) {
    // OCCASION-BASED ALGORITHM
    // Heavily weight occasion appropriateness (70%), with color/style/weather as secondary

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

    // Calculate weather score (if available)
    const weatherScore = weather ? calculateWeatherScore(outfit, weather) : 0;

    // Detect color clashes (penalty)
    const clashPenalty = detectColorClash(outfit);

    // Neutral shoe/color bonus
    const neutralBonus = calculateNeutralBonus(outfit);

    // Weighted final score (occasion-focused)
    // Base: Occasion (70%) + Color (15%) + Style (10%) + Favorites (5%)
    // Modifiers: Weather + Clash Penalty + Neutral Bonus
    const favoriteBonus = calculateFavoriteColorBonus(outfit, userProfile.favoriteColors);
    const baseScore = (occasionScore * 0.7) + (avgColorScore * 0.15) + (styleScore * 0.1) + (favoriteBonus * 0.05);
    const finalScore = baseScore + weatherScore + clashPenalty + neutralBonus;

    return finalScore;
  } else {
    // FALLBACK: Use existing algorithm (no occasion data available)
    // This ensures backward compatibility with items that haven't been re-analyzed

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

    // Calculate weather score (if weather data available)
    const weatherScore = weather ? calculateWeatherScore(outfit, weather) : 0;

    // Detect color clashes (penalty)
    const clashPenalty = detectColorClash(outfit);

    // Neutral shoe/color bonus
    const neutralBonus = calculateNeutralBonus(outfit);

    // Weighted final score (original algorithm)
    // Base score: Color (50%) + Style (40%) + Favorites (10%)
    // Modifiers: Weather (-0.3 to +0.3) + Clash Penalty (-0.3 to 0) + Neutral Bonus (0 to +0.2)
    const baseScore = (avgColorScore * 0.5) + (styleScore * 0.4) + (favoriteBonus * 0.1);
    const finalScore = baseScore + weatherScore + clashPenalty + neutralBonus;

    return finalScore;
  }
};

// Generate outfit combinations from wardrobe
export const generateOutfits = (
  wardrobe: ClothingItem[],
  profile: UserProfile,
  count: number = 10,
  weather?: WeatherData,
  requiredItem?: ClothingItem,
  occasion?: string
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

  // If there's a required item, filter the appropriate category
  const filteredTops = requiredItem?.category === 'top' ? [requiredItem] : tops;
  const filteredBottoms = requiredItem?.category === 'bottom' ? [requiredItem] : bottoms;
  const filteredShoes = requiredItem?.category === 'shoes' ? [requiredItem] : shoes;

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
      const top = filteredTops[Math.floor(Math.random() * filteredTops.length)];
      const bottom = filteredBottoms[Math.floor(Math.random() * filteredBottoms.length)];
      const shoe = filteredShoes[Math.floor(Math.random() * filteredShoes.length)];

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
      const score = scoreOutfit(items, profile, weather, occasion);

      // Only keep outfits with decent scores (> 0.3)
      if (score > 0.3) {
        outfitCandidates.push({ items, score });
      }
    }
  } else {
    // Generate all combinations for smaller wardrobes
    for (const top of filteredTops) {
      for (const bottom of filteredBottoms) {
        for (const shoe of filteredShoes) {
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

          const score = scoreOutfit(items, profile, weather, occasion);

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

  // Convert to Outfit objects and ensure image property is set for all items
  const outfits: Outfit[] = outfitCandidates.slice(0, count).map(candidate => ({
    id: crypto.randomUUID(),
    items: candidate.items.map(item => ({
      ...item,
      image: item.id // Ensure image property matches the item ID
    })),
    createdAt: new Date(),
    liked: undefined,
  }));

  return outfits;
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
