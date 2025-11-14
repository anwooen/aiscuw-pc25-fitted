import { X, Check, ArrowLeft, ArrowRight } from 'lucide-react';

interface SwipeControlsProps {
  onDislike: () => void;
  onLike: () => void;
  disabled?: boolean;
}

export function SwipeControls({ onDislike, onLike, disabled }: SwipeControlsProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Keyboard shortcuts hint */}
      <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-4">
        <span className="flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />
          Dislike
        </span>
        <span className="flex items-center gap-1">
          <ArrowRight className="w-3 h-3" />
          Like
        </span>
      </div>

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
          <div className="relative w-20 h-20 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-200 border-2 border-gray-200 dark:border-gray-700 hover:scale-110 active:scale-95 hover:border-purple-300 dark:hover:border-purple-700">
            <div className="absolute inset-0 rounded-full bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Check className="absolute inset-0 m-auto w-10 h-10 text-purple-500" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-purple-500 transition-colors">
            Like
          </span>
        </button>
      </div>
    </div>
  );
}
