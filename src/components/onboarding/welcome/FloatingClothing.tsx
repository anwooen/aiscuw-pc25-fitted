import React from 'react';
import { ClothingItem } from './ClothingItem';
import { useMouseTracking } from '../animations/useMouseTracking';
import { getRandomDuration } from '../animations/floatingAnimations';

// Import all clothing SVG icons
import { TShirtIcon } from '../../../assets/clothing/TShirtIcon';
import { HoodieIcon } from '../../../assets/clothing/HoodieIcon';
import { JeansIcon } from '../../../assets/clothing/JeansIcon';
import { ShortsIcon } from '../../../assets/clothing/ShortsIcon';
import { SneakersIcon } from '../../../assets/clothing/SneakersIcon';
import { BootsIcon } from '../../../assets/clothing/BootsIcon';
import { HatIcon } from '../../../assets/clothing/HatIcon';
import { JacketIcon } from '../../../assets/clothing/JacketIcon';

// Configuration for each clothing item
const clothingItems = [
  {
    id: 'hoodie',
    svg: <HoodieIcon />,
    position: { x: '15%', y: '10%' },
    size: 120,
    opacity: 0.12,
    depth: 2 as const,
  },
  {
    id: 'sneakers',
    svg: <SneakersIcon />,
    position: { x: '85%', y: '15%' },
    size: 100,
    opacity: 0.1,
    depth: 3 as const,
  },
  {
    id: 'jeans',
    svg: <JeansIcon />,
    position: { x: '10%', y: '40%' },
    size: 110,
    opacity: 0.11,
    depth: 2 as const,
  },
  {
    id: 'hat',
    svg: <HatIcon />,
    position: { x: '88%', y: '45%' },
    size: 90,
    opacity: 0.08,
    depth: 3 as const,
  },
  {
    id: 'boots',
    svg: <BootsIcon />,
    position: { x: '12%', y: '75%' },
    size: 95,
    opacity: 0.09,
    depth: 3 as const,
  },
  {
    id: 'jacket',
    svg: <JacketIcon />,
    position: { x: '82%', y: '70%' },
    size: 130,
    opacity: 0.13,
    depth: 1 as const,
  },
  {
    id: 'tshirt',
    svg: <TShirtIcon />,
    position: { x: '30%', y: '25%' },
    size: 115,
    opacity: 0.15,
    depth: 1 as const,
  },
  {
    id: 'shorts',
    svg: <ShortsIcon />,
    position: { x: '68%', y: '60%' },
    size: 105,
    opacity: 0.1,
    depth: 2 as const,
  },
];

export const FloatingClothing: React.FC = () => {
  const { mousePosition, isMouseActive } = useMouseTracking();

  return (
    <div className="absolute inset-0 pointer-events-none hidden md:block" aria-hidden="true" role="presentation">
      {clothingItems.map((item, index) => (
        <ClothingItem
          key={item.id}
          svg={item.svg}
          position={item.position}
          size={item.size}
          opacity={item.opacity}
          floatDuration={getRandomDuration(6, 10)}
          rotateDuration={getRandomDuration(8, 12)}
          depth={item.depth}
          delay={index * 0.1}
          mousePosition={mousePosition}
          isMouseActive={isMouseActive}
        />
      ))}

      {/* Mobile: Show only 4 items */}
      <div className="md:hidden">
        {clothingItems.slice(0, 4).map((item, index) => (
          <ClothingItem
            key={`mobile-${item.id}`}
            svg={item.svg}
            position={item.position}
            size={Math.min(item.size * 0.7, 80)} // Smaller on mobile
            opacity={item.opacity}
            floatDuration={getRandomDuration(7, 9)}
            rotateDuration={getRandomDuration(9, 11)}
            depth={item.depth}
            delay={index * 0.1}
            mousePosition={{ x: 0, y: 0 }} // No parallax on mobile
            isMouseActive={false}
          />
        ))}
      </div>
    </div>
  );
};
