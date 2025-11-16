import { VercelRequest, VercelResponse } from '@vercel/node';
import { RecommendOutfitsRequest, RecommendOutfitsResponse } from '../src/types';
import { OutfitSuggestion } from '../src/types/api';
import { OpenAIService } from '../src/services/openai';
import { PromptBuilder } from '../src/services/promptBuilder';
import { Logger } from '../src/services/logger';

// Initialize OpenAI service
const openaiService = new OpenAIService(process.env.OPENAI_API_KEY || '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const logger = Logger.getInstance();
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    logger.warn('Invalid method', { method: req.method });
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Get client ID from request headers
  const clientId = req.headers['x-client-id']?.toString() || req.headers['x-forwarded-for']?.toString() || 'default';

  try {
    const request = req.body as RecommendOutfitsRequest;
    const { wardrobe, weather, preferences, favoriteColors, count = 7, profile } = request;

    // Validate input
    if (!wardrobe || !Array.isArray(wardrobe) || wardrobe.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wardrobe data. Expected non-empty array.'
      } as RecommendOutfitsResponse);
    }

    if (!preferences) {
      return res.status(400).json({
        success: false,
        error: 'User preferences are required.'
      } as RecommendOutfitsResponse);
    }

    // Build prompt components using PromptBuilder
    const wardrobeDescription = PromptBuilder.buildWardrobeDescription(wardrobe);
    const weatherContext = PromptBuilder.buildWeatherContext(weather);

    // Build enhanced user personality profile (Phase 13)
    const buildPersonalityProfile = () => {
      let context = `=== USER PERSONALITY PROFILE ===\n\n`;

      // Basic style preferences
      context += `Style Preferences (0-10):\n`;
      context += Object.entries(preferences).map(([style, score]) => `- ${style}: ${score}/10`).join('\n');
      context += `\n\n`;

      // Phase 13: Enhanced personalization
      if (profile) {
        // Occasions
        if (profile.occasions) {
          const topOccasions = Object.entries(profile.occasions)
            .filter(([, score]: [string, number]) => score >= 6)
            .sort(([, a], [, b]) => b - a)
            .map(([occasion, score]) => `${occasion.charAt(0).toUpperCase() + occasion.slice(1)} (${score}/10)`);

          if (topOccasions.length > 0) {
            context += `Lifestyle Context:\n`;
            context += `- Primary occasions: ${topOccasions.join(', ')}\n`;
          }
        }

        // Lifestyle
        if (profile.lifestyle) {
          context += `- Activity level: ${profile.lifestyle.activity}\n`;
          if (profile.lifestyle.commute) {
            context += `- Commute: ${profile.lifestyle.commute}\n`;
          }
          if (profile.lifestyle.fashionRiskTolerance !== undefined) {
            const riskLevel = profile.lifestyle.fashionRiskTolerance >= 7 ? 'willing to experiment' :
                            profile.lifestyle.fashionRiskTolerance >= 4 ? 'moderately adventurous' : 'prefers safe choices';
            context += `- Fashion risk tolerance: ${profile.lifestyle.fashionRiskTolerance}/10 (${riskLevel})\n`;
          }
        }
        context += `\n`;

        // Fit preferences
        if (profile.fitPreferences) {
          context += `Fit & Comfort:\n`;
          context += `- Tops: ${profile.fitPreferences.tops} fit preferred\n`;
          context += `- Bottoms: ${profile.fitPreferences.bottoms} fit preferred\n`;
          context += `- Priority: ${profile.fitPreferences.overall === 'comfort' ? 'Comfort over fashion' :
                                   profile.fitPreferences.overall === 'fashion' ? 'Fashion over comfort' :
                                   'Balanced (comfort + fashion)'}\n\n`;
        }

        // Weather preferences
        if (profile.weatherPreferences) {
          context += `Weather Preferences:\n`;
          if (profile.weatherPreferences.coldSensitivity >= 7) {
            context += `- Cold sensitivity: ${profile.weatherPreferences.coldSensitivity}/10 (gets cold easily)\n`;
          }
          if (profile.weatherPreferences.heatSensitivity >= 7) {
            context += `- Heat sensitivity: ${profile.weatherPreferences.heatSensitivity}/10 (gets hot easily)\n`;
          }
          if (profile.weatherPreferences.layeringPreference) {
            context += `- Loves layering: Yes\n`;
          }
          if (profile.weatherPreferences.rainPreparation) {
            context += `- Rain prepared: Yes\n`;
          }
          context += `\n`;
        }

        // Color preferences
        context += `Color & Pattern Preferences:\n`;
        context += `- Favorite colors: ${favoriteColors?.join(', ') || 'None specified'}\n`;
        if (profile.colorPreferences) {
          const colorStyles = [];
          if (profile.colorPreferences.monochrome >= 7) colorStyles.push(`Monochrome (${profile.colorPreferences.monochrome}/10)`);
          if (profile.colorPreferences.neutral >= 7) colorStyles.push(`Neutral (${profile.colorPreferences.neutral}/10)`);
          if (profile.colorPreferences.colorful >= 7) colorStyles.push(`Colorful (${profile.colorPreferences.colorful}/10)`);

          if (colorStyles.length > 0) {
            context += `- Color style: ${colorStyles.join(', ')}\n`;
          }
          context += `- Prefers: ${profile.colorPreferences.matching ? 'Matching colors' : 'Contrasting colors'}\n`;
          if (profile.colorPreferences.metalAccents) {
            context += `- Metal accents: Preferred\n`;
          }
        }

        // Pattern preferences
        if (profile.patternPreferences) {
          const topPatterns = Object.entries(profile.patternPreferences)
            .filter(([, score]: [string, number]) => score >= 7)
            .sort(([, a], [, b]) => b - a)
            .map(([pattern]) => pattern);

          const lowPatterns = Object.entries(profile.patternPreferences)
            .filter(([, score]: [string, number]) => score <= 3)
            .map(([pattern]) => pattern);

          if (topPatterns.length > 0) {
            context += `- Loves: ${topPatterns.join(', ')} patterns\n`;
          }
          if (lowPatterns.length > 0) {
            context += `- Avoid: ${lowPatterns.join(', ')} patterns\n`;
          }
        }
        context += `\n`;

        // Fashion goals & inspirations
        if (profile.fashionGoals && profile.fashionGoals.length > 0) {
          context += `Fashion Goals:\n`;
          profile.fashionGoals.forEach((goal: string) => {
            context += `- "${goal}"\n`;
          });
          context += `\n`;
        }

        if (profile.inspirations && profile.inspirations.length > 0) {
          context += `Inspirations:\n`;
          context += `- ${profile.inspirations.join(', ')}\n\n`;
        }
      } else {
        // Fallback for pre-Phase 13 profiles
        context += `Favorite Colors: ${favoriteColors?.join(', ') || 'None specified'}\n\n`;
      }

      context += `===\n\n`;

      // Add instructions for using this profile
      if (profile) {
        context += `Based on this detailed profile, create outfits that:\n`;
        context += `1. Match their primary occasions and lifestyle\n`;
        context += `2. Account for weather sensitivity\n`;
        context += `3. Respect fit preferences\n`;
        context += `4. Use their favorite colors and patterns\n`;
        context += `5. Align with their fashion risk tolerance\n`;
        if (profile.fashionGoals && profile.fashionGoals.length > 0) {
          context += `6. Help them achieve their goals: ${profile.fashionGoals.join(', ')}\n`;
        }
        if (profile.inspirations && profile.inspirations.length > 0) {
          context += `7. Draw inspiration from: ${profile.inspirations.join(', ')}\n`;
        }
      }

      return context;
    };

    const preferencesContext = buildPersonalityProfile();

    // Prepare the prompt
    const systemPrompt = PromptBuilder.buildSystemPrompt(count);
    const userPrompt = PromptBuilder.buildUserPrompt(
      count,
      wardrobeDescription,
      weatherContext,
      preferencesContext
    );

    // Generate outfit recommendations using OpenAI with client ID for rate limiting
    const result = await openaiService.generateOutfitRecommendations(systemPrompt, userPrompt, clientId);

    // Sort outfits by score (highest first)
    const sortedOutfits = result.outfits.sort((a: OutfitSuggestion, b: OutfitSuggestion) => b.score - a.score);

    // Return the recommendations
    return res.status(200).json({
      success: true,
      outfits: sortedOutfits.slice(0, count), // Limit to requested count
    });

  } catch (error: unknown) {
    console.error('Error generating outfit recommendations:', error);

    interface ErrorWithStatus {
      status: number;
      message?: string;
    }

    interface ErrorWithMessage {
      message: string;
    }

    const errorResponse = (status: number, message: string): VercelResponse => {
      return res.status(status).json({
        success: false,
        error: message
      } as RecommendOutfitsResponse);
    };

    // Handle OpenAI API errors
    if (error && typeof error === 'object') {
      // Check for API authentication and rate limit errors
      if ('status' in error && typeof (error as ErrorWithStatus).status === 'number') {
        const statusError = error as ErrorWithStatus;
        if (statusError.status === 401) {
          return errorResponse(500, 'API authentication failed. Please check server configuration.');
        }
        if (statusError.status === 429) {
          return errorResponse(429, 'Rate limit exceeded. Please try again later.');
        }
      }

      // Handle errors with message property
      if ('message' in error && typeof (error as ErrorWithMessage).message === 'string') {
        const messageError = error as ErrorWithMessage;
        return errorResponse(500, messageError.message);
      }
    }

    // Default error response for unknown errors
    return errorResponse(500, 'Failed to generate outfit recommendations');
  }
}
