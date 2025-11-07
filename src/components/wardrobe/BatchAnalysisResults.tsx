import React, { useState, useCallback } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit2,
  Save,
  RotateCcw,
  Check,
  X,
} from 'lucide-react';
import { ClothingCategory, AIClothingAnalysis } from '../../types';
import { QueuedFile, AnalysisResult } from '../../hooks/useBatchAnalysis';
import { useStore } from '../../store/useStore';

interface BatchAnalysisResultsProps {
  results: Map<string, AnalysisResult>;
  queue: QueuedFile[];
  onComplete: () => void;
  onRetry: () => void;
  onUpdateResult: (fileId: string, updates: Partial<AIClothingAnalysis>) => void;
}

interface EditState {
  [fileId: string]: boolean;
}

interface EditValues {
  [fileId: string]: Partial<AIClothingAnalysis>;
}

const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  top: 'Top',
  bottom: 'Bottom',
  shoes: 'Shoes',
  accessory: 'Accessory',
  outerwear: 'Outerwear',
};

const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.5,
};

/**
 * Get confidence indicator color and icon
 */
const getConfidenceIndicator = (confidence: number) => {
  if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
    return {
      color: 'text-green-600 dark:text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      icon: CheckCircle,
      label: 'High confidence',
    };
  } else if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) {
    return {
      color: 'text-amber-600 dark:text-amber-500',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      icon: AlertTriangle,
      label: 'Medium confidence - Review recommended',
    };
  } else {
    return {
      color: 'text-red-600 dark:text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      icon: XCircle,
      label: 'Low confidence - Manual review required',
    };
  }
};

/**
 * BatchAnalysisResults Component
 *
 * Displays analysis results with:
 * - Confidence indicators (green/yellow/red)
 * - Individual result editing
 * - Bulk actions (Accept All, Save to Wardrobe)
 * - Retry failed items
 */
export const BatchAnalysisResults: React.FC<BatchAnalysisResultsProps> = ({
  results,
  queue,
  onComplete,
  onRetry,
  onUpdateResult,
}) => {
  const addClothingItem = useStore((state) => state.addClothingItem);
  const [editState, setEditState] = useState<EditState>({});
  const [editValues, setEditValues] = useState<EditValues>({});

  // Calculate stats
  const successResults = Array.from(results.values()).filter((r) => r.status === 'success');
  const errorResults = Array.from(results.values()).filter((r) => r.status === 'error');
  const highConfidence = successResults.filter((r) => (r.confidence || 0) >= CONFIDENCE_THRESHOLDS.HIGH);
  const mediumConfidence = successResults.filter(
    (r) => (r.confidence || 0) >= CONFIDENCE_THRESHOLDS.MEDIUM && (r.confidence || 0) < CONFIDENCE_THRESHOLDS.HIGH
  );
  const lowConfidence = successResults.filter((r) => (r.confidence || 0) < CONFIDENCE_THRESHOLDS.MEDIUM);

  /**
   * Toggle edit mode for a result
   */
  const toggleEdit = useCallback((fileId: string) => {
    setEditState((prev) => ({
      ...prev,
      [fileId]: !prev[fileId],
    }));

    // Initialize edit values if entering edit mode
    const result = results.get(fileId);
    if (result && !editState[fileId]) {
      setEditValues((prev) => ({
        ...prev,
        [fileId]: { ...result.analysis },
      }));
    }
  }, [editState, results]);

  /**
   * Save edited result
   */
  const saveEdit = useCallback((fileId: string) => {
    const updates = editValues[fileId];
    if (updates) {
      onUpdateResult(fileId, updates);
    }
    setEditState((prev) => ({
      ...prev,
      [fileId]: false,
    }));
  }, [editValues, onUpdateResult]);

  /**
   * Cancel edit
   */
  const cancelEdit = useCallback((fileId: string) => {
    setEditState((prev) => ({
      ...prev,
      [fileId]: false,
    }));
    setEditValues((prev) => {
      const newValues = { ...prev };
      delete newValues[fileId];
      return newValues;
    });
  }, []);

  /**
   * Update edit value
   */
  const updateEditValue = useCallback((fileId: string, field: keyof AIClothingAnalysis, value: any) => {
    setEditValues((prev) => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        [field]: value,
      },
    }));
  }, []);

  /**
   * Save all successful results to wardrobe
   */
  const handleSaveAll = useCallback(async () => {
    let savedCount = 0;

    for (const queuedFile of queue) {
      const result = results.get(queuedFile.id);

      if (result && result.status === 'success') {
        const category = queuedFile.category || result.analysis.suggestedCategory;
        const clothingItem = {
          id: crypto.randomUUID(),
          image: queuedFile.preview, // Use preview image
          category: category,
          colors: result.analysis.detectedColors,
          style: result.analysis.suggestedStyles,
          uploadedAt: new Date(),
          aiAnalysis: result.analysis,
        };

        addClothingItem(clothingItem);
        savedCount++;
      }
    }

    alert(`Successfully saved ${savedCount} items to your wardrobe!`);
    onComplete();
  }, [queue, results, addClothingItem, onComplete]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analysis Results
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and edit AI analysis before saving to your wardrobe
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {successResults.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">
              {highConfidence.length}
            </div>
            <div className="text-sm text-green-700 dark:text-green-400">High Confidence</div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">
              {mediumConfidence.length}
            </div>
            <div className="text-sm text-amber-700 dark:text-amber-400">Needs Review</div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="text-2xl font-bold text-red-600 dark:text-red-500">
              {errorResults.length + lowConfidence.length}
            </div>
            <div className="text-sm text-red-700 dark:text-red-400">Errors/Low Conf.</div>
          </div>
        </div>

        {/* Retry Failed Button */}
        {errorResults.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                  {errorResults.length} item{errorResults.length !== 1 ? 's' : ''} failed to analyze
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  You can retry the failed items or proceed with the successful ones
                </p>
              </div>
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RotateCcw size={16} />
                Retry Failed
              </button>
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="space-y-4 mb-6">
          {queue.map((queuedFile) => {
            const result = results.get(queuedFile.id);
            if (!result) return null;

            const isEditing = editState[queuedFile.id];
            const editValue = editValues[queuedFile.id] || result.analysis;
            const indicator = getConfidenceIndicator(result.confidence || 0);
            const IndicatorIcon = indicator.icon;

            return (
              <div
                key={queuedFile.id}
                className={`
                  bg-white dark:bg-gray-800 rounded-lg overflow-hidden
                  border-2 transition-all
                  ${result.status === 'error'
                    ? 'border-red-300 dark:border-red-700'
                    : `border-gray-200 dark:border-gray-700 ${isEditing ? 'ring-2 ring-uw-purple' : ''}`
                  }
                `}
              >
                <div className="p-4">
                  <div className="flex gap-4">
                    {/* Preview Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={queuedFile.preview}
                        alt={queuedFile.originalName}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      {/* File Name & Confidence */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {queuedFile.originalName}
                          </h3>
                          {result.status === 'success' && (
                            <div className={`flex items-center gap-1 mt-1 ${indicator.color}`}>
                              <IndicatorIcon size={14} />
                              <span className="text-xs">{indicator.label}</span>
                            </div>
                          )}
                          {result.status === 'error' && (
                            <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-500">
                              <XCircle size={14} />
                              <span className="text-xs">{result.error}</span>
                            </div>
                          )}
                        </div>

                        {/* Edit/Save Buttons */}
                        {result.status === 'success' && (
                          <div className="flex gap-2">
                            {!isEditing ? (
                              <button
                                onClick={() => toggleEdit(queuedFile.id)}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                aria-label="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => saveEdit(queuedFile.id)}
                                  className="p-2 text-green-600 dark:text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                  aria-label="Save"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => cancelEdit(queuedFile.id)}
                                  className="p-2 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                  aria-label="Cancel"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Analysis Details (Editable) */}
                      {result.status === 'success' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Category */}
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                              Category
                            </label>
                            {isEditing ? (
                              <select
                                value={editValue.suggestedCategory}
                                onChange={(e) =>
                                  updateEditValue(
                                    queuedFile.id,
                                    'suggestedCategory',
                                    e.target.value as ClothingCategory
                                  )
                                }
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              >
                                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {CATEGORY_LABELS[result.analysis.suggestedCategory]}
                              </div>
                            )}
                          </div>

                          {/* Colors */}
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                              Colors
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {result.analysis.detectedColors.slice(0, 4).map((color, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-900 dark:text-white"
                                >
                                  {color}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Season */}
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                              Season
                            </label>
                            <div className="text-sm text-gray-900 dark:text-white capitalize">
                              {result.analysis.season}
                            </div>
                          </div>

                          {/* Formality */}
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                              Formality
                            </label>
                            <div className="text-sm text-gray-900 dark:text-white capitalize">
                              {result.analysis.formality}
                            </div>
                          </div>

                          {/* Description */}
                          {result.analysis.description && (
                            <div className="md:col-span-2">
                              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                                Description
                              </label>
                              <div className="text-sm text-gray-700 dark:text-gray-300">
                                {result.analysis.description}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSaveAll}
            disabled={successResults.length === 0}
            className="
              flex-1 bg-uw-purple text-white px-6 py-3 rounded-lg
              font-medium hover:bg-uw-purple/90 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
          >
            <Save size={20} />
            Save {successResults.length} Item{successResults.length !== 1 ? 's' : ''} to Wardrobe
          </button>

          <button
            onClick={onComplete}
            className="
              px-6 py-3 rounded-lg font-medium
              border border-gray-300 dark:border-gray-700
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition-colors
            "
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
