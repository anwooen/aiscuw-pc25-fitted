import { memo, ReactNode } from 'react';
import { ClothingItem } from '../../types';
import { OutfitItemsDisplay } from './OutfitItemsDisplay';

interface OutfitDisplayCardProps {
  items: ClothingItem[];
  children?: ReactNode;  // Custom footer content (buttons, info, etc.)
  showLabels?: boolean;
  className?: string;
}

/**
 * Reusable card component for displaying outfits
 * Combines OutfitItemsDisplay + custom footer
 *
 * Used by:
 * - OutfitCard (swipe interface) - with color badges footer
 * - TodaysPick (profile page) - with action buttons footer
 */
export const OutfitDisplayCard = memo(({
  items,
  children,
  showLabels = true,
  className = ''
}: OutfitDisplayCardProps) => {
  return (
    <div className={`w-full h-full ${className}`}>
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
    </div>
  );
});

OutfitDisplayCard.displayName = 'OutfitDisplayCard';
