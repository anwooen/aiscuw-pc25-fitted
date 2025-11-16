import type {
  AnalyzeClothingRequest,
  AnalyzeClothingResponse,
  RecommendOutfitsRequest,
  RecommendOutfitsResponse,
  WeatherResponse,
} from '../types';

// API base URL - will be relative in production, can be overridden for local testing
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Analyze a clothing item using GPT-4o Vision API
 * Cost: ~$0.001 per image (with compression)
 *
 * @param request - The analysis request with image and preferences
 * @param signal - Optional AbortSignal for request cancellation
 */
export async function analyzeClothing(
  request: AnalyzeClothingRequest,
  signal?: AbortSignal
): Promise<AnalyzeClothingResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze-clothing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal, // Support request cancellation
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: AnalyzeClothingResponse = await response.json();
    return data;
  } catch (error: any) {
    // Don't log AbortErrors - these are intentional cancellations
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request cancelled',
      };
    }

    console.error('Error analyzing clothing:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze clothing',
    };
  }
}

/**
 * Get AI-powered outfit recommendations based on wardrobe, weather, and preferences
 * Cost: ~$0.001 per request (text-only, no images!)
 */
export async function recommendOutfits(
  request: RecommendOutfitsRequest
): Promise<RecommendOutfitsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/recommend-outfits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: RecommendOutfitsResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error getting outfit recommendations:', error);
    return {
      success: false,
      error: error.message || 'Failed to get outfit recommendations',
    };
  }
}

/**
 * Get current weather data using Open-Meteo API (free, no API key needed)
 */
export async function getWeather(
  latitude: number,
  longitude: number
): Promise<WeatherResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/weather?lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: WeatherResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching weather:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch weather',
    };
  }
}

/**
 * Get user's geolocation
 */
export function getUserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  });
}
