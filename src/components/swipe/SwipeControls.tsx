import { X, Heart, ArrowLeft, ArrowRight } from 'lucide-react';

interface SwipeControlsProps {
  onDislike: () => void;
  onLike: () => void;
  disabled?: boolean;
}

export function SwipeControls({ onDislike, onLike, disabled }: SwipeControlsProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-center gap-12">
        {/* Dislike Button - Enhanced for Desktop */}
        <button
          onClick={onDislike}
          disabled={disabled}
          className="group relative flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Dislike outfit"
        >
          <div className="relative w-20 h-20 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-200 border-2 border-gray-200 dark:border-gray-700 hover:scale-110 active:scale-95 hover:border-red-300 dark:hover:border-red-700">
            <div className="absolute inset-0 rounded-full bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <X className="absolute inset-0 m-auto w-10 h-10 text-red-500" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-red-500 transition-colors">
            Dislike
          </span>
        </button>

        {/* Like Button - Enhanced for Desktop */}
        <button
          onClick={onLike}
          disabled={disabled}
          className="group relative flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Like outfit"
        >
          <div
            className="relative w-20 h-20 rounded-full shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              background: 'linear-gradient(to bottom right, #4b2e83, #7c3aed)'
            }}
          >
            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Heart className="absolute inset-0 m-auto w-10 h-10" style={{ color: '#ffffff', fill: '#ffffff' }} strokeWidth={0} />
          </div>
          <span className="text-sm font-bold text-uw-purple dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
            Like
          </span>
        </button>
      </div>
    </div>
  );
}
