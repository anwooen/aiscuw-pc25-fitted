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
    const { wardrobe, weather, preferences, favoriteColors, count = 7 } = req.body;

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

    // Build user preferences context
    const preferencesContext = `User Style Preferences (0-10 scale):
${Object.entries(preferences).map(([style, score]) => `- ${style}: ${score}/10`).join('\n')}

Favorite Colors: ${favoriteColors?.join(', ') || 'None specified'}`;

    // Prepare the prompt
    const systemPrompt = `You are an expert fashion stylist AI. Your job is to create ${count} outfit combinations from the user's wardrobe.

Rules:
1. Each outfit must include at least: 1 top, 1 bottom, and 1 pair of shoes
2. You can include outerwear and accessories as optional additions
3. Consider weather appropriateness
4. Match the user's style preferences
5. Create color-coordinated outfits
6. Vary the outfits to give diverse options
7. Provide specific reasoning for each outfit

Your response must be valid JSON with this exact structure:
{
  "outfits": [
    {
      "itemIds": ["id1", "id2", "id3"],
      "reasoning": "Brief explanation of why this outfit works",
      "score": 85
    }
  ]
}

Score each outfit 0-100 based on style match, weather appropriateness, and color coordination.`;

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
