/**
 * Image Processor Registry and Factory
 *
 * Factory Pattern implementation for creating and managing image processors.
 * Uses singleton pattern to maintain one instance per processor type.
 *
 * Usage:
 * ```typescript
 * const processor = getProcessor('fast');
 * const result = await processor.process(file);
 * // When done with all processors:
 * disposeAllProcessors();
 * ```
 */

import type { ImageProcessor, ProcessingMode } from './ImageProcessor.interface';
import { FastCropProcessor } from './FastCropProcessor';
import { MLRemovalProcessor } from './MLRemovalProcessor';

// Re-export types for convenience
export type { ImageProcessor, ProcessingMode, ProgressCallback } from './ImageProcessor.interface';

/**
 * Singleton instances
 * Maintains one instance per processor type to avoid creating multiple workers
 */
let fastCropInstance: FastCropProcessor | null = null;
let mlRemovalInstance: MLRemovalProcessor | null = null;

/**
 * Get processor for specified mode
 *
 * Returns singleton instance - creates on first call, reuses on subsequent calls.
 * This ensures we don't create multiple workers for the same processor type.
 *
 * @param mode - Processing mode ('fast' or 'quality')
 * @returns ImageProcessor instance
 *
 * @example
 * ```typescript
 * const processor = getProcessor('fast');
 * const blob = await processor.process(file);
 * ```
 */
export function getProcessor(mode: ProcessingMode): ImageProcessor {
  switch (mode) {
    case 'fast':
      if (!fastCropInstance) {
        fastCropInstance = new FastCropProcessor();
      }
      return fastCropInstance;

    case 'quality':
      if (!mlRemovalInstance) {
        mlRemovalInstance = new MLRemovalProcessor();
      }
      return mlRemovalInstance;

    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = mode;
      throw new Error(`Unknown processing mode: ${_exhaustive}`);
  }
}

/**
 * Dispose all processor instances
 *
 * Terminates all workers and frees resources.
 * MUST be called when processors are no longer needed (e.g., component unmount).
 *
 * After calling this, getProcessor() will create fresh instances.
 *
 * @example
 * ```typescript
 * useEffect(() => {
 *   return () => disposeAllProcessors(); // Cleanup on unmount
 * }, []);
 * ```
 */
export function disposeAllProcessors(): void {
  if (fastCropInstance) {
    fastCropInstance.dispose();
    fastCropInstance = null;
  }

  if (mlRemovalInstance) {
    mlRemovalInstance.dispose();
    mlRemovalInstance = null;
  }
}

/**
 * Get processor metadata without creating instance
 *
 * Useful for UI display (showing mode options) without instantiating workers.
 *
 * @param mode - Processing mode
 * @returns Metadata object with name, description, avgTimePerImage
 */
export function getProcessorMetadata(mode: ProcessingMode): {
  name: string;
  description: string;
  avgTimePerImage: string;
} {
  switch (mode) {
    case 'fast':
      return {
        name: 'Fast Crop',
        description: 'Smart cropping without background removal',
        avgTimePerImage: '200-500ms',
      };

    case 'quality':
      return {
        name: 'ML Background Removal',
        description: 'AI-powered background removal (slower, higher quality)',
        avgTimePerImage: '2-5s',
      };

    default:
      const _exhaustive: never = mode;
      throw new Error(`Unknown processing mode: ${_exhaustive}`);
  }
}
