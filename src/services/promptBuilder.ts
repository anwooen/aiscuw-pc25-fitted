import { RecommendOutfitsRequest } from '../types';

export class PromptBuilder {
  static buildWardrobeDescription(wardrobe: RecommendOutfitsRequest['wardrobe']): string {
    return wardrobe.map(item => {
      const desc = item.aiAnalysis?.description || 'No description available';
      return `ID: ${item.id}
Category: ${item.category}
Colors: ${item.colors.join(', ')}
Description: ${desc}
${item.aiAnalysis?.suggestedStyles ? `Styles: ${item.aiAnalysis.suggestedStyles.join(', ')}` : ''}
${item.aiAnalysis?.season ? `Season: ${item.aiAnalysis.season}` : ''}
${item.aiAnalysis?.formality ? `Formality: ${item.aiAnalysis.formality}` : ''}`;
    }).join('\n\n---\n\n');
  }

  static buildWeatherContext(weather: RecommendOutfitsRequest['weather']): string {
    return weather
      ? `Today's Weather:
- Temperature: ${weather.temperature}°F (feels like ${weather.feelsLike}°F)
- Condition: ${weather.condition}
- Precipitation: ${weather.precipitation}%
- Humidity: ${weather.humidity}%
- Wind: ${weather.windSpeed} mph`
      : 'Weather data not available.';
  }

  static buildSystemPrompt(count: number): string {
    return `You are an expert fashion stylist AI. Your job is to create ${count} outfit combinations from the user's wardrobe based on their detailed personality profile.

Rules:
1. Each outfit must include at least: 1 top, 1 bottom, and 1 pair of shoes
2. You can include outerwear and accessories as optional additions
3. Consider weather appropriateness
4. Match the user's style preferences AND personality profile (occasions, fit, lifestyle, goals)
5. Create color-coordinated outfits that respect their color preferences
6. Vary the outfits to give diverse options
7. Provide specific reasoning for each outfit that REFERENCES their profile
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
  }

  static buildUserPrompt(
    count: number,
    wardrobeDescription: string,
    weatherContext: string,
    preferencesContext: string
  ): string {
    return `Please create ${count} outfit recommendations from this wardrobe:

${wardrobeDescription}

${weatherContext}

${preferencesContext}

Create ${count} diverse, stylish outfit combinations and explain your choices.`;
  }
}