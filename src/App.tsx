import { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import { useStore } from './store/useStore';
import { useWardrobe } from './hooks/useWardrobe';
import { useOutfitGenerator } from './hooks/useOutfitGenerator';
import { Lock, Unlock, Sparkles, ArrowLeft, Home, Shirt, History, Settings, Moon, Sun } from 'lucide-react';
import { MINIMUM_WARDROBE } from './types';

// Lazy load components for code splitting
const Welcome = lazy(() => import('./components/onboarding/Welcome').then(m => ({ default: m.Welcome })));
const FashionQuestionnaire = lazy(() => import('./components/onboarding/FashionQuestionnaire').then(m => ({ default: m.FashionQuestionnaire })));
const WardrobeUpload = lazy(() => import('./components/wardrobe/WardrobeUpload').then(m => ({ default: m.WardrobeUpload })));
const WardrobeGrid = lazy(() => import('./components/wardrobe/WardrobeGrid').then(m => ({ default: m.WardrobeGrid })));
const SwipeInterface = lazy(() => import('./components/swipe/SwipeInterface').then(m => ({ default: m.SwipeInterface })));
const TodaysPick = lazy(() => import('./components/profile/TodaysPick').then(m => ({ default: m.TodaysPick })));
const OutfitHistory = lazy(() => import('./components/profile/OutfitHistory').then(m => ({ default: m.OutfitHistory })));
const ProfileSettings = lazy(() => import('./components/profile/ProfileSettings').then(m => ({ default: m.ProfileSettings })));

type OnboardingStep = 'welcome' | 'questionnaire' | 'complete';
type AppView = 'wardrobe' | 'swipe' | 'todaysPick' | 'history' | 'settings';

// Loading fallback component
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
  const { profile, completeOnboarding, setDailySuggestions, theme, toggleTheme, removeDuplicateOutfits } = useStore();
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('welcome');
  const [currentView, setCurrentView] = useState<AppView>('wardrobe');
  const wardrobeStats = useWardrobe();
  const { outfits, loading } = useOutfitGenerator(10);

  // Clean up duplicate outfits on mount
  useEffect(() => {
    removeDuplicateOutfits();
  }, [removeDuplicateOutfits]); // Run once on mount

  // Apply dark mode to document element
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
    setOnboardingStep('questionnaire');
  }, []);

  const handleQuestionnaireComplete = useCallback((data: {
    stylePreferences: Record<string, number>;
    favoriteColors: string[];
  }) => {
    completeOnboarding(data.stylePreferences as any, data.favoriteColors);
    setOnboardingStep('complete');
  }, [completeOnboarding]);

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
            onComplete={handleQuestionnaireComplete}
            onBack={handleQuestionnaireBack}
          />
        </Suspense>
      );
    }
  }

  // Show loading state while generating outfits
  if (loading && wardrobeStats.canSwipe) {
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

  // Bottom Navigation Component
  const BottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => setCurrentView('todaysPick')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            currentView === 'todaysPick'
              ? 'text-uw-purple'
              : 'text-gray-500 hover:text-uw-purple'
          }`}
        >
          <Sparkles className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Today</span>
        </button>

        <button
          onClick={() => setCurrentView('wardrobe')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            currentView === 'wardrobe'
              ? 'text-uw-purple'
              : 'text-gray-500 hover:text-uw-purple'
          }`}
        >
          <Shirt className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Wardrobe</span>
        </button>

        <button
          onClick={() => wardrobeStats.canSwipe && setCurrentView('swipe')}
          disabled={!wardrobeStats.canSwipe}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            currentView === 'swipe'
              ? 'text-uw-purple'
              : wardrobeStats.canSwipe
              ? 'text-gray-500 hover:text-uw-purple'
              : 'text-gray-300 cursor-t-allowed'
          }`}
        >
          <Home className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Swipe</span>
        </button>

        <button
          onClick={() => setCurrentView('history')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            currentView === 'history'
              ? 'text-uw-purple'
              : 'text-gray-500 hover:text-uw-purple'
          }`}
        >
          <History className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">History</span>
        </button>

        <button
          onClick={() => setCurrentView('settings')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            currentView === 'settings'
              ? 'text-uw-purple'
              : 'text-gray-500 hover:text-uw-purple'
          }`}
        >
          <Settings className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Settings</span>
        </button>
      </div>
    </nav>
  );

  // Render different views based on currentView
  if (currentView === 'todaysPick') {
    return (
      <>
        <Suspense fallback={<LoadingFallback />}>
          <TodaysPick />
        </Suspense>
        <BottomNav />
      </>
    );
  }

  if (currentView === 'history') {
    return (
      <>
        <Suspense fallback={<LoadingFallback />}>
          <OutfitHistory />
        </Suspense>
        <BottomNav />
      </>
    );
  }

  if (currentView === 'settings') {
    return (
      <>
        <Suspense fallback={<LoadingFallback />}>
          <ProfileSettings />
        </Suspense>
        <BottomNav />
      </>
    );
  }

  // Swipe view - keep keyboard controls intact
  if (currentView === 'swipe') {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-center">
                <h1 className="text-2xl font-bold text-uw-purple dark:text-purple-400">Today's Picks</h1>
              </div>
            </div>
          </header>

          {/* Swipe Interface */}
          <div className="h-[calc(100vh-140px)]">
            <Suspense fallback={<LoadingFallback />}>
              <SwipeInterface />
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
              <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-700" />
                  )}
                </button>
                <div className="text-right">
                  <div className="text-2xl font-bold text-uw-purple">
                    {wardrobeStats.stats.total}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">items</div>
                </div>
              </div>
            </div>
          </div>
        </header>

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
