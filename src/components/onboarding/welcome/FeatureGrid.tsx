import React from 'react';
import { Upload, Sparkles, ArrowLeftRight } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

const features = [
  {
    icon: Upload,
    title: 'Upload & Organize',
    description: 'Snap photos of your clothes and build your digital wardrobe',
    iconAnimation: 'rotate' as const,
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Suggestions',
    description: 'Get personalized outfit recommendations based on weather and style',
    iconAnimation: 'glow' as const,
  },
  {
    icon: ArrowLeftRight,
    title: 'Swipe to Choose',
    description: 'Find your perfect outfit in seconds with our intuitive swipe interface',
    iconAnimation: 'swipe' as const,
  },
];

export const FeatureGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4 relative z-10">
      {features.map((feature, index) => (
        <FeatureCard
          key={feature.title}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          delay={1.8 + index * 0.15}
          iconAnimation={feature.iconAnimation}
        />
      ))}
    </div>
  );
};
