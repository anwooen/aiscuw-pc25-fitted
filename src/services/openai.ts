import OpenAI from 'openai';
import { AIResponse } from '../types/api';
import { CacheManager } from './cacheManager';
import { Logger } from './logger';
import { RateLimiter } from './rateLimiter';

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

  async generateOutfitRecommendations(
    systemPrompt: string,
    userPrompt: string
  ): Promise<AIResponse> {
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
      throw new Error('No response from OpenAI');
    }

    const result = this.parseAndValidateResponse(content);
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