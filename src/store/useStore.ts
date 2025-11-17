import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, ClothingItem, Outfit, UserProfile, StylePreference, WeatherData, ClothingCategory, QueuedFile } from '../types';
import { applyPhase13Defaults } from '../utils/profileDefaults';
import { getWeather, getUserLocation } from '../services/api';
import { convertImageIfNeeded } from '../utils/imageFormatConverter';
import { processImageForAI } from '../utils/backgroundRemoval';
import { compressImage, extractColors, compressForAI } from '../utils/imageCompression';
import { saveImage } from '../utils/storage';
import { analyzeClothing } from '../services/api';

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

// Phase 18: Weather cache constants
const WEATHER_CACHE_KEY = 'fitted_weather_cache';
const WEATHER_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface CachedWeather {
  weather: WeatherData;
  cachedAt: string;
}

/**
 * Load cached weather from localStorage
 */
const loadCachedWeather = (): CachedWeather | null => {
  try {
    const cached = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!cached) return null;

    const data: CachedWeather = JSON.parse(cached);

    // Check if cache is still valid (within 30 minutes)
    const cachedTime = new Date(data.cachedAt).getTime();
    const now = Date.now();

    if (now - cachedTime > WEATHER_CACHE_DURATION) {
      // Cache expired, remove it
      localStorage.removeItem(WEATHER_CACHE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to load cached weather:', error);
    return null;
  }
};

/**
 * Save weather to localStorage cache
 */
const saveCachedWeather = (weather: WeatherData): void => {
  try {
    const cache: CachedWeather = {
      weather,
      cachedAt: new Date().toISOString(),
    };
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save cached weather:', error);
  }
};

// Phase 18: Batch upload constants
const MAX_BATCH_SIZE = 20;
const BATCH_CHUNK_SIZE = 5;
const DELAY_BETWEEN_BATCHES = 500;

/**
 * Generate unique ID for file
 */
const generateFileId = (file: File, index: number): string => {
  return `${Date.now()}-${index}-${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
};

/**
 * Create preview URL for file
 */
const createPreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: initialProfile,
      wardrobe: [],
      outfitHistory: [],
      todaysPick: null,
      dailySuggestions: [],
      theme: 'light',
      clerkUserId: null, // Phase 14: Clerk Authentication

      // Phase 18: Global Weather State
      weatherData: null,
      weatherLoading: false,
      weatherError: null,

      // Phase 18: Global Batch Upload State
      batchUploadQueue: [],
      batchUploadStatus: 'idle',
      batchUploadProgress: {
        totalFiles: 0,
        processedCount: 0,
        successCount: 0,
        errorCount: 0,
      },
      // Flag to control cancellation during async processing
      shouldContinueBatchUpload: true,

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

      // Phase 14: Clerk Authentication Actions
      setClerkUserId: (userId: string | null) => set({ clerkUserId: userId }),

      // Phase 18: Weather Actions
      setWeather: (weather: WeatherData | null) => set({ weatherData: weather }),
      setWeatherLoading: (loading: boolean) => set({ weatherLoading: loading }),
      setWeatherError: (error: string | null) => set({ weatherError: error }),

      /**
       * Fetch weather data with caching
       */
      fetchWeather: async () => {
        try {
          set({ weatherLoading: true, weatherError: null });

          // Step 1: Check cache first
          const cached = loadCachedWeather();
          if (cached) {
            set({ weatherData: cached.weather, weatherLoading: false });
            return;
          }

          // Step 2: Get location from profile or geolocation
          const state = get();
          let location = state.profile.location;

          if (!location) {
            // Try to get location via browser geolocation API
            try {
              const coords = await getUserLocation();
              location = {
                latitude: coords.latitude,
                longitude: coords.longitude,
              };
            } catch (err: any) {
              // User denied location or browser doesn't support it
              console.warn('Could not get user location:', err.message);
              set({
                weatherError: 'Location access required for weather data',
                weatherLoading: false
              });
              return;
            }
          }

          // Step 3: Fetch weather from API
          const response = await getWeather(location.latitude, location.longitude);

          if (response.success && response.weather) {
            // Step 4: Save to cache
            saveCachedWeather(response.weather);

            // Step 5: Update state
            set({
              weatherData: response.weather,
              weatherError: null,
              weatherLoading: false
            });
          } else {
            throw new Error(response.error || 'Failed to fetch weather');
          }
        } catch (err: any) {
          console.error('Failed to fetch weather:', err);
          set({
            weatherError: err.message || 'Failed to fetch weather',
            weatherData: null,
            weatherLoading: false
          });
        }
      },

      /**
       * Clear weather cache
       */
      clearWeatherCache: () => {
        localStorage.removeItem(WEATHER_CACHE_KEY);
        set({ weatherData: null });
      },

      // Phase 18: Batch Upload Actions
      /**
       * Add files to the batch upload queue with preprocessing and AI analysis
       */
      addBatchFiles: async (files: File[]) => {
        const state = get();
        const currentQueueLength = state.batchUploadQueue.length;
        const remaining = Math.max(MAX_BATCH_SIZE - currentQueueLength, 0);

        if (remaining <= 0) {
          console.warn('Batch queue full - no files added');
          return;
        }

        const filesToProcess = files.slice(0, remaining);
        const queuedFiles: QueuedFile[] = [];

        // Set state to preprocessing
        set({
          batchUploadStatus: 'preprocessing',
          batchUploadProgress: {
            totalFiles: filesToProcess.length,
            processedCount: 0,
            successCount: 0,
            errorCount: 0,
          },
        });

        // Get user profile for AI analysis
        const profile = get().profile;

        // Process each file sequentially
        for (let i = 0; i < filesToProcess.length; i++) {
          const file = filesToProcess[i];
          const id = generateFileId(file, i + currentQueueLength);

          try {
            // Convert format if needed
            const converted = await convertImageIfNeeded(file);

            // Run background removal
            const processedBlob = await processImageForAI(converted);

            // Create base64 preview from processed blob
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve, reject) => {
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(processedBlob);
            });

            // Run AI analysis
            let aiAnalysis;
            let aiConfidence;
            let aiStatus: 'pending' | 'analyzing' | 'success' | 'failed' = 'pending';
            let suggestedCategory;

            try {
              aiStatus = 'analyzing';

              // Convert processed blob to File for compression
              const processedFile = new File([processedBlob], file.name, {
                type: processedBlob.type || 'image/jpeg',
              });

              // Compress image for AI
              const compressedBase64 = await compressForAI(processedFile);

              const aiResult = await analyzeClothing({
                image: compressedBase64,
                userPreferences: profile.stylePreferences,
              });

              if (aiResult.success && aiResult.analysis) {
                aiAnalysis = aiResult.analysis;
                aiConfidence = aiResult.analysis.confidence;
                suggestedCategory = aiResult.analysis.suggestedCategory;
                aiStatus = 'success';
                console.log(`AI analysis success for ${file.name}: ${suggestedCategory} (${(aiConfidence! * 100).toFixed(0)}% confident)`);
              } else {
                aiStatus = 'failed';
                console.warn(`AI analysis failed for ${file.name}:`, aiResult.error);
              }
            } catch (aiErr) {
              aiStatus = 'failed';
              console.error(`AI analysis error for ${file.name}:`, aiErr);
            }

            // Add successfully processed file
            queuedFiles.push({
              id,
              file,
              preview: base64,
              originalName: file.name,
              processedBlob,
              processedBase64: base64,
              aiAnalysis,
              aiConfidence,
              aiStatus,
              category: suggestedCategory,
            });

            // Update progress
            set((state) => ({
              batchUploadProgress: {
                ...state.batchUploadProgress,
                processedCount: state.batchUploadProgress.processedCount + 1,
                successCount: state.batchUploadProgress.successCount + 1,
              },
            }));
          } catch (err) {
            console.error(`Failed to process ${file.name}:`, err);
            // Try to create fallback preview
            try {
              const fallbackPreview = await createPreview(file);
              queuedFiles.push({
                id,
                file,
                preview: fallbackPreview,
                originalName: file.name,
                aiStatus: 'failed',
              });
            } catch (previewErr) {
              console.error(`Failed to create preview for ${file.name}:`, previewErr);
            }
            set((state) => ({
              batchUploadProgress: {
                ...state.batchUploadProgress,
                processedCount: state.batchUploadProgress.processedCount + 1,
                errorCount: state.batchUploadProgress.errorCount + 1,
              },
            }));
          }
        }

        // Update queue with processed files
        set((state) => ({
          batchUploadQueue: [...state.batchUploadQueue, ...queuedFiles],
          batchUploadStatus: 'idle',
        }));
      },

      /**
       * Remove a file from the queue
       */
      removeBatchFile: (fileId: string) => {
        set((state) => ({
          batchUploadQueue: state.batchUploadQueue.filter((f) => f.id !== fileId),
        }));
      },

      /**
       * Update category for a queued file
       */
      updateBatchFileCategory: (fileId: string, category: ClothingCategory | null) => {
        set((state) => ({
          batchUploadQueue: state.batchUploadQueue.map((q) =>
            q.id === fileId ? { ...q, category: category ?? undefined } : q
          ),
        }));
      },

      /**
       * Start batch upload process
       */
      startBatchUpload: async () => {
        const state = get();
        const queueToProcess = state.batchUploadQueue;

        if (queueToProcess.length === 0) {
          console.warn('No files in queue to process');
          return;
        }

        // Reset shouldContinue flag and set initial state
        set({
          shouldContinueBatchUpload: true,
          batchUploadStatus: 'preprocessing',
          batchUploadProgress: {
            totalFiles: queueToProcess.length,
            processedCount: 0,
            successCount: 0,
            errorCount: 0,
          },
        });

        /**
         * Process a single file
         */
        const processFile = async (queuedFile: QueuedFile): Promise<{ id: string; status: 'success' | 'error' }> => {
          try {
            if (!queuedFile.category) {
              throw new Error('Category not selected');
            }

            // Reuse preprocessed blob if available
            let processedBlob: Blob;
            if (queuedFile.processedBlob) {
              processedBlob = queuedFile.processedBlob;
            } else {
              const convertedFile = await convertImageIfNeeded(queuedFile.file);
              processedBlob = await processImageForAI(convertedFile);
            }

            // Convert to file for processing
            const processedFile = new File([processedBlob], queuedFile.originalName, {
              type: processedBlob.type,
            });

            // Extract colors
            const colors = await extractColors(processedFile);

            // Compress for storage
            const compressedBlob = await compressImage(processedFile);

            // Save to storage
            const imageId = `${Date.now()}-${queuedFile.id}`;
            await saveImage(imageId, compressedBlob);

            // Add to wardrobe
            get().addClothingItem({
              id: imageId,
              image: imageId,
              category: queuedFile.category,
              uploadedAt: new Date(),
              colors: colors,
            });

            return {
              id: queuedFile.id,
              status: 'success',
            };
          } catch (error) {
            console.error(`Failed to process ${queuedFile.originalName}:`, error);
            return {
              id: queuedFile.id,
              status: 'error',
            };
          }
        };

        /**
         * Process files in parallel batches
         */
        const processBatch = async (files: QueuedFile[]): Promise<void> => {
          for (let i = 0; i < files.length; i += BATCH_CHUNK_SIZE) {
            // Check if should continue
            if (!get().shouldContinueBatchUpload) {
              break;
            }

            const chunk = files.slice(i, i + BATCH_CHUNK_SIZE);
            const chunkResults = await Promise.all(chunk.map(processFile));

            // Update progress
            const chunkSuccesses = chunkResults.filter((r) => r.status === 'success').length;
            const chunkErrors = chunkResults.filter((r) => r.status === 'error').length;

            set((state) => ({
              batchUploadProgress: {
                ...state.batchUploadProgress,
                processedCount: state.batchUploadProgress.processedCount + chunk.length,
                successCount: state.batchUploadProgress.successCount + chunkSuccesses,
                errorCount: state.batchUploadProgress.errorCount + chunkErrors,
              },
            }));

            // Rate limiting delay
            if (i + BATCH_CHUNK_SIZE < files.length) {
              await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
            }
          }
        };

        // Process all files
        await processBatch(queueToProcess);

        // Update to uploading status
        set({ batchUploadStatus: 'uploading' });

        // Additional delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mark as completed if not cancelled
        set((state) => ({
          batchUploadStatus: state.shouldContinueBatchUpload ? 'completed' : state.batchUploadStatus,
        }));
      },

      /**
       * Cancel batch upload
       */
      cancelBatchUpload: () => {
        set({
          shouldContinueBatchUpload: false,
          batchUploadStatus: 'cancelled',
        });
      },

      /**
       * Clear batch queue
       */
      clearBatchQueue: () => {
        set({
          batchUploadQueue: [],
          batchUploadStatus: 'idle',
          batchUploadProgress: {
            totalFiles: 0,
            processedCount: 0,
            successCount: 0,
            errorCount: 0,
          },
        });
      },
    }),
    {
      name: 'fitted-storage', // localStorage key
      // Phase 13: Migrate existing profiles to include new fields
      onRehydrateStorage: () => (state) => {
        if (state?.profile) {
          // Apply Phase 13 defaults to existing profiles
          state.profile = applyPhase13Defaults(state.profile);
        }
        // Phase 18: Load cached weather on app start
        if (state) {
          const cached = loadCachedWeather();
          if (cached) {
            state.weatherData = cached.weather;
          }
        }
      },
    }
  )
);
