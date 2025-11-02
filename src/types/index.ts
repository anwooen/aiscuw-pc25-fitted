// Core data types for the Fitted app

export type ClothingCategory = 'top' | 'bottom' | 'shoes' | 'accessory' | 'outerwear';

export type StylePreference = 'casual' | 'formal' | 'streetwear' | 'athletic' | 'preppy';

export interface ClothingItem {
  id: string;
  image: string; // Base64 or IndexedDB reference
  category: ClothingCategory;
  colors: string[];
  style?: StylePreference[];
  uploadedAt: Date;
}

export interface UserProfile {
  hasCompletedOnboarding: boolean;
  stylePreferences: Record<StylePreference, number>; // Score 0-10
  favoriteColors: string[];
  completedAt?: Date;
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
  theme: 'light' | 'dark';

  // Actions
  setProfile: (profile: UserProfile) => void;
  addClothingItem: (item: ClothingItem) => void;
  removeClothingItem: (id: string) => void;
  addOutfit: (outfit: Outfit) => void;
  setTodaysPick: (outfit: Outfit | null) => void;
  toggleTheme: () => void;
  resetApp: () => void;
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
