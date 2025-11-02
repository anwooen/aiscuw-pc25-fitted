import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { Welcome } from './components/onboarding/Welcome';
import { FashionQuestionnaire } from './components/onboarding/FashionQuestionnaire';
import { WardrobeUpload } from './components/wardrobe/WardrobeUpload';
import { WardrobeGrid } from './components/wardrobe/WardrobeGrid';
import { useWardrobe } from './hooks/useWardrobe';
import { Lock, Unlock, Sparkles } from 'lucide-react';
import { MINIMUM_WARDROBE } from './types';

type OnboardingStep = 'welcome' | 'questionnaire' | 'complete';

function App() {
  const { profile, completeOnboarding } = useStore();
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('welcome');
  const wardrobeStats = useWardrobe();

  // Check if user has completed onboarding
  useEffect(() => {
    if (profile.hasCompletedOnboarding) {
      setOnboardingStep('complete');
    }
  }, [profile.hasCompletedOnboarding]);

  // Handle onboarding flow
  const handleGetStarted = () => {
    setOnboardingStep('questionnaire');
  };

  const handleQuestionnaireComplete = (data: {
    stylePreferences: Record<string, number>;
    favoriteColors: string[];
  }) => {
    completeOnboarding(data.stylePreferences as any, data.favoriteColors);
    setOnboardingStep('complete');
  };

  const handleQuestionnaireBack = () => {
    setOnboardingStep('welcome');
  };

  // Show onboarding screens
  if (!profile.hasCompletedOnboarding) {
    if (onboardingStep === 'welcome') {
      return <Welcome onGetStarted={handleGetStarted} />;
    }

    if (onboardingStep === 'questionnaire') {
      return (
        <FashionQuestionnaire
          onComplete={handleQuestionnaireComplete}
          onBack={handleQuestionnaireBack}
        />
      );
    }
  }

  // Main app - Wardrobe Management
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-uw-purple">Fitted</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Build your wardrobe
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-uw-purple">
                {wardrobeStats.stats.total}
              </div>
              <div className="text-xs text-gray-500">items</div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Progress Card */}
        <div className="bg-gradient-to-r from-uw-purple to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {wardrobeStats.canSwipe ? (
                <>
                  <Unlock className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-bold">Wardrobe Complete!</h2>
                    <p className="text-white/80 text-sm">Ready to find your perfect outfit</p>
                  </div>
                </>
              ) : (
                <>
                  <Lock className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-bold">Build Your Wardrobe</h2>
                    <p className="text-white/80 text-sm">Add items to unlock outfit suggestions</p>
                  </div>
                </>
              )}
            </div>
            {wardrobeStats.canSwipe && (
              <button className="bg-white text-uw-purple px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Start Swiping
              </button>
            )}
          </div>

          {/* Requirements */}
          {!wardrobeStats.canSwipe && (
            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tops</span>
                <span className="text-sm font-semibold">
                  {wardrobeStats.stats.tops} / {MINIMUM_WARDROBE.minTops}
                </span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{
                    width: `${Math.min((wardrobeStats.stats.tops / MINIMUM_WARDROBE.minTops) * 100, 100)}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Bottoms</span>
                <span className="text-sm font-semibold">
                  {wardrobeStats.stats.bottoms} / {MINIMUM_WARDROBE.minBottoms}
                </span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{
                    width: `${Math.min((wardrobeStats.stats.bottoms / MINIMUM_WARDROBE.minBottoms) * 100, 100)}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Shoes</span>
                <span className="text-sm font-semibold">
                  {wardrobeStats.stats.shoes} / {MINIMUM_WARDROBE.minShoes}
                </span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{
                    width: `${Math.min((wardrobeStats.stats.shoes / MINIMUM_WARDROBE.minShoes) * 100, 100)}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                <span className="text-sm font-semibold">Total Items</span>
                <span className="text-sm font-bold">
                  {wardrobeStats.stats.total} / {MINIMUM_WARDROBE.minTotal}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <WardrobeUpload />
        </div>

        {/* Wardrobe Grid */}
        <WardrobeGrid />
      </div>
    </div>
  );
}

export default App;
