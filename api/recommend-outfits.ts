import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { wardrobe, weather, preferences, favoriteColors, count = 7, profile } = req.body;

    // Validate input
    if (!wardrobe || !Array.isArray(wardrobe) || wardrobe.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wardrobe data. Expected non-empty array.'
      });
    }

    if (!preferences) {
      return res.status(400).json({
        success: false,
        error: 'User preferences are required.'
      });
    }

    // Build wardrobe description for AI (text-only, no images!)
    const wardrobeDescription = wardrobe.map((item: any) => {
      const desc = item.aiAnalysis?.description || 'No description available';
      return `ID: ${item.id}
Category: ${item.category}
Colors: ${item.colors.join(', ')}
Description: ${desc}
${item.aiAnalysis?.suggestedStyles ? `Styles: ${item.aiAnalysis.suggestedStyles.join(', ')}` : ''}
${item.aiAnalysis?.season ? `Season: ${item.aiAnalysis.season}` : ''}
${item.aiAnalysis?.formality ? `Formality: ${item.aiAnalysis.formality}` : ''}`;
    }).join('\n\n---\n\n');

    // Build weather context
    const weatherContext = weather
      ? `Today's Weather:
- Temperature: ${weather.temperature}°F (feels like ${weather.feelsLike}°F)
- Condition: ${weather.condition}
- Precipitation: ${weather.precipitation}%
- Humidity: ${weather.humidity}%
- Wind: ${weather.windSpeed} mph`
      : 'Weather data not available.';

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
            .filter(([, score]) => score >= 6)
            .sort(([, a], [, b]) => (b as number) - (a as number))
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
            .filter(([, score]) => score >= 7)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .map(([pattern]) => pattern);

          const lowPatterns = Object.entries(profile.patternPreferences)
            .filter(([, score]) => score <= 3)
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
          profile.fashionGoals.forEach(goal => {
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
    const systemPrompt = `You are an expert fashion stylist AI. Your job is to create ${count} outfit combinations from the user's wardrobe based on their detailed personality profile.

Rules:
1. Each outfit must include at least: 1 top, 1 bottom, and 1 pair of shoes
2. You can include outerwear and accessories as optional additions
3. Consider weather appropriateness
4. Match the user's style preferences AND personality profile (occasions, fit, lifestyle, goals)
5. Create color-coordinated outfits that respect their color preferences
6. Vary the outfits to give diverse options
7. Provide specific reasoning for each outfit that REFERENCES their profile (e.g., "Perfect for class", "Matches your minimalist inspiration")
8. Respect pattern preferences (avoid patterns they dislike)
9. Consider their fashion risk tolerance (safe vs experimental outfits)

Your response must be valid JSON with this exact structure:
{
  "outfits": [
    {
      "itemIds": ["id1", "id2", "id3"],
      "reasoning": "Explanation referencing their profile (goals, occasions, preferences)",
      "score": 85
    }
  ]
}

Score each outfit 0-100 based on:
- Style match to preferences (30%)
- Weather appropriateness (20%)
- Color coordination (20%)
- Fit with lifestyle/occasions (20%)
- Alignment with fashion goals (10%)`;

    const userPrompt = `Please create ${count} outfit recommendations from this wardrobe:

${wardrobeDescription}

${weatherContext}

${preferencesContext}

Create ${count} diverse, stylish outfit combinations and explain your choices.`;

    // Call GPT-4o API (text-only, much cheaper!)
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7, // Higher temperature for more creative outfit combinations
      response_format: { type: 'json_object' },
    });

    // Parse the response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(content);

    // Validate the response structure
    if (!result.outfits || !Array.isArray(result.outfits)) {
      throw new Error('Invalid response structure from AI');
    }

    // Sort outfits by score (highest first)
    const sortedOutfits = result.outfits.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));

    // Return the recommendations
    return res.status(200).json({
      success: true,
      outfits: sortedOutfits.slice(0, count), // Limit to requested count
    });

  } catch (error: any) {
    console.error('Error generating outfit recommendations:', error);

    // Handle different error types
    if (error?.status === 401) {
      return res.status(500).json({
        success: false,
        error: 'API authentication failed. Please check server configuration.',
      });
    }

    if (error?.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
      });
    }

    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate outfit recommendations',
    });
  }
}
