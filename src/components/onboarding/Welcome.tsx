import React from 'react';
import { AnimatedBackground } from './welcome/AnimatedBackground';
import { FloatingClothing } from './welcome/FloatingClothing';
import { HeroSection } from './welcome/HeroSection';
import { FeatureGrid } from './welcome/FeatureGrid';
import { CTAButton } from './welcome/CTAButton';

interface WelcomeProps {
  onGetStarted: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onGetStarted }) => {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center"
      style={{
        // Inline background to prevent FOUC (Flash of Unstyled Content)
        background: 'linear-gradient(to bottom right, #581c87, #6b21a8)',
        // Ensure the background is painted immediately
        backgroundColor: '#6b21a8',
      }}
    >
      {/* Animated Background with Parallax */}
      <AnimatedBackground />

      {/* Floating Clothing Items */}
      <FloatingClothing />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-12 py-20 animate-fade-in">
        {/* Hero Section with Animated Text */}
        <HeroSection />

        {/* Feature Cards with NO Emojis */}
        <FeatureGrid />

        {/* CTA Button */}
        <div className="mt-8">
          <CTAButton onClick={onGetStarted} delay={2.4} />
        </div>

        {/* UW Branding Footer */}
        <p className="text-white/60 text-sm mt-4">
          Made for the University of Washington community
        </p>
      </div>
    </div>
  );
};
