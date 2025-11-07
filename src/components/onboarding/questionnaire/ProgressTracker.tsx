import { motion } from 'framer-motion';

interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

/**
 * Phase 13: Animated progress tracker for multi-step questionnaire
 * Shows current step and progress bar
 */
export function ProgressTracker({ currentStep, totalSteps, stepTitles }: ProgressTrackerProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-white/60">
            Step {currentStep} of {totalSteps}
          </div>
          <div className="text-lg font-bold text-white">
            {stepTitles[currentStep - 1]}
          </div>
        </div>
        <div className="text-sm text-white/60">
          {Math.round(progress)}% Complete
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-uw-purple to-uw-gold rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-between mt-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              className="flex items-center"
              style={{ width: `${100 / totalSteps}%` }}
            >
              <motion.div
                className={`
                  w-3 h-3 rounded-full transition-all duration-300
                  ${isCompleted ? 'bg-uw-gold' : isCurrent ? 'bg-uw-purple' : 'bg-white/20'}
                `}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
