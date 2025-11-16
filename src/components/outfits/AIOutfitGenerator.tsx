import { useState, useEffect } from 'react';
import { Sparkles, X, Search, Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ClothingItem, Outfit } from '../../types';
import { getImageURL } from '../../utils/storage';
import { generateOutfits } from '../../utils/outfitGenerator';

type GenerationType = 'occasion' | 'item' | 'freeform' | 'time' | 'location';

export function AIOutfitGenerator() {
  const { wardrobe, profile, addOutfit } = useStore();
  const [generationType, setGenerationType] = useState<GenerationType>('occasion');
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [prompt, setPrompt] = useState('');
  const [occasion, setOccasion] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutfits, setGeneratedOutfits] = useState<Outfit[]>([]);
  const [showItemPicker, setShowItemPicker] = useState(false);

  const occasions = [
    'Casual Day Out',
    'Work/Office',
    'Date Night',
    'Party/Club',
    'Formal Event',
    'Gym/Sports',
    'Beach/Pool',
    'Interview',
    'Coffee Meeting',
    'Brunch',
  ];

  const timeSlots = [
    'Early Morning (6-9 AM)',
    'Late Morning (9 AM-12 PM)',
    'Afternoon (12-5 PM)',
    'Evening (5-9 PM)',
    'Night (9 PM+)',
  ];

  const locations = [
    'Campus/Classes',
    'Library/Study',
    'Gym/IMA',
    'Downtown Seattle',
    'Coffee Shop',
    'Party',
    'Date/Restaurant',
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedOutfits([]);

    try {
      // Simulate AI generation - in production this would call your AI API
      await new Promise(resolve => setTimeout(resolve, 1500));

      let outfits: Outfit[];

      if (generationType === 'item' && selectedItem) {
        // Generate outfits that include the selected item
        outfits = generateOutfits(wardrobe, profile, 5, undefined, selectedItem);
      } else if (generationType === 'time') {
        // Time-based generation (context logged for future AI integration)
        console.log(`Generating outfit for: ${selectedTime}`);
        outfits = generateOutfits(wardrobe, profile, 5);
      } else if (generationType === 'location') {
        // Location-based generation (context logged for future AI integration)
        console.log(`Generating outfit for: ${selectedLocation}`);
        outfits = generateOutfits(wardrobe, profile, 5);
      } else {
        // Generate outfits based on occasion or prompt
        outfits = generateOutfits(wardrobe, profile, 5);
      }

      setGeneratedOutfits(outfits);
    } catch (error) {
      console.error('Failed to generate outfits:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveOutfit = (outfit: Outfit) => {
    addOutfit({ ...outfit, liked: true });
    // Show feedback
    alert('Outfit saved to history!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-uw-purple to-purple-600 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Outfit Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Let AI create perfect outfits for you
          </p>
        </div>

        {/* Generation Type Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            How would you like to generate?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <button
              onClick={() => {
                setGenerationType('occasion');
                setSelectedItem(null);
                setPrompt('');
                setSelectedTime('');
                setSelectedLocation('');
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                generationType === 'occasion'
                  ? 'border-uw-purple bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-uw-purple'
              }`}
            >
              <Calendar className="w-6 h-6 mx-auto mb-2 text-uw-purple" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Occasion
              </div>
            </button>

            <button
              onClick={() => {
                setGenerationType('item');
                setOccasion('');
                setPrompt('');
                setSelectedTime('');
                setSelectedLocation('');
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                generationType === 'item'
                  ? 'border-uw-purple bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-uw-purple'
              }`}
            >
              <Search className="w-6 h-6 mx-auto mb-2 text-uw-purple" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                With Item
              </div>
            </button>

            <button
              onClick={() => {
                setGenerationType('freeform');
                setSelectedItem(null);
                setOccasion('');
                setSelectedTime('');
                setSelectedLocation('');
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                generationType === 'freeform'
                  ? 'border-uw-purple bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-uw-purple'
              }`}
            >
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-uw-purple" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Custom
              </div>
            </button>

            <button
              onClick={() => {
                setGenerationType('time');
                setSelectedItem(null);
                setOccasion('');
                setPrompt('');
                setSelectedLocation('');
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                generationType === 'time'
                  ? 'border-uw-purple bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-uw-purple'
              }`}
            >
              <Clock className="w-6 h-6 mx-auto mb-2 text-uw-purple" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Time
              </div>
            </button>

            <button
              onClick={() => {
                setGenerationType('location');
                setSelectedItem(null);
                setOccasion('');
                setPrompt('');
                setSelectedTime('');
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                generationType === 'location'
                  ? 'border-uw-purple bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-uw-purple'
              }`}
            >
              <MapPin className="w-6 h-6 mx-auto mb-2 text-uw-purple" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Location
              </div>
            </button>
          </div>
        </div>

        {/* Occasion Selector */}
        {generationType === 'occasion' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select an Occasion
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {occasions.map((occ) => (
                <button
                  key={occ}
                  onClick={() => setOccasion(occ)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    occasion === occ
                      ? 'border-uw-purple bg-purple-50 dark:bg-purple-900/20 text-uw-purple'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-uw-purple'
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Item Selector */}
        {generationType === 'item' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select an Item to Include
            </h3>
            {selectedItem ? (
              <div className="relative">
                <ItemPreview item={selectedItem} />
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowItemPicker(true)}
                className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-uw-purple transition-colors"
              >
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Choose from wardrobe
                </div>
              </button>
            )}
          </div>
        )}

        {/* Freeform Prompt */}
        {generationType === 'freeform' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Describe Your Outfit
            </h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., 'Something comfortable for a coffee date' or 'Professional but stylish for a meeting'"
              className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-uw-purple focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 resize-none"
            />
          </div>
        )}

        {/* Time Selector */}
        {generationType === 'time' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Time of Day
            </h3>
            <div className="space-y-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedTime === slot
                      ? 'border-uw-purple bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-uw-purple'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {slot}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Location Selector */}
        {generationType === 'location' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Where are you going?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    selectedLocation === loc
                      ? 'border-uw-purple bg-purple-50 dark:bg-purple-900/20 text-uw-purple'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-uw-purple'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={
            isGenerating ||
            (generationType === 'occasion' && !occasion) ||
            (generationType === 'item' && !selectedItem) ||
            (generationType === 'freeform' && !prompt.trim()) ||
            (generationType === 'time' && !selectedTime) ||
            (generationType === 'location' && !selectedLocation)
          }
          className="w-full py-4 bg-gradient-to-r from-uw-purple to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              Generate Outfits
            </>
          )}
        </button>

        {/* Generated Outfits */}
        {generatedOutfits.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Generated Outfits ({generatedOutfits.length})
            </h3>
            <div className="space-y-4">
              {generatedOutfits.map((outfit, index) => (
                <OutfitPreview
                  key={outfit.id}
                  outfit={outfit}
                  index={index}
                  onSave={() => handleSaveOutfit(outfit)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Item Picker Modal */}
      {showItemPicker && (
        <ItemPickerModal
          wardrobe={wardrobe}
          onSelect={(item) => {
            setSelectedItem(item);
            setShowItemPicker(false);
          }}
          onClose={() => setShowItemPicker(false)}
        />
      )}
    </div>
  );
}

// Item Preview Component
function ItemPreview({ item }: { item: ClothingItem }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      const url = await getImageURL(item.id);
      setImageUrl(url);
    };
    loadImage();

    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [item.id]);

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
        {imageUrl && (
          <img src={imageUrl} alt={item.category} className="w-full h-full object-cover" />
        )}
      </div>
      <div>
        <div className="font-semibold text-gray-900 dark:text-white capitalize">
          {item.category}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {item.colors.length} colors
        </div>
      </div>
    </div>
  );
}

// Outfit Preview Component
function OutfitPreview({ outfit, index, onSave }: { outfit: Outfit; index: number; onSave: () => void }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          Outfit {index + 1}
        </h4>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-uw-purple text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          Save
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {outfit.items.map((item) => (
          <OutfitItemPreview key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

// Outfit Item Preview Component
function OutfitItemPreview({ item }: { item: ClothingItem }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      const url = await getImageURL(item.id);
      setImageUrl(url);
    };
    loadImage();

    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [item.id]);

  return (
    <div className="flex-shrink-0">
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
        {imageUrl && (
          <img src={imageUrl} alt={item.category} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="text-xs text-center mt-1 text-gray-600 dark:text-gray-400 capitalize">
        {item.category}
      </div>
    </div>
  );
}

// Item Picker Modal Component
function ItemPickerModal({
  wardrobe,
  onSelect,
  onClose,
}: {
  wardrobe: ClothingItem[];
  onSelect: (item: ClothingItem) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Choose an Item
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            {wardrobe.map((item) => (
              <ItemPickerCard key={item.id} item={item} onSelect={() => onSelect(item)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Item Picker Card Component
function ItemPickerCard({ item, onSelect }: { item: ClothingItem; onSelect: () => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      const url = await getImageURL(item.id);
      setImageUrl(url);
    };
    loadImage();

    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [item.id]);

  return (
    <button
      onClick={onSelect}
      className="group relative aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 hover:ring-2 hover:ring-uw-purple transition-all"
    >
      {imageUrl && (
        <img src={imageUrl} alt={item.category} className="w-full h-full object-cover" />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
        <div className="text-xs text-white font-medium capitalize">{item.category}</div>
      </div>
    </button>
  );
}
