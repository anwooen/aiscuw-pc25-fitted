import { UserProfile } from '../types';

/**
 * Default values for Phase 13 enhanced personalization fields
 * These are used for:
 * 1. Migrating existing users who completed onboarding before Phase 13
 * 2. Fallback values when users skip questions
 */

export const defaultOccasions = {
  work: 0,
  class: 5,      // Default to college student
  gym: 3,
  casual: 7,     // Most people dress casually often
  social: 4,
  formal: 1,
  date: 2,
};

export const defaultFitPreferences = {
  tops: 'regular' as const,
  bottoms: 'regular' as const,
  overall: 'balanced' as const,
};

export const defaultWeatherPreferences = {
  coldSensitivity: 5,
  heatSensitivity: 5,
  layeringPreference: false,
  rainPreparation: false,
};

export const defaultPatternPreferences = {
  solid: 7,      // Most people like solids
  striped: 5,
  plaid: 4,
  floral: 3,
  graphic: 4,
  textured: 4,
};

export const defaultBrandPreferences = {
  sustainability: 5,
  brandConscious: false,
  qualityOverQuantity: false,
};

export const defaultColorPreferences = {
  monochrome: 5,
  colorful: 5,
  neutral: 6,
  matching: true,  // Most people prefer matching colors
  metalAccents: false,
};

export const defaultLifestyle = {
  activity: 'moderate' as const,
  commute: 'walk' as const,
  outdoorTime: 3,
  fashionRiskTolerance: 5,
};

export const defaultFashionGoals: string[] = [];
export const defaultInspirations: string[] = [];

/**
 * Applies default Phase 13 values to a user profile
 * @param profile - Existing user profile (may be pre-Phase 13)
 * @returns Profile with Phase 13 defaults filled in
 */
export function applyPhase13Defaults(profile: UserProfile): UserProfile {
  return {
    ...profile,
    occasions: profile.occasions ?? defaultOccasions,
    fitPreferences: profile.fitPreferences ?? defaultFitPreferences,
    weatherPreferences: profile.weatherPreferences ?? defaultWeatherPreferences,
    patternPreferences: profile.patternPreferences ?? defaultPatternPreferences,
    brandPreferences: profile.brandPreferences ?? defaultBrandPreferences,
    colorPreferences: profile.colorPreferences ?? defaultColorPreferences,
    lifestyle: profile.lifestyle ?? defaultLifestyle,
    fashionGoals: profile.fashionGoals ?? defaultFashionGoals,
    inspirations: profile.inspirations ?? defaultInspirations,
  };
}

/**
 * Checks if a profile has Phase 13 data
 * @param profile - User profile to check
 * @returns true if profile has any Phase 13 fields populated
 */
export function hasPhase13Data(profile: UserProfile): boolean {
  return !!(
    profile.occasions ||
    profile.fitPreferences ||
    profile.weatherPreferences ||
    profile.patternPreferences ||
    profile.brandPreferences ||
    profile.colorPreferences ||
    profile.lifestyle ||
    profile.fashionGoals ||
    profile.inspirations
  );
}
