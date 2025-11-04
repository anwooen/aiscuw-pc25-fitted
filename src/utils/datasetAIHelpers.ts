/**
 * AI Helper utilities that leverage the Kaggle dataset
 * Provides context and examples for better AI recommendations
 */

import {
  loadDataset,
  getDatasetStats,
  filterByCategory,
  filterBySeason,
  getRandomSample,
  decodeRow,
  ARTICLE_NAMES,
  articleToCategory,
} from './dataset';
import type { ClothingCategory, StylePreference } from '../types';

/**
 * Generates dataset context for AI prompts
 * Useful for giving the AI understanding of clothing distribution
 */
export async function getDatasetContext(): Promise<string> {
  const dataset = await loadDataset();
  const stats = getDatasetStats(dataset);

  let context = `You have access to a fashion dataset with ${stats.total} clothing items. Here's the distribution:\n\n`;

  context += 'Categories:\n';
  Object.entries(stats.byCategory).forEach(([category, count]) => {
    const percentage = ((count / stats.total) * 100).toFixed(1);
    context += `- ${category}: ${count} items (${percentage}%)\n`;
  });

  context += '\nSeasons:\n';
  stats.bySeason.forEach(({ name, count }) => {
    const percentage = ((count / stats.total) * 100).toFixed(1);
    context += `- ${name}: ${count} items (${percentage}%)\n`;
  });

  context += '\nArticle types:\n';
  stats.byArticle
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10
    .forEach(({ name, count }) => {
      const percentage = ((count / stats.total) * 100).toFixed(1);
      context += `- ${name}: ${count} items (${percentage}%)\n`;
    });

  return context;
}

/**
 * Gets example clothing items for a specific category
 * Useful for giving AI concrete examples when analyzing images
 */
export async function getExamplesForCategory(
  category: ClothingCategory,
  count: number = 5
): Promise<string[]> {
  const dataset = await loadDataset();
  const filtered = filterByCategory(dataset, category);
  const samples = getRandomSample(filtered, count);

  return samples.map((row) => {
    const decoded = decodeRow(row);
    return `${decoded.article.name} (${decoded.season.name})`;
  });
}

/**
 * Gets seasonal suggestions based on dataset
 */
export async function getSeasonalContext(
  targetSeason: 'spring' | 'summer' | 'fall' | 'winter'
): Promise<{
  popularArticles: string[];
  categoryBreakdown: Record<ClothingCategory, number>;
}> {
  const dataset = await loadDataset();
  const seasonalItems = filterBySeason(dataset, targetSeason);

  // Count article types in this season
  const articleCounts: Record<number, number> = {};
  seasonalItems.forEach((item) => {
    articleCounts[item.article] = (articleCounts[item.article] || 0) + 1;
  });

  // Get top articles for this season
  const popularArticles = Object.entries(articleCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([code]) => ARTICLE_NAMES[parseInt(code, 10)]);

  // Category breakdown
  const categoryBreakdown: Record<ClothingCategory, number> = {
    top: 0,
    bottom: 0,
    shoes: 0,
    accessory: 0,
    outerwear: 0,
  };

  seasonalItems.forEach((item) => {
    const category = articleToCategory(item.article);
    categoryBreakdown[category]++;
  });

  return { popularArticles, categoryBreakdown };
}

/**
 * Generates a system prompt for GPT-4o Vision clothing analysis
 * Includes dataset context for better accuracy
 */
export async function generateVisionAnalysisPrompt(
  userPreferences?: Record<StylePreference, number>
): Promise<string> {
  const datasetContext = await getDatasetContext();

  let prompt = `You are an expert fashion analyst helping users categorize and describe their clothing items.

${datasetContext}

When analyzing a clothing image:
1. Identify the article type (Shirt, Jean, Shoe, etc.)
2. Determine the primary category (top/bottom/shoes/outerwear/accessory)
3. Extract visible colors (be specific: "navy blue" not just "blue")
4. Suggest style tags (casual, formal, streetwear, athletic, preppy)
5. Recommend appropriate season(s)
6. Assess formality level (casual/business-casual/formal)

`;

  if (userPreferences) {
    prompt += '\nUser style preferences (0-10 scale):\n';
    Object.entries(userPreferences).forEach(([style, score]) => {
      prompt += `- ${style}: ${score}/10\n`;
    });
    prompt +=
      '\nConsider these preferences when suggesting style tags, but prioritize accuracy.\n';
  }

  prompt += `
Return your analysis in JSON format:
{
  "description": "A detailed 2-3 sentence description",
  "suggestedCategory": "top|bottom|shoes|outerwear|accessory",
  "detectedColors": ["color1", "color2", ...],
  "suggestedStyles": ["casual", "formal", ...],
  "season": "spring|summer|fall|winter|all-season",
  "formality": "casual|business-casual|formal",
  "occasion": ["everyday", "work", "athletic", ...]
}`;

  return prompt;
}

/**
 * Generates a system prompt for outfit recommendations
 */
export async function generateOutfitRecommendationPrompt(
  wardrobeSize: number,
  weatherCondition?: string,
  temperature?: number
): Promise<string> {
  const datasetContext = await getDatasetContext();

  let prompt = `You are an expert fashion stylist creating outfit recommendations.

${datasetContext}

You have a wardrobe with ${wardrobeSize} items to work with.
`;

  if (weatherCondition && temperature !== undefined) {
    prompt += `\nCurrent weather: ${weatherCondition}, ${temperature}°F\n`;
    prompt +=
      'Prioritize weather-appropriate items (e.g., shorts for hot weather, jackets for cold).\n';
  }

  prompt += `
Create 5-10 complete outfits that:
1. Include at least: 1 top, 1 bottom, 1 pair of shoes
2. Optionally add: outerwear (if weather appropriate), accessories
3. Have cohesive color coordination
4. Match the user's style preferences
5. Are appropriate for the current weather/season

For each outfit, provide:
- Item IDs that compose the outfit
- A brief reasoning (1-2 sentences) explaining why this outfit works
- A confidence score (0-100)

Return as JSON:
{
  "outfits": [
    {
      "itemIds": ["id1", "id2", "id3"],
      "reasoning": "This outfit combines...",
      "score": 85
    },
    ...
  ]
}`;

  return prompt;
}

/**
 * Validates AI response against dataset knowledge
 * Helps ensure AI isn't hallucinating categories or seasons
 */
export function validateAIResponse(response: {
  suggestedCategory?: string;
  season?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const validCategories = ['top', 'bottom', 'shoes', 'outerwear', 'accessory'];
  const validSeasons = ['spring', 'summer', 'fall', 'winter', 'all-season'];

  if (response.suggestedCategory && !validCategories.includes(response.suggestedCategory)) {
    errors.push(`Invalid category: ${response.suggestedCategory}`);
  }

  if (response.season && !validSeasons.includes(response.season)) {
    errors.push(`Invalid season: ${response.season}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  getDatasetContext,
  getExamplesForCategory,
  getSeasonalContext,
  generateVisionAnalysisPrompt,
  generateOutfitRecommendationPrompt,
  validateAIResponse,
};
