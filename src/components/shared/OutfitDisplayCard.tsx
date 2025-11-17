import { memo, ReactNode } from 'react';
import { ClothingItem } from '../../types';
import { Card3D } from './Card3D';
import { OutfitItemsDisplay } from './OutfitItemsDisplay';

interface OutfitDisplayCardProps {
  items: ClothingItem[];
  children?: ReactNode;  // Custom footer content (buttons, info, etc.)
  depth?: 'shallow' | 'medium' | 'deep';
  showLabels?: boolean;
  className?: string;
}

/**
 * Reusable card component for displaying outfits with 3D tilt effect
 * Combines Card3D wrapper + OutfitItemsDisplay + custom footer
 *
 * Used by:
 * - OutfitCard (swipe interface) - with color badges footer
 * - TodaysPick (profile page) - with action buttons footer
 */
export const OutfitDisplayCard = memo(({
  items,
  children,
  depth = 'deep',
  showLabels = true,
  className = ''
}: OutfitDisplayCardProps) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Card3D depth={depth} className="w-full h-full">
        <div className="w-full h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="h-full flex flex-col">
            {/* Outfit Items Display */}
            <div className="flex-1 p-6 overflow-y-auto">
              <OutfitItemsDisplay items={items} showLabels={showLabels} />
            </div>

            {/* Custom Footer (optional) */}
            {children && (
              <div className="flex-shrink-0">
                {children}
              </div>
            )}
          </div>
        </div>
      </Card3D>
    </div>
  );
});

OutfitDisplayCard.displayName = 'OutfitDisplayCard';
