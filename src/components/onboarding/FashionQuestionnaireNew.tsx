import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserProfile, StylePreference } from '../../types';
import { ProgressTracker } from './questionnaire/ProgressTracker';
import { StepNavigation } from './questionnaire/StepNavigation';
import { Step1StyleVibes } from './questionnaire/Step1StyleVibes';
import { Step5ColorsPatterns } from './questionnaire/Step5ColorsPatterns';

interface FashionQuestionnaireNewProps {
  onComplete: (data: Partial<UserProfile>) => void;
  onBack: () => void;
}

const STEP_TITLES = ['Style Vibes', 'Favorite Colors'];

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

  // Step 2: Favorite Colors (only)
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);

  // Handlers
  const handleStyleChange = (style: string, value: number) => {
    setStylePreferences((prev) => ({ ...prev, [style]: value }));
  };

  const handleColorToggle = (color: string) => {
    setFavoriteColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };


  const handleNext = () => {
    // Two-step flow: advance until step 2, then complete
    if (currentStep < 2) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete({
        stylePreferences,
        favoriteColors,
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
    // Require at least 3 favorite colors on the second step
    if (currentStep === 2) {
      return favoriteColors.length >= 3;
    }
    return true;
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
            totalSteps={STEP_TITLES.length}
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
                <Step5ColorsPatterns
                  favoriteColors={favoriteColors}
                  onColorToggle={handleColorToggle}
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
