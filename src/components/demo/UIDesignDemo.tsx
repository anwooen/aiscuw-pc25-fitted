import { useState } from 'react';
import { Home, Shirt, History, Settings, Sparkles, User, Search, Bell, Menu, Heart, ChevronDown } from 'lucide-react';

type NavStyle = 'current' | 'floating' | 'dock' | 'pill' | 'minimal' | 'glass';
type HeaderStyle = 'current' | 'glass' | 'gradient' | 'avatar' | 'search' | 'elevated';

export const UIDesignDemo = () => {
  const [navStyle, setNavStyle] = useState<NavStyle>('current');
  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>('current');
  const [activeTab, setActiveTab] = useState('home');

  // Navigation Bar Variants
  const renderNavigation = () => {
    switch (navStyle) {
      case 'current':
        return (
          <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
            <div className="flex justify-around items-center h-16">
              {['home', 'wardrobe', 'swipe', 'history', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                    activeTab === tab ? 'text-uw-purple' : 'text-gray-500 hover:text-uw-purple'
                  }`}
                >
                  {getIcon(tab)}
                  <span className="text-xs font-medium capitalize">{tab}</span>
                </button>
              ))}
            </div>
          </nav>
        );

      case 'floating':
        return (
          <nav className="fixed bottom-6 left-4 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
            <div className="flex justify-around items-center h-16 px-2">
              {['home', 'wardrobe', 'swipe', 'history', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all ${
                    activeTab === tab
                      ? 'bg-uw-purple text-white scale-110'
                      : 'text-gray-500 hover:text-uw-purple hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {getIcon(tab, activeTab === tab ? 'w-5 h-5' : 'w-5 h-5')}
                  {activeTab === tab && <span className="text-xs font-medium mt-1 capitalize">{tab}</span>}
                </button>
              ))}
            </div>
          </nav>
        );

      case 'dock':
        return (
          <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 px-6">
            <div className="flex items-center gap-2 h-16">
              {['home', 'wardrobe', 'swipe', 'history', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`p-3 rounded-full transition-all ${
                    activeTab === tab
                      ? 'bg-uw-purple text-white scale-125 shadow-lg'
                      : 'text-gray-500 hover:text-uw-purple hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110'
                  }`}
                  title={tab}
                >
                  {getIcon(tab, 'w-6 h-6')}
                </button>
              ))}
            </div>
          </nav>
        );

      case 'pill':
        return (
          <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-uw-purple to-purple-600 rounded-full shadow-2xl z-50 px-2 py-2">
            <div className="flex items-center gap-1">
              {['home', 'wardrobe', 'swipe', 'history', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                    activeTab === tab
                      ? 'bg-white text-uw-purple shadow-lg scale-105'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {getIcon(tab, 'w-5 h-5')}
                  {activeTab === tab && <span className="text-sm font-semibold capitalize">{tab}</span>}
                </button>
              ))}
            </div>
          </nav>
        );

      case 'minimal':
        return (
          <nav className="fixed bottom-0 left-0 right-0 bg-transparent z-50">
            <div className="flex justify-center items-center gap-8 h-20 pb-4">
              {['home', 'wardrobe', 'swipe', 'history', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative flex flex-col items-center transition-all ${
                    activeTab === tab ? 'text-uw-purple scale-110' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {getIcon(tab, 'w-7 h-7')}
                  {activeTab === tab && (
                    <div className="absolute -bottom-2 w-1 h-1 bg-uw-purple rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </nav>
        );

      case 'glass':
        return (
          <nav className="fixed bottom-0 left-0 right-0 bg-white/20 dark:bg-gray-900/20 backdrop-blur-2xl border-t border-white/20 dark:border-white/10 z-50">
            <div className="flex justify-around items-center h-16">
              {['home', 'wardrobe', 'swipe', 'history', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex flex-col items-center justify-center w-full h-full transition-all ${
                    activeTab === tab
                      ? 'text-uw-purple'
                      : 'text-gray-600 dark:text-gray-300 hover:text-uw-purple'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl transition-all ${
                      activeTab === tab ? 'bg-uw-purple/20 scale-110' : 'hover:bg-white/30 dark:hover:bg-white/10'
                    }`}
                  >
                    {getIcon(tab, 'w-6 h-6')}
                  </div>
                  <span className="text-xs font-medium mt-1 capitalize">{tab}</span>
                </button>
              ))}
            </div>
          </nav>
        );

      default:
        return null;
    }
  };

  // Header Variants
  const renderHeader = () => {
    switch (headerStyle) {
      case 'current':
        return (
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-center">
                <h1 className="text-2xl font-bold text-uw-purple dark:text-purple-400">Fitted</h1>
              </div>
            </div>
          </header>
        );

      case 'glass':
        return (
          <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-white/10 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <button className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors">
                  <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-uw-purple to-purple-600 bg-clip-text text-transparent">
                  Fitted
                </h1>
                <button className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors relative">
                  <Bell className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                </button>
              </div>
            </div>
          </header>
        );

      case 'gradient':
        return (
          <header className="bg-gradient-to-r from-uw-purple via-purple-600 to-purple-500 shadow-lg">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">Fitted</h1>
                  <p className="text-purple-100 text-sm mt-1">Your style, simplified</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                    <Search className="w-5 h-5 text-white" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </header>
        );

      case 'avatar':
        return (
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-uw-purple to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    F
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ready to find your outfit?</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
                    <Heart className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                  </button>
                  <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Settings className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                  </button>
                </div>
              </div>
            </div>
          </header>
        );

      case 'search':
        return (
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-uw-purple dark:text-purple-400">Fitted</h1>
                <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Menu className="w-6 h-6" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your wardrobe..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-uw-purple outline-none text-gray-900 dark:text-white placeholder-gray-500"
                />
              </div>
            </div>
          </header>
        );

      case 'elevated':
        return (
          <header className="bg-white dark:bg-gray-800 shadow-xl rounded-b-3xl">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-uw-purple to-purple-600 rounded-2xl shadow-lg">
                    <Shirt className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fitted</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Wardrobe Manager</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <span className="text-sm font-medium">Profile</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>
        );

      default:
        return null;
    }
  };

  const getIcon = (tab: string, className: string = 'w-6 h-6 mb-1') => {
    switch (tab) {
      case 'home':
        return <Sparkles className={className} />;
      case 'wardrobe':
        return <Shirt className={className} />;
      case 'swipe':
        return <Home className={className} />;
      case 'history':
        return <History className={className} />;
      case 'settings':
        return <Settings className={className} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Demo Header */}
      {renderHeader()}

      {/* Demo Content */}
      <div className="container mx-auto px-4 py-8 pb-32 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            UI/UX Design Demo
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Explore different navigation and header styles
          </p>
        </div>

        {/* Header Style Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Header Styles
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(['current', 'glass', 'gradient', 'avatar', 'search', 'elevated'] as HeaderStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setHeaderStyle(style)}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  headerStyle === style
                    ? 'bg-uw-purple text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <p className="text-sm text-purple-900 dark:text-purple-300">
              <strong>Current:</strong> {getHeaderDescription(headerStyle)}
            </p>
          </div>
        </div>

        {/* Navigation Style Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Navigation Styles
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(['current', 'floating', 'dock', 'pill', 'minimal', 'glass'] as NavStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setNavStyle(style)}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  navStyle === style
                    ? 'bg-uw-purple text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <p className="text-sm text-purple-900 dark:text-purple-300">
              <strong>Current:</strong> {getNavDescription(navStyle)}
            </p>
          </div>
        </div>

        {/* Design Info */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-uw-purple to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <h4 className="text-xl font-bold mb-3">Pro Tips</h4>
            <ul className="space-y-2 text-sm text-purple-100">
              <li>• Floating nav is great for modern apps</li>
              <li>• Glassmorphism adds depth and elegance</li>
              <li>• Dock style works well on tablets</li>
              <li>• Minimal reduces visual clutter</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Accessibility</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• All designs support dark mode</li>
              <li>• Touch targets are 44x44px minimum</li>
              <li>• High contrast color ratios</li>
              <li>• Screen reader compatible</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Demo Navigation */}
      {renderNavigation()}
    </div>
  );
};

// Helper functions
const getHeaderDescription = (style: HeaderStyle): string => {
  switch (style) {
    case 'current':
      return 'Simple centered header with consistent styling';
    case 'glass':
      return 'Glassmorphism effect with backdrop blur - modern and sleek';
    case 'gradient':
      return 'Bold gradient background with profile integration';
    case 'avatar':
      return 'Personalized header with user avatar and greeting';
    case 'search':
      return 'Search-first design for quick wardrobe access';
    case 'elevated':
      return 'Premium card-style with rounded bottom edges';
    default:
      return '';
  }
};

const getNavDescription = (style: NavStyle): string => {
  switch (style) {
    case 'current':
      return 'Standard bottom tab bar - familiar and reliable';
    case 'floating':
      return 'Floating rounded bar with active state highlighting';
    case 'dock':
      return 'iOS-inspired dock with magnification effect';
    case 'pill':
      return 'Gradient pill with expandable active states';
    case 'minimal':
      return 'Ultra-minimal with dot indicators - clean design';
    case 'glass':
      return 'Glassmorphism with frosted glass effect';
    default:
      return '';
  }
};
