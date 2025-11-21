/**
 * Progress callback for image processing operations
 * @param progress - Percentage complete (0-100)
 * @param stage - Human-readable description of current stage
 */
export type ProgressCallback = (progress: number, stage: string) => void;

/**
 * Processing mode selection
 * - 'fast': Fast crop without background removal (~200-500ms/image)
 * - 'quality': ML-powered background removal (~2-5s/image)
 */
export type ProcessingMode = 'fast' | 'quality';

/**
 * ImageProcessor abstraction
 *
 * Strategy Pattern implementation for swappable image processing algorithms.
 * All processors MUST run in Web Workers to prevent UI freezing.
 *
 * Usage:
 * ```typescript
 * const processor = getProcessor('fast');
 * const result = await processor.process(file, (progress, stage) => {
 *   console.log(`${stage}: ${progress}%`);
 * });
 * processor.dispose(); // Cleanup when done
 * ```
 */
export interface ImageProcessor {
  /**
   * Human-readable processor name
   * @example "Fast Crop" or "ML Background Removal"
   */
  name: string;

  /**
   * Brief description of what this processor does
   * @example "Smart cropping without background removal"
   */
  description: string;

  /**
   * Average time per image for performance comparison
   * @example "200-500ms" or "2-5s"
   */
  avgTimePerImage: string;

  /**
   * Process an image file
   * MUST run in Web Worker to avoid blocking main thread
   *
   * @param file - Image file to process
   * @param onProgress - Optional progress callback
   * @returns Processed image as Blob
   * @throws Error if processing fails
   */
  process(file: File, onProgress?: ProgressCallback): Promise<Blob>;

  /**
   * Cleanup resources (terminate workers, free memory)
   * MUST be called when processor is no longer needed
   */
  dispose(): void;
}
