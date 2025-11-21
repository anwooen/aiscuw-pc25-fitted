/**
 * Processing Metrics System
 *
 * Tracks image processing performance for A/B testing Fast Crop vs ML Removal.
 * Provides granular per-file metrics and aggregated batch statistics.
 */

import type { ProcessingMode } from '../processors/ImageProcessor.interface';

// ============================================================================
// Types
// ============================================================================

/**
 * Granular metric for a single file processing operation
 */
export interface FileMetric {
  id: string;
  fileName: string;
  mode: ProcessingMode;
  startTime: number;      // Unix timestamp (ms)
  endTime?: number;       // Unix timestamp (ms)
  duration?: number;      // Milliseconds
  success: boolean;
  error?: string;
  timestamp: Date;        // When metric was created
}

/**
 * Aggregated statistics for a batch of files (same mode)
 */
export interface BatchMetrics {
  mode: ProcessingMode;
  fileCount: number;
  totalTime: number;      // Milliseconds
  avgTimePerFile: number; // Milliseconds
  medianTime: number;     // Milliseconds
  p95Time: number;        // Milliseconds (95th percentile)
  successCount: number;
  errorCount: number;
  timestamp: Date;        // When batch completed
}

// ============================================================================
// Storage
// ============================================================================

const STORAGE_KEY = 'fitted_processing_metrics';
const MAX_METRICS = 1000; // Prevent unbounded growth

/**
 * In-memory cache of active metrics (not yet completed)
 */
const activeMetrics = new Map<string, FileMetric>();

/**
 * Load metrics from localStorage
 */
function loadMetrics(): FileMetric[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    // Rehydrate Date objects
    return parsed.map((m: FileMetric) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }));
  } catch (error) {
    console.error('Failed to load metrics from localStorage:', error);
    return [];
  }
}

/**
 * Save metrics to localStorage (with size limit)
 */
function saveMetrics(metrics: FileMetric[]): void {
  try {
    // Keep only the most recent MAX_METRICS
    const trimmed = metrics.slice(-MAX_METRICS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save metrics to localStorage:', error);
  }
}

// ============================================================================
// API
// ============================================================================

/**
 * Start tracking a file processing operation
 *
 * @param fileName - Name of file being processed
 * @param mode - Processing mode ('fast' or 'quality')
 * @returns Metric ID for later completion
 *
 * @example
 * const metricId = startMetric('photo.jpg', 'fast');
 * // ... processing ...
 * endMetric(metricId, true);
 */
export function startMetric(fileName: string, mode: ProcessingMode): string {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const metric: FileMetric = {
    id,
    fileName,
    mode,
    startTime: Date.now(),
    success: false, // Default, updated on completion
    timestamp: new Date(),
  };

  activeMetrics.set(id, metric);

  return id;
}

/**
 * Complete tracking of a file processing operation
 *
 * @param metricId - ID returned from startMetric()
 * @param success - Whether processing succeeded
 * @param error - Optional error message if failed
 *
 * @example
 * try {
 *   await processor.process(file);
 *   endMetric(metricId, true);
 * } catch (err) {
 *   endMetric(metricId, false, err.message);
 * }
 */
export function endMetric(metricId: string, success: boolean, error?: string): void {
  const metric = activeMetrics.get(metricId);

  if (!metric) {
    console.warn(`Metric ${metricId} not found in active metrics`);
    return;
  }

  // Complete the metric
  metric.endTime = Date.now();
  metric.duration = metric.endTime - metric.startTime;
  metric.success = success;
  if (error) metric.error = error;

  // Move from active to persisted storage
  activeMetrics.delete(metricId);
  const allMetrics = loadMetrics();
  allMetrics.push(metric);
  saveMetrics(allMetrics);

  // Log for immediate visibility
  const status = success ? '✅' : '❌';
  console.log(`${status} [${metric.mode}] ${metric.fileName}: ${metric.duration}ms`);
}

/**
 * Get all file metrics from history
 *
 * @param mode - Optional filter by processing mode
 * @returns Array of file metrics (newest first)
 */
export function getMetricsHistory(mode?: ProcessingMode): FileMetric[] {
  const metrics = loadMetrics();

  const filtered = mode
    ? metrics.filter(m => m.mode === mode)
    : metrics;

  // Newest first
  return filtered.reverse();
}

/**
 * Compute batch statistics from file metrics
 *
 * @param mode - Optional filter by processing mode
 * @returns Aggregated statistics per mode
 */
export function getBatchSummary(mode?: ProcessingMode): BatchMetrics[] {
  const metrics = loadMetrics();

  // Group by mode
  const byMode = new Map<ProcessingMode, FileMetric[]>();

  for (const metric of metrics) {
    if (mode && metric.mode !== mode) continue;
    if (!metric.duration) continue; // Skip incomplete

    const existing = byMode.get(metric.mode) || [];
    existing.push(metric);
    byMode.set(metric.mode, existing);
  }

  // Compute statistics for each mode
  const summaries: BatchMetrics[] = [];

  for (const [processingMode, modeMetrics] of byMode.entries()) {
    const durations = modeMetrics
      .filter(m => m.duration !== undefined)
      .map(m => m.duration!);

    if (durations.length === 0) continue;

    const sorted = durations.sort((a, b) => a - b);
    const totalTime = durations.reduce((sum, d) => sum + d, 0);
    const successCount = modeMetrics.filter(m => m.success).length;

    summaries.push({
      mode: processingMode,
      fileCount: modeMetrics.length,
      totalTime,
      avgTimePerFile: totalTime / modeMetrics.length,
      medianTime: sorted[Math.floor(sorted.length / 2)],
      p95Time: sorted[Math.floor(sorted.length * 0.95)],
      successCount,
      errorCount: modeMetrics.length - successCount,
      timestamp: new Date(), // Summary computed now
    });
  }

  return summaries;
}

/**
 * Export metrics to JSON for external analysis
 *
 * @returns JSON string of all metrics
 */
export function exportMetrics(): string {
  const metrics = loadMetrics();
  const summary = getBatchSummary();

  return JSON.stringify({
    fileMetrics: metrics,
    batchSummaries: summary,
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

/**
 * Clear all metrics from storage
 *
 * WARNING: This is destructive and cannot be undone.
 */
export function clearMetrics(): void {
  activeMetrics.clear();
  localStorage.removeItem(STORAGE_KEY);
  console.log('✅ All metrics cleared');
}

/**
 * Print a formatted comparison table to console
 *
 * Useful for quick A/B testing analysis during development.
 */
export function logComparisonTable(): void {
  const summary = getBatchSummary();

  if (summary.length === 0) {
    console.log('📊 No metrics available yet');
    return;
  }

  console.log('\n📊 Processing Metrics Comparison\n');
  console.table(summary.map(s => ({
    'Mode': s.mode,
    'Files': s.fileCount,
    'Avg Time': `${s.avgTimePerFile.toFixed(0)}ms`,
    'Median': `${s.medianTime.toFixed(0)}ms`,
    'P95': `${s.p95Time.toFixed(0)}ms`,
    'Success Rate': `${((s.successCount / s.fileCount) * 100).toFixed(1)}%`,
  })));
}
