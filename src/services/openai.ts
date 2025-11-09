import OpenAI from 'openai';
import { AIResponse } from '../types/api';
import { CacheManager } from '../services/cacheManager';
import { Logger } from '../services/logger';
import { RateLimiter } from '../services/rateLimiter';

export class OpenAIService {
  private client: OpenAI;
  private cache: CacheManager;
  private logger: Logger;
  private rateLimiter: RateLimiter;
  private readonly CACHE_TTL = 1000 * 60 * 30; // 30 minutes

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.client = new OpenAI({ apiKey });
    this.cache = CacheManager.getInstance();
    this.logger = Logger.getInstance();
    this.rateLimiter = RateLimiter.getInstance();
  }

  async generateOutfitRecommendations(
    systemPrompt: string,
    userPrompt: string,
    clientId: string
  ): Promise<AIResponse> {
    // Check rate limits
    if (!this.rateLimiter.canMakeRequest(clientId)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    this.logger.info('Generating outfit recommendations', { clientId });

    // Try cache first
    const cacheKey = `outfit_${systemPrompt}_${userPrompt}`;
    const cachedResponse = this.cache.get<AIResponse>(cacheKey);
    if (cachedResponse) {
      this.logger.info('Returning cached response', { clientId });
      return cachedResponse;
    }

    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      this.logger.error('No response from OpenAI', { clientId });
      throw new Error('No response from OpenAI');
    }

    const result = this.parseAndValidateResponse(content);
    
    // Cache the result
    this.cache.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  private parseAndValidateResponse(content: string): AIResponse {
    try {
      const parsed = JSON.parse(content);
      if (!this.isValidAIResponse(parsed)) {
        throw new Error('Invalid response structure from AI');
      }
      return parsed;
    } catch (error) {
      throw new Error('Invalid JSON response from OpenAI');
    }
  }

  private isValidAIResponse(data: unknown): data is AIResponse {
    if (!data || typeof data !== 'object') return false;
    const response = data as AIResponse;
    return Array.isArray(response.outfits) && response.outfits.every(outfit =>
      Array.isArray(outfit.itemIds) &&
      typeof outfit.reasoning === 'string' &&
      typeof outfit.score === 'number'
    );
  }
}