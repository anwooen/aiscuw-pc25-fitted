import { memo } from 'react';
import { Outfit } from '../../types';
import { OutfitDisplayCard } from '../shared/OutfitDisplayCard';

interface OutfitCardProps {
  outfit: Outfit;
}

export const OutfitCard = memo(({ outfit }: OutfitCardProps) => {
  return (
    <OutfitDisplayCard items={outfit.items}>
      {/* Outfit Info Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {outfit.items.length} items
            </p>
          </div>
          <div className="flex gap-2">
            {outfit.items.slice(0, 3).map((item) =>
              item.colors.slice(0, 2).map((color, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </OutfitDisplayCard>
  );
});

OutfitCard.displayName = 'OutfitCard';
