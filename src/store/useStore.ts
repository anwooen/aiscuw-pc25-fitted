import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, ClothingItem, Outfit, UserProfile, StylePreference } from '../types';
import { applyPhase13Defaults } from '../utils/profileDefaults';

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

      // Phase 13: Enhanced onboarding completion with full profile
      completeOnboardingEnhanced: (profileData: Partial<UserProfile>) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...profileData,
            hasCompletedOnboarding: true,
            completedAt: new Date(),
          },
        })),

      addClothingItem: (item: ClothingItem) =>
        set((state) => ({
          wardrobe: [...state.wardrobe, item],
        })),

      removeClothingItem: (id: string) =>
        set((state) => {
          // Remove the item from the wardrobe
          const newWardrobe = state.wardrobe.filter((item) => item.id !== id);

          // Remove any outfits that reference this item
          const newOutfitHistory = state.outfitHistory.filter(outfit =>
            !outfit.items.some(item => item.id === id)
          );

          // Clear todaysPick if it references the removed item
          const newTodaysPick = state.todaysPick && state.todaysPick.items.some(i => i.id === id)
            ? null
            : state.todaysPick;

          // Remove any daily suggestions that include the item
          const newDailySuggestions = state.dailySuggestions.filter(outfit =>
            !outfit.items.some(item => item.id === id)
          );

          return {
            wardrobe: newWardrobe,
            outfitHistory: newOutfitHistory,
            todaysPick: newTodaysPick,
            dailySuggestions: newDailySuggestions,
          } as Partial<typeof state> as any;
        }),

      addOutfit: (outfit: Outfit) =>
        set((state) => {
          // Check if an outfit with the same items already exists
          const isDuplicate = state.outfitHistory.some(existingOutfit => {
            // Compare item IDs (sorted to ensure order doesn't matter)
            const existingItemIds = existingOutfit.items.map(item => item.id).sort();
            const newItemIds = outfit.items.map(item => item.id).sort();

            // Check if arrays are equal
            return existingItemIds.length === newItemIds.length &&
                   existingItemIds.every((id, index) => id === newItemIds[index]);
          });

          // Only add if it's not a duplicate
          if (isDuplicate) {
            return state; // Return unchanged state
          }

          return {
            outfitHistory: [...state.outfitHistory, outfit],
          };
        }),

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
          const uniqueOutfits: Outfit[] = [];
          const seenItemSets = new Set<string>();

          for (const outfit of state.outfitHistory) {
            // Create a unique key for this outfit based on sorted item IDs
            const itemIds = outfit.items.map(item => item.id).sort().join(',');

            if (!seenItemSets.has(itemIds)) {
              seenItemSets.add(itemIds);
              uniqueOutfits.push(outfit);
            }
          }

          return {
            outfitHistory: uniqueOutfits,
          };
        }),

      resetOnboarding: () =>
        set((state) => ({
          profile: {
            ...state.profile,
            hasCompletedOnboarding: false,
            completedAt: undefined,
          },
        })),
    }),
    {
      name: 'fitted-storage', // localStorage key
      // Phase 13: Migrate existing profiles to include new fields
      onRehydrateStorage: () => (state) => {
        if (state?.profile) {
          // Apply Phase 13 defaults to existing profiles
          state.profile = applyPhase13Defaults(state.profile);
        }
      },
    }
  )
);
