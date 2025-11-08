import { WeatherData, StylePreference, AIClothingAnalysis } from './index';

export interface APIResponse {
  success: boolean;
  error?: string;
}

export interface APIErrorResponse extends APIResponse {
  success: false;
  error: string;
}

export interface OutfitSuggestion {
  itemIds: string[];
  reasoning: string;
  score: number;
}

export interface AIResponse {
  outfits: OutfitSuggestion[];
}

export interface OpenAIError {
  status: number;
  message: string;
  code?: string;
  type?: string;
}

export type APIResponseType<T> = APIErrorResponse | (APIResponse & T);