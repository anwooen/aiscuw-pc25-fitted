import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, ClothingItem, Outfit, UserProfile } from '../types';

const initialProfile: UserProfile = {
  hasCompletedOnboarding: false,
  stylePreferences: {
    casual: 5,
    formal: 5,
    streetwear: 5,
    athletic: 5,
    preppy: 5,
  },
  favoriteColors: [],
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      profile: initialProfile,
      wardrobe: [],
      outfitHistory: [],
      todaysPick: null,
      theme: 'light',

      setProfile: (profile: UserProfile) => set({ profile }),

      addClothingItem: (item: ClothingItem) =>
        set((state) => ({
          wardrobe: [...state.wardrobe, item],
        })),

      removeClothingItem: (id: string) =>
        set((state) => ({
          wardrobe: state.wardrobe.filter((item) => item.id !== id),
        })),

      addOutfit: (outfit: Outfit) =>
        set((state) => ({
          outfitHistory: [...state.outfitHistory, outfit],
        })),

      setTodaysPick: (outfit: Outfit | null) =>
        set({ todaysPick: outfit }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      resetApp: () =>
        set({
          profile: initialProfile,
          wardrobe: [],
          outfitHistory: [],
          todaysPick: null,
          theme: 'light',
        }),
    }),
    {
      name: 'fitted-storage', // localStorage key
    }
  )
);
