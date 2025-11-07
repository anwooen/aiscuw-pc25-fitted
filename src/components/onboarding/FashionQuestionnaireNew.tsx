import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserProfile, StylePreference } from '../../types';
import { ProgressTracker } from './questionnaire/ProgressTracker';
import { StepNavigation } from './questionnaire/StepNavigation';
import { Step1StyleVibes } from './questionnaire/Step1StyleVibes';
import { Step2LifeOccasions } from './questionnaire/Step2LifeOccasions';
import { Step3FitComfort } from './questionnaire/Step3FitComfort';
import { Step4WeatherLifestyle } from './questionnaire/Step4WeatherLifestyle';
import { Step5ColorsPatterns } from './questionnaire/Step5ColorsPatterns';
import { Step6FashionGoals } from './questionnaire/Step6FashionGoals';

interface FashionQuestionnaireNewProps {
  onComplete: (data: Partial<UserProfile>) => void;
  onBack: () => void;
}

const STEP_TITLES = [
  'Style Vibes',
  'Life Occasions',
  'Fit & Comfort',
  'Weather & Lifestyle',
  'Colors & Patterns',
  'Fashion Goals',
];

/**
 * Phase 13: Completely redesigned FashionQuestionnaire
 * 6-step enhanced personalization flow
 */
export function FashionQuestionnaireNew({ onComplete, onBack }: FashionQuestionnaireNewProps) {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Style Vibes
  const [stylePreferences, setStylePreferences] = useState<Record<StylePreference, number>>({
    casual: 5,
    formal: 5,
    streetwear: 5,
    athletic: 5,
    preppy: 5,
  });

  // Step 2: Life Occasions
  const [occasions, setOccasions] = useState({
    work: 0,
    class: 5,
    gym: 3,
    casual: 7,
    social: 4,
    formal: 1,
    date: 2,
  });

  // Step 3: Fit & Comfort
  const [fitPreferences, setFitPreferences] = useState<{
    tops: 'tight' | 'fitted' | 'regular' | 'loose' | 'oversized';
    bottoms: 'tight' | 'fitted' | 'regular' | 'loose' | 'oversized';
    overall: 'comfort' | 'balanced' | 'fashion';
  }>({
    tops: 'regular',
    bottoms: 'regular',
    overall: 'balanced',
  });

  // Step 4: Weather & Lifestyle
  const [weatherPreferences, setWeatherPreferences] = useState({
    coldSensitivity: 5,
    heatSensitivity: 5,
    layeringPreference: false,
    rainPreparation: false,
  });

  const [lifestyle, setLifestyle] = useState<{
    activity: 'sedentary' | 'moderate' | 'active' | 'very-active';
    commute: 'walk' | 'bike' | 'drive' | 'public-transit';
    outdoorTime: number;
    fashionRiskTolerance: number;
  }>({
    activity: 'moderate',
    commute: 'walk',
    outdoorTime: 3,
    fashionRiskTolerance: 5,
  });

  // Step 5: Colors & Patterns
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);
  const [patternPreferences, setPatternPreferences] = useState({
    solid: 7,
    striped: 5,
    plaid: 4,
    floral: 3,
    graphic: 4,
    textured: 4,
  });
  const [colorPreferences, setColorPreferences] = useState({
    monochrome: 5,
    colorful: 5,
    neutral: 6,
    matching: true,
    metalAccents: false,
  });

  // Step 6: Fashion Goals & Inspirations
  const [fashionGoals, setFashionGoals] = useState<string[]>([]);
  const [inspirations, setInspirations] = useState<string[]>([]);

  // Handlers
  const handleStyleChange = (style: string, value: number) => {
    setStylePreferences((prev) => ({ ...prev, [style]: value }));
  };

  const handleOccasionChange = (occasion: string, value: number) => {
    setOccasions((prev) => ({ ...prev, [occasion]: value }));
  };

  const handleFitChange = (field: 'tops' | 'bottoms' | 'overall', value: string) => {
    setFitPreferences((prev) => ({ ...prev, [field]: value as any }));
  };

  const handleWeatherChange = (field: string, value: number | boolean) => {
    setWeatherPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const handleLifestyleChange = (field: string, value: string | number) => {
    setLifestyle((prev) => ({ ...prev, [field]: value }));
  };

  const handleColorToggle = (color: string) => {
    setFavoriteColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handlePatternChange = (pattern: string, value: number) => {
    setPatternPreferences((prev) => ({ ...prev, [pattern]: value }));
  };

  const handleColorPrefChange = (field: string, value: number | boolean) => {
    setColorPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const handleGoalToggle = (goal: string) => {
    setFashionGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleInspirationToggle = (inspiration: string) => {
    setInspirations((prev) =>
      prev.includes(inspiration) ? prev.filter((i) => i !== inspiration) : [...prev, inspiration]
    );
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Complete questionnaire
      onComplete({
        stylePreferences,
        favoriteColors,
        occasions,
        fitPreferences,
        weatherPreferences,
        patternPreferences,
        brandPreferences: {
          sustainability: 5,
          brandConscious: false,
          qualityOverQuantity: false,
        },
        colorPreferences,
        lifestyle,
        fashionGoals,
        inspirations,
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  // Validate current step
  const canProceed = () => {
    if (currentStep === 5) {
      return favoriteColors.length >= 3;
    }
    return true; // All other steps are optional or have defaults
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        // Inline background to prevent FOUC (Flash of Unstyled Content)
        background: 'linear-gradient(to bottom right, #4b2e83, #581c87, #6b21a8)',
        backgroundColor: '#4b2e83',
      }}
    >
      {/* Content */}
      <div className="w-full py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Progress Tracker */}
          <ProgressTracker
            currentStep={currentStep}
            totalSteps={6}
            stepTitles={STEP_TITLES}
          />

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              {currentStep === 1 && (
                <Step1StyleVibes values={stylePreferences} onChange={handleStyleChange} />
              )}
              {currentStep === 2 && (
                <Step2LifeOccasions values={occasions} onChange={handleOccasionChange} />
              )}
              {currentStep === 3 && (
                <Step3FitComfort fitPreferences={fitPreferences} onChange={handleFitChange} />
              )}
              {currentStep === 4 && (
                <Step4WeatherLifestyle
                  weatherPreferences={weatherPreferences}
                  lifestyle={lifestyle}
                  onWeatherChange={handleWeatherChange}
                  onLifestyleChange={handleLifestyleChange}
                />
              )}
              {currentStep === 5 && (
                <Step5ColorsPatterns
                  favoriteColors={favoriteColors}
                  patternPreferences={patternPreferences}
                  colorPreferences={colorPreferences}
                  onColorToggle={handleColorToggle}
                  onPatternChange={handlePatternChange}
                  onColorPrefChange={handleColorPrefChange}
                />
              )}
              {currentStep === 6 && (
                <Step6FashionGoals
                  fashionGoals={fashionGoals}
                  inspirations={inspirations}
                  onGoalToggle={handleGoalToggle}
                  onInspirationToggle={handleInspirationToggle}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <StepNavigation
            currentStep={currentStep}
            totalSteps={6}
            onBack={handleBack}
            onNext={handleNext}
            canProceed={canProceed()}
            isLastStep={currentStep === 6}
            nextLabel={currentStep === 6 ? "Let's Build My Wardrobe!" : undefined}
          />
        </div>
      </div>
    </div>
  );
}

// Default export for lazy loading
export default FashionQuestionnaireNew;
