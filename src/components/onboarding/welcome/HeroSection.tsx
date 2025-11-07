import React from 'react';
import { motion } from 'framer-motion';
import {
  titleContainerVariants,
  titleLetterVariants,
  subtitleVariants,
  descriptionVariants,
} from '../animations/textAnimations';

export const HeroSection: React.FC = () => {
  const title = 'Fitted';
  const subtitle = 'Your closet, reimagined.';
  const description = 'Upload your wardrobe, get AI-powered outfit suggestions, and never wonder what to wear again.';

  return (
    <div className="text-center max-w-2xl mx-auto px-4 relative z-10">
      {/* Animated Title with Gradient */}
      <motion.h1
        className="text-6xl md:text-8xl lg:text-9xl font-extrabold mb-4"
        variants={titleContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {title.split('').map((letter, index) => (
          <motion.span
            key={`${letter}-${index}`}
            variants={titleLetterVariants}
            className="inline-block bg-gradient-to-r from-uw-purple via-uw-gold to-uw-purple bg-clip-text text-transparent"
            style={{
              backgroundSize: '200% 200%',
              textShadow: '0 4px 20px rgba(75, 46, 131, 0.4)',
            }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.h1>

      {/* Animated Subtitle */}
      <motion.p
        className="text-2xl md:text-3xl lg:text-4xl text-white font-normal mb-6 tracking-tight"
        variants={subtitleVariants}
        initial="hidden"
        animate="visible"
        style={{ letterSpacing: '-0.02em' }}
      >
        {subtitle}
      </motion.p>

      {/* Animated Description */}
      <motion.p
        className="text-base md:text-lg text-white max-w-lg mx-auto leading-relaxed font-light"
        variants={descriptionVariants}
        initial="hidden"
        animate="visible"
      >
        {description}
      </motion.p>
    </div>
  );
};
