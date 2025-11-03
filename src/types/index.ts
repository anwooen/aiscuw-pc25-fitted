// Core data types for the Fitted app

export type ClothingCategory = 'top' | 'bottom' | 'shoes' | 'accessory' | 'outerwear';

export type StylePreference = 'casual' | 'formal' | 'streetwear' | 'athletic' | 'preppy';

export interface AIClothingAnalysis {
  description: string;
  suggestedCategory: ClothingCategory;
  detectedColors: string[];
  suggestedStyles: StylePreference[];
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'all-season';
  formality: 'casual' | 'business-casual' | 'formal';
  occasion?: string[];
}

export interface ClothingItem {
  id: string;
  image: string; // Base64 or IndexedDB reference
  category: ClothingCategory;
  colors: string[];
  style?: StylePreference[];
  uploadedAt: Date;
  aiAnalysis?: AIClothingAnalysis; // Optional AI-generated metadata
}

export interface UserProfile {
  hasCompletedOnboarding: boolean;
  stylePreferences: Record<StylePreference, number>; // Score 0-10
  favoriteColors: string[];
  completedAt?: Date;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
  };
}

export interface Outfit {
  id: string;
  items: ClothingItem[];
  createdAt: Date;
  liked?: boolean;
}

export interface AppState {
  profile: UserProfile;
  wardrobe: ClothingItem[];
  outfitHistory: Outfit[];
  todaysPick: Outfit | null;
  dailySuggestions: Outfit[];
  theme: 'light' | 'dark';

  // Actions
  setProfile: (profile: UserProfile) => void;
  completeOnboarding: (stylePreferences: Record<StylePreference, number>, favoriteColors: string[]) => void;
  addClothingItem: (item: ClothingItem) => void;
  removeClothingItem: (id: string) => void;
  addOutfit: (outfit: Outfit) => void;
  setTodaysPick: (outfit: Outfit | null) => void;
  setDailySuggestions: (suggestions: Outfit[]) => void;
  toggleTheme: () => void;
  resetApp: () => void;
  removeDuplicateOutfits: () => void;
}

// Minimum requirements for unlocking swipe mode
export interface WardrobeRequirements {
  minTops: number;
  minBottoms: number;
  minShoes: number;
  minTotal: number;
}

export const MINIMUM_WARDROBE: WardrobeRequirements = {
  minTops: 5,
  minBottoms: 3,
  minShoes: 2,
  minTotal: 10,
};

// Weather data types
export interface WeatherData {
  temperature: number; // in Fahrenheit
  condition: string; // e.g., "Sunny", "Rainy", "Cloudy"
  precipitation: number; // probability 0-100
  windSpeed: number; // mph
  humidity: number; // percentage
  feelsLike: number; // in Fahrenheit
}

// API Request/Response types
export interface AnalyzeClothingRequest {
  image: string; // Base64 encoded
  userPreferences?: Record<StylePreference, number>;
}

export interface AnalyzeClothingResponse {
  success: boolean;
  analysis?: AIClothingAnalysis;
  error?: string;
}

export interface RecommendOutfitsRequest {
  wardrobe: Array<{
    id: string;
    category: ClothingCategory;
    aiAnalysis?: AIClothingAnalysis;
    colors: string[];
  }>;
  weather?: WeatherData;
  preferences: Record<StylePreference, number>;
  favoriteColors: string[];
  count?: number; // number of outfits to generate (default 5-10)
}

export interface RecommendOutfitsResponse {
  success: boolean;
  outfits?: Array<{
    itemIds: string[];
    reasoning: string;
    score: number;
  }>;
  error?: string;
}

export interface WeatherResponse {
  success: boolean;
  weather?: WeatherData;
  error?: string;
}
