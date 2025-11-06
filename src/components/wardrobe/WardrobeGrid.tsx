import { useState, useCallback, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ClothingItem } from './ClothingItem';
// Removed global loading spinner here — spinner will be shown in the upload UI instead
import { deleteImage } from '../../utils/storage';
import type { ClothingCategory } from '../../types';

const filters: { value: ClothingCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'top', label: 'Tops' },
  { value: 'bottom', label: 'Bottoms' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'accessory', label: 'Accessories' },
];

export const WardrobeGrid = () => {
  const { wardrobe, removeClothingItem } = useStore();
  const [selectedFilter, setSelectedFilter] = useState<ClothingCategory | 'all'>('all');

  const handleDelete = useCallback(async (id: string) => {
    try {
      // Delete from IndexedDB
      await deleteImage(id);
      // Remove from store
      removeClothingItem(id);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  }, [removeClothingItem]);

  const filteredWardrobe = useMemo(() =>
    selectedFilter === 'all'
      ? wardrobe
      : wardrobe.filter(item => item.category === selectedFilter),
    [selectedFilter, wardrobe]
  );

  // Get counts for each category - memoized
  const getCategoryCount = useCallback((category: ClothingCategory | 'all') => {
    if (category === 'all') return wardrobe.length;
    return wardrobe.filter(item => item.category === category).length;
  }, [wardrobe]);

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filter</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const count = getCategoryCount(filter.value);
            return (
              <button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value)}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${
                    selectedFilter === filter.value
                      ? 'bg-uw-purple text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                {filter.label}
                {count > 0 && (
                  <span className={`ml-1.5 ${
                    selectedFilter === filter.value ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {filteredWardrobe.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredWardrobe.map((item) => (
            <ClothingItem
              key={item.id}
              item={item}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12">
          <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {selectedFilter === 'all' ? 'No items yet' : `No ${selectedFilter}s yet`}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedFilter === 'all'
                  ? 'Start building your wardrobe by adding your first item above'
                  : `Add some ${selectedFilter}s to your wardrobe`}
              </p>
            </div>
        </div>
      )}
    </div>
  );
};
