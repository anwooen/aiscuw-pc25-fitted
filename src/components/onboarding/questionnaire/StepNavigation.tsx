import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSkip?: () => void;
  canProceed?: boolean;
  isLastStep?: boolean;
  nextLabel?: string;
}

/**
 * Phase 13: Navigation buttons for multi-step questionnaire
 * Back, Next, and optional Skip buttons
 */
export function StepNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSkip,
  canProceed = true,
  isLastStep = false,
  nextLabel,
}: StepNavigationProps) {
  const showBack = currentStep > 1;

  return (
    <div className="flex items-center justify-between gap-4 mt-8">
      {/* Back button */}
      {showBack ? (
        <motion.button
          onClick={onBack}
          className="
            flex items-center gap-2 px-6 py-3
            rounded-full
            bg-white/10 hover:bg-white/20
            border border-white/20
            text-white font-medium
            transition-all duration-300
          "
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </motion.button>
      ) : (
        <div /> /* Spacer */
      )}

      <div className="flex items-center gap-4">
        {/* Skip button (optional) */}
        {onSkip && (
          <motion.button
            onClick={onSkip}
            className="
              px-6 py-3
              rounded-full
              text-white/60 hover:text-white
              font-medium
              transition-all duration-300
            "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Skip
          </motion.button>
        )}

        {/* Next/Complete button */}
        <motion.button
          onClick={onNext}
          disabled={!canProceed}
          className={`
            flex items-center gap-2 px-8 py-3
            rounded-full
            font-semibold text-lg
            transition-all duration-300
            ${
              canProceed
                ? 'bg-uw-gold hover:bg-uw-gold/90 text-uw-purple shadow-lg hover:shadow-xl'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }
          `}
          whileHover={canProceed ? { scale: 1.05 } : {}}
          whileTap={canProceed ? { scale: 0.98 } : {}}
        >
          {nextLabel || (isLastStep ? 'Complete' : 'Next')}
          {!isLastStep && <ChevronRight className="w-5 h-5" />}
        </motion.button>
      </div>
    </div>
  );
}
