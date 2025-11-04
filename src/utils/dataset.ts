/**
 * Dataset utilities for Kaggle fashion dataset (clean.csv)
 * Ensures consistent data cleaning and type mappings
 */

import { ClothingCategory } from '../types';

// ===== ARTICLE MAPPINGS (0-13) =====
// These mappings MUST match the clean.csv encoding
export const ARTICLE_CODES = {
  SHIRT: 0,
  JEAN: 1,
  SWEATPANT: 2,
  TEE: 3,
  SHOE: 4,
  OTHER: 5,
  JACKET: 6,
  SHORT: 7,
  DRESS: 8,
  RAIN_JACKET: 9,
  SKIRT: 10,
  BLAZER: 11,
  TROUSER: 12,
  LEGGING: 13,
} as const;

export const ARTICLE_NAMES: Record<number, string> = {
  0: 'Shirt',
  1: 'Jean',
  2: 'Sweatpant',
  3: 'Tee',
  4: 'Shoe',
  5: 'Other',
  6: 'Jacket',
  7: 'Short',
  8: 'Dress',
  9: 'Rain Jacket',
  10: 'Skirt',
  11: 'Blazer',
  12: 'Trouser',
  13: 'Legging',
};

// ===== SEASON MAPPINGS (0-3) =====
// These mappings MUST match the clean.csv encoding
export const SEASON_CODES = {
  FALL: 0,
  SUMMER: 1,
  WINTER: 2,
  SPRING: 3,
} as const;

export const SEASON_NAMES: Record<number, string> = {
  0: 'Fall',
  1: 'Summer',
  2: 'Winter',
  3: 'Spring',
};

// ===== CATEGORY MAPPING =====
// Maps article types to our app's ClothingCategory
export const ARTICLE_TO_CATEGORY: Record<number, ClothingCategory> = {
  0: 'top',        // Shirt
  1: 'bottom',     // Jean
  2: 'bottom',     // Sweatpant
  3: 'top',        // Tee
  4: 'shoes',      // Shoe
  5: 'accessory',  // Other
  6: 'outerwear',  // Jacket
  7: 'bottom',     // Short
  8: 'top',        // Dress (can be worn as top or full outfit)
  9: 'outerwear',  // Rain Jacket
  10: 'bottom',    // Skirt
  11: 'outerwear', // Blazer
  12: 'bottom',    // Trouser
  13: 'bottom',    // Legging
};

// ===== DATASET ROW TYPE =====
export interface DatasetRow {
  id: number;
  article: number;  // 0-13
  season: number;   // 0-3
}

// ===== DECODED ROW TYPE =====
export interface DecodedDatasetRow {
  id: number;
  article: {
    code: number;
    name: string;
    category: ClothingCategory;
  };
  season: {
    code: number;
    name: string;
  };
}

// ===== DECODER FUNCTIONS =====

/**
 * Decodes article code to human-readable name
 */
export function decodeArticle(code: number): string {
  if (code < 0 || code > 13) {
    console.warn(`Invalid article code: ${code}. Defaulting to "Other"`);
    return 'Other';
  }
  return ARTICLE_NAMES[code];
}

/**
 * Decodes season code to human-readable name
 */
export function decodeSeason(code: number): string {
  if (code < 0 || code > 3) {
    console.warn(`Invalid season code: ${code}. Defaulting to "Fall"`);
    return 'Fall';
  }
  return SEASON_NAMES[code];
}

/**
 * Maps article code to our app's ClothingCategory
 */
export function articleToCategory(code: number): ClothingCategory {
  if (code < 0 || code > 13) {
    console.warn(`Invalid article code: ${code}. Defaulting to "accessory"`);
    return 'accessory';
  }
  return ARTICLE_TO_CATEGORY[code];
}

/**
 * Maps season code to lowercase season string for AI types
 */
export function seasonToAIFormat(code: number): 'spring' | 'summer' | 'fall' | 'winter' | 'all-season' {
  const seasonName = decodeSeason(code).toLowerCase() as 'spring' | 'summer' | 'fall' | 'winter';
  return seasonName;
}

/**
 * Fully decodes a dataset row with all metadata
 */
export function decodeRow(row: DatasetRow): DecodedDatasetRow {
  return {
    id: row.id,
    article: {
      code: row.article,
      name: decodeArticle(row.article),
      category: articleToCategory(row.article),
    },
    season: {
      code: row.season,
      name: decodeSeason(row.season),
    },
  };
}

// ===== CSV PARSING =====

/**
 * Parses clean.csv content into DatasetRow objects
 * Maintains consistency with CSV format: id,article,season
 */
export function parseCSV(csvContent: string): DatasetRow[] {
  const lines = csvContent.trim().split('\n');

  // Skip header row
  const dataLines = lines.slice(1);

  return dataLines
    .map((line, index) => {
      const parts = line.trim().split(',');

      if (parts.length !== 3) {
        console.warn(`Skipping malformed line ${index + 2}: ${line}`);
        return null;
      }

      const id = parseInt(parts[0], 10);
      const article = parseInt(parts[1], 10);
      const season = parseInt(parts[2], 10);

      // Validate data
      if (isNaN(id) || isNaN(article) || isNaN(season)) {
        console.warn(`Skipping invalid data on line ${index + 2}: ${line}`);
        return null;
      }

      if (article < 0 || article > 13) {
        console.warn(`Invalid article code ${article} on line ${index + 2}`);
        return null;
      }

      if (season < 0 || season > 3) {
        console.warn(`Invalid season code ${season} on line ${index + 2}`);
        return null;
      }

      return { id, article, season };
    })
    .filter((row): row is DatasetRow => row !== null);
}

// ===== DATASET LOADING =====

let cachedDataset: DatasetRow[] | null = null;

/**
 * Loads the clean.csv dataset (with caching)
 */
export async function loadDataset(): Promise<DatasetRow[]> {
  if (cachedDataset) {
    return cachedDataset;
  }

  try {
    const response = await fetch('/clean.csv');

    if (!response.ok) {
      throw new Error(`Failed to load dataset: ${response.statusText}`);
    }

    const csvContent = await response.text();
    cachedDataset = parseCSV(csvContent);

    console.log(`Loaded ${cachedDataset.length} items from clean.csv`);
    return cachedDataset;
  } catch (error) {
    console.error('Error loading dataset:', error);
    return [];
  }
}

// ===== SEARCH & FILTER FUNCTIONS =====

/**
 * Filters dataset by category
 */
export function filterByCategory(
  dataset: DatasetRow[],
  category: ClothingCategory
): DatasetRow[] {
  return dataset.filter((row) => articleToCategory(row.article) === category);
}

/**
 * Filters dataset by season
 */
export function filterBySeason(
  dataset: DatasetRow[],
  season: 'spring' | 'summer' | 'fall' | 'winter'
): DatasetRow[] {
  const seasonCode = {
    spring: SEASON_CODES.SPRING,
    summer: SEASON_CODES.SUMMER,
    fall: SEASON_CODES.FALL,
    winter: SEASON_CODES.WINTER,
  }[season];

  return dataset.filter((row) => row.season === seasonCode);
}

/**
 * Filters dataset by article type
 */
export function filterByArticle(dataset: DatasetRow[], articleCode: number): DatasetRow[] {
  return dataset.filter((row) => row.article === articleCode);
}

/**
 * Gets random sample from dataset
 */
export function getRandomSample(dataset: DatasetRow[], count: number): DatasetRow[] {
  const shuffled = [...dataset].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Gets distribution statistics for the dataset
 */
export function getDatasetStats(dataset: DatasetRow[]) {
  const articleCounts: Record<number, number> = {};
  const seasonCounts: Record<number, number> = {};
  const categoryCounts: Record<ClothingCategory, number> = {
    top: 0,
    bottom: 0,
    shoes: 0,
    accessory: 0,
    outerwear: 0,
  };

  dataset.forEach((row) => {
    // Count articles
    articleCounts[row.article] = (articleCounts[row.article] || 0) + 1;

    // Count seasons
    seasonCounts[row.season] = (seasonCounts[row.season] || 0) + 1;

    // Count categories
    const category = articleToCategory(row.article);
    categoryCounts[category]++;
  });

  return {
    total: dataset.length,
    byArticle: Object.entries(articleCounts).map(([code, count]) => ({
      code: parseInt(code, 10),
      name: decodeArticle(parseInt(code, 10)),
      count,
    })),
    bySeason: Object.entries(seasonCounts).map(([code, count]) => ({
      code: parseInt(code, 10),
      name: decodeSeason(parseInt(code, 10)),
      count,
    })),
    byCategory: categoryCounts,
  };
}

// ===== EXPORT ALL =====
export default {
  ARTICLE_CODES,
  ARTICLE_NAMES,
  SEASON_CODES,
  SEASON_NAMES,
  ARTICLE_TO_CATEGORY,
  decodeArticle,
  decodeSeason,
  articleToCategory,
  seasonToAIFormat,
  decodeRow,
  parseCSV,
  loadDataset,
  filterByCategory,
  filterBySeason,
  filterByArticle,
  getRandomSample,
  getDatasetStats,
};
