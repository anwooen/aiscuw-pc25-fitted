import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { useStore } from './store/useStore';
import { useWardrobe } from './hooks/useWardrobe';
import { useOutfitGenerator } from './hooks/useOutfitGenerator';
import { Lock, Unlock, Sparkles, Home, Shirt, History, Settings, RotateCcw, Wand2 } from 'lucide-react';
import { MINIMUM_WARDROBE, UserProfile } from './types';
import { AppHeader } from './components/layout/AppHeader';

// Lazy load components for code splitting
const Welcome = lazy(() => import('./components/onboarding/Welcome').then(m => ({ default: m.Welcome })));
const FashionQuestionnaire = lazy(() => import('./components/onboarding/FashionQuestionnaireNew'));
const WardrobeUpload = lazy(() => import('./components/wardrobe/WardrobeUpload').then(m => ({ default: m.WardrobeUpload })));
const WardrobeGrid = lazy(() => import('./components/wardrobe/WardrobeGrid').then(m => ({ default: m.WardrobeGrid })));
const SwipeInterface = lazy(() => import('./components/swipe/SwipeInterface').then(m => ({ default: m.SwipeInterface })));
const TodaysPick = lazy(() => import('./components/profile/TodaysPick').then(m => ({ default: m.TodaysPick })));
const OutfitHistory = lazy(() => import('./components/profile/OutfitHistory').then(m => ({ default: m.OutfitHistory })));
const ProfileSettings = lazy(() => import('./components/profile/ProfileSettings').then(m => ({ default: m.ProfileSettings })));
const AIOutfitGenerator = lazy(() => import('./components/outfits/AIOutfitGenerator').then(m => ({ default: m.AIOutfitGenerator })));

type OnboardingStep = 'welcome' | 'questionnaire' | 'complete';
type AppView = 'wardrobe' | 'swipe' | 'todaysPick' | 'history' | 'settings' | 'aiGenerator';

// Loading fallback component``
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-uw-purple mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Loading...
      </h2>
    </div>
  </div>
);

function App() {
  const { profile, completeOnboardingEnhanced, setDailySuggestions, removeDuplicateOutfits, resetOnboarding } = useStore();
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('welcome');
  const [currentView, setCurrentView] = useState<AppView>('wardrobe');
  const wardrobeStats = useWardrobe();
  const { outfits, loading } = useOutfitGenerator(10);

  // Clean up duplicate outfits on mount
  useEffect(() => {
    removeDuplicateOutfits();
  }, [removeDuplicateOutfits]); // Run once on mount

  // Apply dark mode to document element
  const theme = useStore((state) => state.theme);
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Update store with daily suggestions when they're generated
  useEffect(() => {
    if (outfits.length > 0) {
      setDailySuggestions(outfits);
    }
  }, [outfits, setDailySuggestions]);

  // Check if user has completed onboarding
  useEffect(() => {
    if (profile.hasCompletedOnboarding) {
      setOnboardingStep('complete');
    }
  }, [profile.hasCompletedOnboarding]);


  // Handle onboarding flow with useCallback for performance
  const handleGetStarted = useCallback(() => {
    // Prefetch the questionnaire bundle to avoid a blank/flicker when switching steps
    void import('./components/onboarding/FashionQuestionnaireNew');
    setOnboardingStep('questionnaire');
  }, []);

  // Phase 13: Enhanced questionnaire completion handler
  const handleQuestionnaireCompleteEnhanced = useCallback((data: Partial<UserProfile>) => {
    completeOnboardingEnhanced(data);
    setOnboardingStep('complete');
  }, [completeOnboardingEnhanced]);

  const handleQuestionnaireBack = useCallback(() => {
    setOnboardingStep('welcome');
  }, []);

  // Show onboarding screens
  if (!profile.hasCompletedOnboarding) {
    if (onboardingStep === 'welcome') {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <Welcome onGetStarted={handleGetStarted} />
        </Suspense>
      );
    }

    if (onboardingStep === 'questionnaire') {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <FashionQuestionnaire
            onComplete={handleQuestionnaireCompleteEnhanced}
            onBack={handleQuestionnaireBack}
          />
        </Suspense>
      );
    }
  }

  // Show loading state while generating outfits (only when navigating to swipe view)
  if (loading && wardrobeStats.canSwipe && currentView === 'swipe') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          {/* Spinning loader circle */}
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-uw-purple mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Creating Your Outfits
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Mixing and matching your wardrobe...
          </p>
        </div>
      </div>
    );
  }

  // Bottom Navigation Component - Minimal Style
  const BottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-transparent z-50 flex justify-center pb-4">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCurrentView('todaysPick')}
            className={`relative flex flex-col items-center transition-all ${
              currentView === 'todaysPick' ? 'text-uw-purple scale-110' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Sparkles className="w-7 h-7" />
            {currentView === 'todaysPick' && (
              <div className="absolute -bottom-2 w-1 h-1 bg-uw-purple rounded-full"></div>
            )}
          </button>

          <button
            onClick={() => setCurrentView('aiGenerator')}
            className={`relative flex flex-col items-center transition-all ${
              currentView === 'aiGenerator' ? 'text-uw-purple scale-110' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Wand2 className="w-7 h-7" />
            {currentView === 'aiGenerator' && (
              <div className="absolute -bottom-2 w-1 h-1 bg-uw-purple rounded-full"></div>
            )}
          </button>

          <button
            onClick={() => setCurrentView('wardrobe')}
            className={`relative flex flex-col items-center transition-all ${
              currentView === 'wardrobe' ? 'text-uw-purple scale-110' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Shirt className="w-7 h-7" />
            {currentView === 'wardrobe' && (
              <div className="absolute -bottom-2 w-1 h-1 bg-uw-purple rounded-full"></div>
            )}
          </button>

          <button
            onClick={() => wardrobeStats.canSwipe && setCurrentView('swipe')}
            disabled={!wardrobeStats.canSwipe}
            className={`relative flex flex-col items-center transition-all ${
              currentView === 'swipe'
                ? 'text-uw-purple scale-110'
                : wardrobeStats.canSwipe
                ? 'text-gray-400 hover:text-gray-600'
                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <Home className="w-7 h-7" />
            {currentView === 'swipe' && (
              <div className="absolute -bottom-2 w-1 h-1 bg-uw-purple rounded-full"></div>
            )}
          </button>

          <button
            onClick={() => setCurrentView('history')}
            className={`relative flex flex-col items-center transition-all ${
              currentView === 'history' ? 'text-uw-purple scale-110' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <History className="w-7 h-7" />
            {currentView === 'history' && (
              <div className="absolute -bottom-2 w-1 h-1 bg-uw-purple rounded-full"></div>
            )}
          </button>

          <button
            onClick={() => setCurrentView('settings')}
            className={`relative flex flex-col items-center transition-all ${
              currentView === 'settings' ? 'text-uw-purple scale-110' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Settings className="w-7 h-7" />
            {currentView === 'settings' && (
              <div className="absolute -bottom-2 w-1 h-1 bg-uw-purple rounded-full"></div>
            )}
          </button>
        </div>
      </div>
    </nav>
  );

  // Render different views based on currentView
  if (currentView === 'todaysPick') {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
          <AppHeader subtitle="Today's Pick" />

          <Suspense fallback={<LoadingFallback />}>
            <TodaysPick />
          </Suspense>
        </div>
        <BottomNav />
      </>
    );
  }

  if (currentView === 'history') {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
          <AppHeader subtitle="Outfit History" />

          <Suspense fallback={<LoadingFallback />}>
            <OutfitHistory />
          </Suspense>
        </div>
        <BottomNav />
      </>
    );
  }

  if (currentView === 'aiGenerator') {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
          <AppHeader subtitle="AI Generator" />

          <Suspense fallback={<LoadingFallback />}>
            <AIOutfitGenerator />
          </Suspense>
        </div>
        <BottomNav />
      </>
    );
  }

  if (currentView === 'settings') {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
          <AppHeader subtitle="Settings" />

          <div className="max-w-2xl mx-auto p-6 space-y-6">
            {/* Reset Onboarding Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Reset Onboarding
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Clear your onboarding status to see the Welcome screen and questionnaire again. Your wardrobe data will be preserved.
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to reset onboarding? You will see the Welcome screen again.')) {
                        resetOnboarding();
                        window.location.reload();
                      }
                    }}
                    className="w-full py-4 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Onboarding
                  </button>
                </div>
              </div>
            </div>

            <Suspense fallback={<LoadingFallback />}>
              <ProfileSettings />
            </Suspense>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  // Swipe view - keep keyboard controls intact
  if (currentView === 'swipe') {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
          <AppHeader subtitle="Swipe for outfits" />

          {/* Swipe Interface */}
          <div className="h-[calc(100vh-140px)]">
            <Suspense fallback={<LoadingFallback />}>
              <SwipeInterface onNavigate={setCurrentView} />
            </Suspense>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  // Wardrobe Management View (default)
  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AppHeader
          subtitle="Build your wardrobe"
          extraRightContent={
            <div className="text-right">
              <div className="text-2xl font-bold text-uw-purple">
                {wardrobeStats.stats.total}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">items</div>
            </div>
          }
        />

        <div className="container mx-auto px-4 py-8 max-w-6xl pb-20">
          {/* Progress Card */}
          <div 
            className='rounded-xl shadow-lg p-6 mb-8 text-white'
            style={{
              background: 'linear-gradient(to right, #4b2e83, #9333ea)'
            }}
          >
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
                <button
                  onClick={() => setCurrentView('swipe')}
                  className="bg-white text-uw-purple px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
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
          <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg" />}>
            <div className="mb-8">
              <WardrobeUpload />
            </div>
          </Suspense>

          {/* Wardrobe Grid */}
          <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg" />}>
            <WardrobeGrid />
          </Suspense>
        </div>
      </div>
      <BottomNav />
    </>
  );
}

export default App;
