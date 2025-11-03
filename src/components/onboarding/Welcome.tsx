import React from 'react';
import { Shirt } from 'lucide-react';
import { Button } from '../shared/Button';

interface WelcomeProps {
  onGetStarted: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-uw-purple via-uw-purple/90 to-uw-purple/80 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div
            className="p-6 rounded-full backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))'
            }}
          >
            <Shirt className="w-20 h-20 text-white" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-6xl font-bold text-white mb-4">
          Fitted
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-white mb-3">
          Your UW Wardrobe Assistant
        </p>

        {/* Description */}
        <p className="text-white/90 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
          Organize your wardrobe, get personalized outfit suggestions, and never wonder what to wear again.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-white/90">
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-3xl mb-2">👕</div>
            <h3 className="font-semibold mb-1">Organize</h3>
            <p className="text-sm">Digital wardrobe at your fingertips</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-3xl mb-2">✨</div>
            <h3 className="font-semibold mb-1">Discover</h3>
            <p className="text-sm">Swipe through outfit suggestions</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold mb-1">Perfect</h3>
            <p className="text-sm">Personalized to your style</p>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onGetStarted}
          size="lg"
          variant="secondary"
          className="shadow-xl hover:shadow-2xl"
        >
          Get Started
        </Button>

        {/* UW Branding */}
        <p className="text-white/60 text-sm mt-8">
          Made for the University of Washington community
        </p>
      </div>
    </div>
  );
};
