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
  // Phase 11B: Enhanced AI Detection
  confidence?: number; // 0-1 score for category detection
  reasoning?: string; // Why AI chose this category
  alternateCategory?: ClothingCategory; // Second guess
  alternateConfidence?: number; // Confidence in alternate
  backgroundRemoved?: boolean; // Was background removed?
  mainSubjectDetected?: boolean; // Was clothing clearly detected?
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

  // Phase 13: Enhanced Personalization

  // Occasion preferences (how often they dress for each)
  occasions?: {
    work: number;          // 0-10 (0 = never, 10 = daily)
    class: number;         // College classes
    gym: number;           // Athletic activities
    casual: number;        // Everyday errands
    social: number;        // Parties, events, dinners
    formal: number;        // Interviews, ceremonies
    date: number;          // Romantic outings
  };

  // Fit preferences
  fitPreferences?: {
    tops: 'tight' | 'fitted' | 'regular' | 'loose' | 'oversized';
    bottoms: 'tight' | 'fitted' | 'regular' | 'loose' | 'oversized';
    overall: 'comfort' | 'balanced' | 'fashion'; // Priority
  };

  // Weather sensitivity
  weatherPreferences?: {
    coldSensitivity: number;      // 0-10 (0 = never cold, 10 = always cold)
    heatSensitivity: number;      // 0-10 (0 = never hot, 10 = always hot)
    layeringPreference: boolean;  // Prefer layered outfits?
    rainPreparation: boolean;     // Always prepared for rain?
  };

  // Pattern & texture preferences
  patternPreferences?: {
    solid: number;        // 0-10
    striped: number;      // 0-10
    plaid: number;        // 0-10
    floral: number;       // 0-10
    graphic: number;      // 0-10
    textured: number;     // 0-10 (knit, corduroy, etc.)
  };

  // Brand & quality preferences
  brandPreferences?: {
    sustainability: number;       // 0-10 (how much they care)
    brandConscious: boolean;      // Care about brand names?
    qualityOverQuantity: boolean; // Prefer fewer high-quality pieces?
  };

  // Color combination preferences
  colorPreferences?: {
    monochrome: number;           // 0-10 (black/white/gray outfits)
    colorful: number;             // 0-10 (bright, bold colors)
    neutral: number;              // 0-10 (beige, tan, earth tones)
    matching: boolean;            // Prefer matchy-matchy or contrasting?
    metalAccents: boolean;        // Like gold/silver accessories?
  };

  // Lifestyle & personality
  lifestyle?: {
    activity: 'sedentary' | 'moderate' | 'active' | 'very-active';
    commute: 'walk' | 'bike' | 'drive' | 'public-transit';
    outdoorTime: number;          // 0-10 hours per week
    fashionRiskTolerance: number; // 0-10 (0 = safe, 10 = experimental)
  };

  // Goals & aspirations
  fashionGoals?: string[];          // e.g., "look more professional", "be more confident"
  inspirations?: string[];          // e.g., "minimalist", "vintage", "tech-wear"
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

  // Phase 14: Clerk Authentication
  clerkUserId: string | null;

  // Actions
  setProfile: (profile: UserProfile) => void;
  completeOnboarding: (stylePreferences: Record<StylePreference, number>, favoriteColors: string[]) => void;
  completeOnboardingEnhanced: (profileData: Partial<UserProfile>) => void; // Phase 13
  addClothingItem: (item: ClothingItem) => void;
  removeClothingItem: (id: string) => void;
  addOutfit: (outfit: Outfit) => void;
  setTodaysPick: (outfit: Outfit | null) => void;
  setDailySuggestions: (suggestions: Outfit[]) => void;
  toggleTheme: () => void;
  resetApp: () => void;
  removeDuplicateOutfits: () => void;
  resetOnboarding: () => void;

  // Phase 14: Clerk Authentication Actions
  setClerkUserId: (userId: string | null) => void;
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
  // Phase 13: Enhanced personalization data
  profile?: UserProfile; // Full profile with all Phase 13 fields
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
