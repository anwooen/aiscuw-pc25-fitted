import type { ClothingItem, Outfit, UserProfile, StylePreference, WeatherData, ClothingCategory } from '../types';

// ==========================================
// 1. CONSTANTS & CONFIGURATION
// ==========================================

// Color compatibility matrix based on color theory
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
  ['blue', 'orange'], // High contrast, often clashes
  ['purple', 'yellow'], // Usually too bold
];

// Neutral colors that work as anchors
const NEUTRAL_COLORS = ['black', 'white', 'gray', 'grey', 'beige', 'navy', 'tan', 'khaki', 'cream', 'denim'];

// Light and dark color classifications for smart pairing
const LIGHT_COLORS = ['white', 'cream', 'beige', 'tan', 'pink', 'yellow', 'light'];
const DARK_COLORS = ['black', 'navy', 'brown', 'burgundy', 'maroon', 'dark', 'charcoal'];

// UW Team Colors (school spirit exception for monochrome)
const UW_TEAM_COLORS = ['purple', 'gold'];

// Occasion rules for filtering and fallback
interface OccasionRule {
  allowedStyles?: StylePreference[];
  bannedStyles?: StylePreference[];
  minFormality?: 'casual' | 'business-casual' | 'formal';
  preferredColors?: string[]; // e.g., funeral -> black, navy, charcoal
}

const OCCASION_RULES: Record<string, OccasionRule> = {
  work: {
    bannedStyles: ['athletic', 'streetwear'],
    minFormality: 'business-casual',
  },
  business: {
    allowedStyles: ['formal'],
    minFormality: 'formal',
  },
  interview: {
    allowedStyles: ['formal'],
    minFormality: 'formal',
    preferredColors: ['black', 'navy', 'gray', 'white'],
  },
  gym: {
    allowedStyles: ['athletic'],
  },
  formal: {
    allowedStyles: ['formal'],
    minFormality: 'formal',
  },
  funeral: {
    preferredColors: ['black', 'navy', 'charcoal', 'gray'],
    minFormality: 'formal',
  },
  date: {
    bannedStyles: ['athletic'],
  },
  party: {
    // More permissive
  },
  casual: {
    // Most permissive
  }
};

// Minimum score threshold (user chose fixed low = 0.3)
const MINIMUM_SCORE_THRESHOLD = 0.3;

// ==========================================
// 2. HELPER FUNCTIONS - COLOR & STYLE
// ==========================================

/**
 * Check if a color is neutral
 */
const isNeutral = (color: string): boolean => {
  return NEUTRAL_COLORS.includes(color.toLowerCase());
};

/**
 * Check if a color is light
 */
const isLightColor = (color: string): boolean => {
  const normalized = color.toLowerCase();
  return LIGHT_COLORS.some(c => normalized.includes(c));
};

/**
 * Check if a color is dark
 */
const isDarkColor = (color: string): boolean => {
  const normalized = color.toLowerCase();
  return DARK_COLORS.some(c => normalized.includes(c));
};

/**
 * Check if an item is versatile (neutral color, standard style)
 */
const isVersatileItem = (item: ClothingItem): boolean => {
  const hasNeutralColor = item.colors.some(c => isNeutral(c));
  const isExtremeStyle = item.style?.some(s => ['athletic', 'streetwear'].includes(s));
  return hasNeutralColor && !isExtremeStyle;
};

/**
 * Check if outfit has outerwear
 */
const hasOuterwear = (outfit: ClothingItem[]): boolean => {
  return outfit.some(item => item.category === 'outerwear');
};

/**
 * Check if outfit has shorts
 */
const hasShorts = (outfit: ClothingItem[]): boolean => {
  return outfit.some(item =>
    item.category === 'bottom' &&
    (item.aiAnalysis?.description?.toLowerCase().includes('short') ?? false)
  );
};

/**
 * Check if outfit has long sleeves
 */
const hasLongSleeves = (outfit: ClothingItem[]): boolean => {
  return outfit.some(item =>
    item.category === 'top' &&
    (item.aiAnalysis?.description?.toLowerCase().includes('long') ?? false)
  );
};

/**
 * Check if outfit has white bottoms
 */
const hasWhiteBottoms = (outfit: ClothingItem[]): boolean => {
  return outfit.some(item =>
    item.category === 'bottom' &&
    item.colors.some(color => color.toLowerCase() === 'white')
  );
};

/**
 * Check if outfit has dark colors
 */
const hasDarkColors = (outfit: ClothingItem[]): boolean => {
  return outfit.some(item =>
    item.colors.some(color => isDarkColor(color))
  );
};

/**
 * Get lightest color items from array (for extreme heat)
 */
const getLightestItems = (items: ClothingItem[]): ClothingItem[] => {
  // Prioritize items with light colors
  return items.sort((a, b) => {
    const aLightCount = a.colors.filter(c => isLightColor(c)).length;
    const bLightCount = b.colors.filter(c => isLightColor(c)).length;
    return bLightCount - aLightCount; // Descending
  });
};

/**
 * Check if an item is appropriate for a given occasion (Strict Check)
 */
const isItemAppropriateForOccasion = (item: ClothingItem, occasion: string): boolean => {
  const rule = OCCASION_RULES[occasion.toLowerCase()];
  if (!rule) return true;

  // 1. Check AI Occasion Score if available
  if (item.aiAnalysis?.occasionScores) {
    const score = item.aiAnalysis.occasionScores[occasion as keyof typeof item.aiAnalysis.occasionScores];
    if (score !== undefined) {
      if (score < 4) return false; // AI says it's inappropriate
      if (score > 7) return true; // AI says it's good
    }
  }

  // 2. Check Formality
  if (rule.minFormality && item.aiAnalysis?.formality) {
    const formalityLevels = { 'casual': 1, 'business-casual': 2, 'formal': 3 };
    const itemLevel = formalityLevels[item.aiAnalysis.formality];
    const requiredLevel = formalityLevels[rule.minFormality];
    if (itemLevel < requiredLevel) return false;
  }

  // 3. Check Styles
  if (item.style) {
    if (rule.bannedStyles && item.style.some(s => rule.bannedStyles?.includes(s))) {
      return false;
    }
    if (rule.allowedStyles && !item.style.some(s => rule.allowedStyles?.includes(s))) {
      return false;
    }
  }

  return true;
};

/**
 * Get valid items for a category with Smart 3-Phase Fallback
 * Phase 1: Strict occasion/formality match
 * Phase 2: Versatile/neutral items (e.g., black/white shoes work anywhere)
 * Phase 3: Universal fallback (use what's available - "only 1 shoe" scenario)
 */
const getValidItemsForCategory = (
  wardrobe: ClothingItem[],
  category: ClothingCategory,
  occasion?: string
): ClothingItem[] => {
  const categoryItems = wardrobe.filter(item => item.category === category);

  if (!occasion || categoryItems.length === 0) return categoryItems;

  // Phase 1: Strict Match
  const strictItems = categoryItems.filter(item => isItemAppropriateForOccasion(item, occasion));
  if (strictItems.length > 0) return strictItems;

  // Phase 2: Versatile/Neutral Items (work with most occasions)
  const versatileItems = categoryItems.filter(item => isVersatileItem(item));
  if (versatileItems.length > 0) return versatileItems;

  // Phase 3: Universal Fallback (use anything - scarcity scenario)
  // Example: User only has neon green sneakers → must use them even for funeral
  return categoryItems;
};

// ==========================================
// 3. SCORING FUNCTIONS
// ==========================================

/**
 * Detect if outfit has clashing color combinations or problematic monochrome
 * Returns penalty score (0 = no clash, -0.5 = major clash)
 * EDGE CASE: Context-aware all-white penalties (rain, casual, winter)
 */
const detectColorClash = (outfit: ClothingItem[], weather?: WeatherData, occasion?: string): number => {
  const outfitColors = outfit.flatMap(item =>
    item.colors.map(c => c.toLowerCase())
  );

  // Check for known bad combinations
  for (const clash of COLOR_CLASHES) {
    const hasAllClashColors = clash.every(clashColor =>
      outfitColors.some(outfitColor => outfitColor.includes(clashColor))
    );

    if (hasAllClashColors) {
      return -0.5; // Major penalty
    }
  }

  // Check for monochrome outfits (all same color)
  const uniqueColors = new Set(outfitColors);
  if (uniqueColors.size === 1) {
    const singleColor = Array.from(uniqueColors)[0];

    // All-black: Always acceptable (universally stylish)
    if (singleColor === 'black') {
      return 0;
    }

    // All-white: Context-dependent
    if (singleColor === 'white') {
      let whitePenalty = 0;

      // Penalty for rainy weather (mud/stains)
      if (weather && weather.precipitation > 30) {
        whitePenalty -= 0.3; // Major penalty
      }

      // Penalty for casual/everyday occasions (impractical)
      const casualOccasions = ['casual', 'class', 'work'];
      if (occasion && casualOccasions.includes(occasion.toLowerCase())) {
        whitePenalty -= 0.2;
      }

      // Penalty for cold weather (out of season)
      if (weather && weather.temperature < 50) {
        whitePenalty -= 0.2;
      }

      // If no penalties, all-white is fine (summer party, formal, etc.)
      // But give tiny penalty to encourage color mixing
      if (whitePenalty === 0) {
        whitePenalty = -0.05;
      }

      return whitePenalty;
    }

    // All-navy or all-gray: Boring but safe
    if (['navy', 'gray', 'grey'].includes(singleColor)) {
      return -0.1; // Small penalty for lack of visual interest
    }

    // UW Team Colors: School spirit exception (all-purple or all-gold)
    if (UW_TEAM_COLORS.includes(singleColor)) {
      return 0; // No penalty for Husky pride! Go Dawgs! 🟣🟡
    }

    // All other colors: "Blue Man Group" look
    return -0.3;
  }

  return 0;
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

  if (neutralRatio >= 0.7) {
    bonus += 0.05; // Small bonus for clean, neutral outfits
  }

  return Math.min(bonus, 0.2);
};

/**
 * Calculate color compatibility score between two clothing items
 * Returns a score from 0-1 (1 being most compatible)
 */
export const calculateColorCompatibility = (item1: ClothingItem, item2: ClothingItem): number => {
  if (!item1.colors.length || !item2.colors.length) return 0.5;

  let compatibilityScore = 0;
  let comparisons = 0;

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
        // Smart fallback for unknown combinations
        const color1IsNeutral = NEUTRAL_COLORS.includes(normalizedColor1);
        const color2IsNeutral = NEUTRAL_COLORS.includes(normalizedColor2);

        if (color1IsNeutral || color2IsNeutral) {
          compatibilityScore += 0.6; // Neutrals work with most things
        } else {
          // Check light + dark pairing
          const color1IsLight = isLightColor(normalizedColor1);
          const color2IsLight = isLightColor(normalizedColor2);
          const color1IsDark = isDarkColor(normalizedColor1);
          const color2IsDark = isDarkColor(normalizedColor2);

          if ((color1IsLight && color2IsDark) || (color1IsDark && color2IsLight)) {
            compatibilityScore += 0.5; // Light + dark often works
          } else {
            compatibilityScore += 0.3; // Unknown combination
          }
        }
      }
    }
  }

  return comparisons > 0 ? compatibilityScore / comparisons : 0.5;
};

/**
 * Calculate style consistency score
 * Returns a score from 0-1 based on how well styles mix
 */
const scoreStyleConsistency = (outfit: ClothingItem[]): number => {
  const styles = new Set(outfit.flatMap(item => item.style || []));

  const hasFormal = styles.has('formal');
  const hasAthletic = styles.has('athletic');
  const hasStreetwear = styles.has('streetwear');

  if (hasFormal && hasAthletic) return 0.4; // Blazer + Gym Shorts = Bad
  if (hasFormal && hasStreetwear) return 0.6; // Can work but risky

  return 1.0; // Consistent
};

/**
 * Calculate style score based on user preferences
 */
export const calculateStyleScore = (
  items: ClothingItem[],
  userProfile: UserProfile
): number => {
  const outfitStyles: StylePreference[] = [];

  for (const item of items) {
    if (item.style) {
      outfitStyles.push(...item.style);
    }
  }

  if (outfitStyles.length === 0) return 0.5;

  let totalScore = 0;
  let maxPossibleScore = 0;

  for (const style of outfitStyles) {
    const userPreference = userProfile.stylePreferences[style] || 5;
    totalScore += userPreference;
    maxPossibleScore += 10;
  }

  return maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0.5;
};

/**
 * Calculate favorite color bonus
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

  return Math.min(favoriteMatches.length / favoriteColors.length, 1) * 0.2;
};

/**
 * Calculate weather appropriateness score
 * EDGE CASE: Multi-layering for extreme cold without outerwear
 */
const calculateWeatherScore = (outfit: ClothingItem[], weather: WeatherData): number => {
  let score = 0;
  const temp = weather.temperature;

  // Extreme cold (<20°F) - multi-layering strategy
  if (temp < 20) {
    if (hasOuterwear(outfit)) {
      score += 0.3; // Great!
    } else {
      // Multi-layering fallback: check if we have long sleeves (some protection)
      if (hasLongSleeves(outfit)) {
        score += 0.1; // Better than nothing
      } else {
        score -= 0.4; // Major penalty - too cold
      }
    }
    if (hasShorts(outfit)) score -= 0.5; // Absolutely not
  }
  // Regular cold (20-50°F)
  else if (temp < 50) {
    if (hasOuterwear(outfit)) score += 0.2;
    if (hasLongSleeves(outfit)) score += 0.15;
    if (hasShorts(outfit)) score -= 0.3;
  }
  // Mild weather (50-70°F)
  else if (temp <= 70) {
    score += 0.05; // Sweet spot - most things work
  }
  // Warm weather (70-85°F)
  else if (temp <= 85) {
    if (hasShorts(outfit)) score += 0.15;
    if (!hasLongSleeves(outfit)) score += 0.1;
    if (hasOuterwear(outfit)) score -= 0.15;
  }
  // Extreme heat (>85°F) - prioritize light colors
  else {
    if (hasShorts(outfit)) score += 0.2;
    if (!hasLongSleeves(outfit)) score += 0.15;
    if (hasOuterwear(outfit)) score -= 0.3;
    if (hasDarkColors(outfit)) score -= 0.15; // Dark absorbs heat
  }

  // Precipitation handling
  if (weather.precipitation > 30) {
    if (hasWhiteBottoms(outfit)) score -= 0.2; // Mud stains
  }

  return Math.max(-0.5, Math.min(0.3, score));
};

/**
 * Calculate occasion score using AI analysis
 * Returns null if data unavailable (triggers fallback algorithm)
 */
const calculateOccasionScore = (outfit: ClothingItem[], occasion: string): number | null => {
  const occasionScores: number[] = [];

  for (const item of outfit) {
    const occasionScoresData = item.aiAnalysis?.occasionScores;
    if (!occasionScoresData) {
      return null; // Missing data, use fallback
    }

    const validOccasions = ['work', 'class', 'gym', 'casual', 'social', 'formal', 'date', 'interview'] as const;
    type ValidOccasion = typeof validOccasions[number];

    if (validOccasions.includes(occasion as ValidOccasion)) {
      const score = occasionScoresData[occasion as ValidOccasion];
      occasionScores.push(score);
    } else {
      occasionScores.push(5); // Neutral for unknown occasions
    }
  }

  if (occasionScores.length === 0) return null;

  const avgScore = occasionScores.reduce((sum, score) => sum + score, 0) / occasionScores.length;
  return avgScore / 10; // Convert 0-10 to 0-1
};

/**
 * Main scoring function
 * USER CHOICE: Colors first, occasion second (appearance > rules)
 */
export const scoreOutfit = (
  outfit: ClothingItem[],
  userProfile: UserProfile,
  weather?: WeatherData,
  occasion?: string
): number => {
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
  const styleConsistency = scoreStyleConsistency(outfit);

  // Calculate favorite color bonus
  const favoriteBonus = calculateFavoriteColorBonus(outfit, userProfile.favoriteColors);

  // Calculate weather score
  const weatherScore = weather ? calculateWeatherScore(outfit, weather) : 0;

  // Detect color clashes (context-aware for all-white)
  const clashPenalty = detectColorClash(outfit, weather, occasion);

  // Neutral bonus
  const neutralBonus = calculateNeutralBonus(outfit);

  // Occasion score (if available)
  const occasionScore = occasion ? calculateOccasionScore(outfit, occasion) : null;

  // USER CHOICE: Colors first (50%), Style (30%), Occasion (10%), Favorites (10%)
  // This prioritizes appearance over strict occasion matching
  let baseScore;
  if (occasionScore !== null) {
    // AI occasion data available
    baseScore = (avgColorScore * 0.5) + (styleScore * 0.2) + (styleConsistency * 0.1) + (occasionScore * 0.1) + (favoriteBonus * 0.1);
  } else {
    // No occasion data, focus on color + style
    baseScore = (avgColorScore * 0.5) + (styleScore * 0.3) + (styleConsistency * 0.1) + (favoriteBonus * 0.1);
  }

  // Add modifiers
  const finalScore = baseScore + weatherScore + clashPenalty + neutralBonus;

  return Math.max(0, Math.min(1, finalScore));
};

// ==========================================
// 4. MAIN OUTFIT GENERATOR
// ==========================================

/**
 * Generate outfit combinations from wardrobe
 * EDGE CASES HANDLED:
 * - Scarcity: Returns low-scored outfits if limited wardrobe
 * - Weather: Multi-layering for extreme cold
 * - Occasion: Smart 3-phase fallback
 * - Threshold: Fixed 0.3 minimum
 */
export const generateOutfits = (
  wardrobe: ClothingItem[],
  profile: UserProfile,
  count: number = 10,
  weather?: WeatherData,
  requiredItem?: ClothingItem,
  occasion?: string
): Outfit[] => {
  // 1. Filter wardrobe using Smart 3-Phase Fallback
  const tops = getValidItemsForCategory(wardrobe, 'top', occasion);
  const bottoms = getValidItemsForCategory(wardrobe, 'bottom', occasion);
  let shoes = getValidItemsForCategory(wardrobe, 'shoes', occasion);
  const accessories = getValidItemsForCategory(wardrobe, 'accessory', occasion);
  let outerwear = getValidItemsForCategory(wardrobe, 'outerwear', occasion);

  // EDGE CASE: Extreme heat - prioritize lightest items
  if (weather && weather.temperature > 85) {
    // Re-sort to prioritize light colors
    shoes = getLightestItems(shoes);
  }

  // Need at least one top, bottom, and shoes
  if (tops.length === 0 || bottoms.length === 0 || shoes.length === 0) {
    return [];
  }

  // Apply required item filter
  const filteredTops = requiredItem?.category === 'top' ? [requiredItem] : tops;
  const filteredBottoms = requiredItem?.category === 'bottom' ? [requiredItem] : bottoms;
  const filteredShoes = requiredItem?.category === 'shoes' ? [requiredItem] : shoes;

  const outfitCandidates: { items: ClothingItem[]; score: number }[] = [];

  // 2. Generate combinations
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

      // EDGE CASE: Multi-layering for extreme cold without outerwear
      if (weather && weather.temperature < 20 && outerwear.length > 0) {
        // Always add outerwear in extreme cold
        const bestOuter = outerwear[0];
        items.push(bestOuter);
      } else if (weather && weather.temperature < 50 && outerwear.length > 0) {
        // Regular cold - 70% chance of outerwear
        if (Math.random() > 0.3) {
          items.push(outerwear[Math.floor(Math.random() * outerwear.length)]);
        }
      } else if (outerwear.length > 0 && Math.random() > 0.8) {
        // Fashion layering (small chance)
        items.push(outerwear[Math.floor(Math.random() * outerwear.length)]);
      }

      // Accessories (30% chance)
      if (accessories.length > 0 && Math.random() > 0.7) {
        items.push(accessories[Math.floor(Math.random() * accessories.length)]);
      }

      usedCombinations.add(comboKey);
      const score = scoreOutfit(items, profile, weather, occasion);

      // USER CHOICE: Fixed 0.3 threshold
      if (score >= MINIMUM_SCORE_THRESHOLD) {
        outfitCandidates.push({ items, score });
      }
    }
  } else {
    // Generate all combinations for smaller wardrobes
    // Limit to prevent mobile performance issues
    const limit = 20;
    const safeTops = filteredTops.slice(0, limit);
    const safeBottoms = filteredBottoms.slice(0, limit);
    const safeShoes = filteredShoes.slice(0, limit);

    for (const top of safeTops) {
      for (const bottom of safeBottoms) {
        for (const shoe of safeShoes) {
          const items: ClothingItem[] = [top, bottom, shoe];

          // EDGE CASE: Multi-layering for extreme cold
          if (weather && weather.temperature < 20 && outerwear.length > 0) {
            items.push(outerwear[0]);
          } else if (weather && weather.temperature < 50 && outerwear.length > 0 && Math.random() > 0.3) {
            items.push(outerwear[Math.floor(Math.random() * outerwear.length)]);
          } else if (outerwear.length > 0 && Math.random() > 0.8) {
            items.push(outerwear[Math.floor(Math.random() * outerwear.length)]);
          }

          // Accessories (30% chance)
          if (accessories.length > 0 && Math.random() > 0.7) {
            items.push(accessories[Math.floor(Math.random() * accessories.length)]);
          }

          const score = scoreOutfit(items, profile, weather, occasion);

          if (score >= MINIMUM_SCORE_THRESHOLD) {
            outfitCandidates.push({ items, score });
          }
        }
      }
    }
  }

  // 3. Sort by score and return top N
  outfitCandidates.sort((a, b) => b.score - a.score);

  const outfits: Outfit[] = outfitCandidates.slice(0, count).map(candidate => ({
    id: crypto.randomUUID(),
    items: candidate.items.map(item => ({
      ...item,
      image: item.image || item.id
    })),
    createdAt: new Date(),
    liked: undefined,
  }));

  return outfits;
};

// ==========================================
// 5. UTILITY FUNCTIONS
// ==========================================

/**
 * Check if wardrobe meets minimum requirements
 */
export const meetsMinimumRequirements = (wardrobe: ClothingItem[]): boolean => {
  const tops = wardrobe.filter((item) => item.category === 'top').length;
  const bottoms = wardrobe.filter((item) => item.category === 'bottom').length;
  const shoes = wardrobe.filter((item) => item.category === 'shoes').length;

  return tops >= 5 && bottoms >= 3 && shoes >= 2 && wardrobe.length >= 10;
};

/**
 * Get wardrobe stats
 */
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
