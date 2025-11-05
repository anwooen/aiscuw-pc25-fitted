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
    const { image, userPreferences } = req.body;

    // Validate input
    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid image data. Expected base64 string.'
      });
    }

    // Check if image is base64 encoded
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        error: 'Image must be base64 encoded with data URI format.'
      });
    }

    // Prepare the prompt for GPT-4o Vision
    const systemPrompt = `You are a fashion analysis AI specialized in clothing categorization and analysis.

CRITICAL INSTRUCTIONS - PHASE 11B ENHANCED DETECTION:
1. Focus ONLY on the main clothing item in the center of the image
2. IGNORE any background elements (walls, furniture, floors, hangers, people, etc.)
3. IGNORE any people or body parts - focus solely on the clothing itself
4. If the background has been removed (transparent/white), analyze ONLY the visible clothing
5. Extract colors ONLY from the clothing fabric, NOT from any background elements
6. Provide confidence scores for your categorization (0.0 to 1.0)
7. If uncertain, provide an alternate category suggestion

Your response must be valid JSON with this exact structure:
{
  "description": "A detailed 2-3 sentence description of the clothing item",
  "suggestedCategory": "top|bottom|shoes|accessory|outerwear",
  "detectedColors": ["array", "of", "color", "names"],
  "suggestedStyles": ["casual|formal|streetwear|athletic|preppy"],
  "season": "spring|summer|fall|winter|all-season",
  "formality": "casual|business-casual|formal",
  "occasion": ["work", "casual", "gym", etc],
  "confidence": 0.95,
  "reasoning": "Explain why you chose this category (mention key features like collar, sleeves, etc.)",
  "alternateCategory": "outerwear",
  "alternateConfidence": 0.15,
  "mainSubjectDetected": true,
  "backgroundRemoved": true
}

CONFIDENCE SCORING GUIDE:
- 0.9-1.0: Very clear identification (e.g., obvious t-shirt with clear neckline)
- 0.7-0.89: Clear identification with minor ambiguity (e.g., could be top or outerwear)
- 0.5-0.69: Moderate uncertainty (e.g., cropped image, unclear category)
- Below 0.5: High uncertainty (suggest user manual selection)

Be specific about colors (e.g., "navy blue" not just "blue"). Include multiple style tags if appropriate.`;

    const userPrompt = userPreferences
      ? `The user's style preferences are: ${JSON.stringify(userPreferences)}. Please consider these when analyzing the item.`
      : 'Analyze this clothing item.';

    // Call GPT-4o Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: image,
                detail: 'low', // Use 'low' detail to save tokens (~85 tokens vs ~1,105 for high)
              },
            },
          ],
        },
      ],
      max_tokens: 600, // Increased for additional confidence fields
      temperature: 0, // Zero temperature for maximum consistency
      response_format: { type: 'json_object' },
    });

    // Parse the response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(content);

    // Validate the response structure
    if (!analysis.description || !analysis.suggestedCategory || !analysis.detectedColors) {
      throw new Error('Invalid response structure from AI');
    }

    // Return the analysis
    return res.status(200).json({
      success: true,
      analysis,
    });

  } catch (error: any) {
    console.error('Error analyzing clothing:', error);

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
      error: error?.message || 'Failed to analyze clothing item',
    });
  }
}
