import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, ClothingItem, Outfit, UserProfile, StylePreference, OutfitHistoryItem } from '../types';

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
      dailySuggestions: [],
      theme: 'light',

      setProfile: (profile: UserProfile) => set({ profile }),

      completeOnboarding: (stylePreferences: Record<StylePreference, number>, favoriteColors: string[]) =>
        set((state) => ({
          profile: {
            ...state.profile,
            hasCompletedOnboarding: true,
            stylePreferences,
            favoriteColors,
            completedAt: new Date(),
          },
        })),

      addClothingItem: (item: ClothingItem) =>
        set((state) => ({
          wardrobe: [...state.wardrobe, item],
        })),

      removeClothingItem: (id: string) =>
        set((state) => ({
          wardrobe: state.wardrobe.filter((item) => item.id !== id),
        })),

      addToHistory: (outfit: Outfit, action: 'like' | 'dislike') => {
        // Only add if it's a like action
        if (action !== 'like') return;
        
        set((state) => {
          // Check for duplicates
          const isDuplicate = state.outfitHistory.some((historyItem: OutfitHistoryItem) => {
            const existingItemIds = historyItem.outfit.items.map(item => item.id).sort();
            const newItemIds = outfit.items.map(item => item.id).sort();
            return existingItemIds.length === newItemIds.length &&
                   existingItemIds.every((id, index) => id === newItemIds[index]);
          });

          if (isDuplicate) {
            return state;
          }

          const historyItem: OutfitHistoryItem = {
            id: `${Date.now()}-${Math.random()}`,
            outfit,
            timestamp: Date.now(),
            action, // Will always be 'like'
          };

          return {
            outfitHistory: [historyItem, ...state.outfitHistory],
          };
        });
      },

      removeFromHistory: (id: string) =>
        set((state) => ({
          outfitHistory: state.outfitHistory.filter((item) => item.id !== id),
        })),

      setTodaysPick: (outfit: Outfit | null) =>
        set({ todaysPick: outfit }),

      setDailySuggestions: (suggestions: Outfit[]) =>
        set({ dailySuggestions: suggestions }),

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
          dailySuggestions: [],
          theme: 'light',
        }),

      removeDuplicateOutfits: () =>
        set((state) => {
          const uniqueOutfits: OutfitHistoryItem[] = [];
          const seenItemSets = new Set<string>();

          for (const historyItem of state.outfitHistory) {
            const itemIds = historyItem.outfit.items.map(item => item.id).sort().join(',');

            if (!seenItemSets.has(itemIds)) {
              seenItemSets.add(itemIds);
              uniqueOutfits.push(historyItem);
            }
          }

          return {
            outfitHistory: uniqueOutfits,
          };
        }),
    }),
    {
      name: 'fitted-storage',
    }
  )
);
