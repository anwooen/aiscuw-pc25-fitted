import type { ImageProcessor, ProgressCallback } from './ImageProcessor.interface';
// Vite worker import - bundles worker code and returns constructor
import MLRemovalWorker from '../workers/mlRemoval.worker.ts?worker';

/**
 * MLRemovalProcessor - AI-powered background removal
 *
 * Strategy Pattern implementation using Web Worker for off-thread processing.
 * Uses @imgly/background-removal library for ML-powered transparent backgrounds.
 *
 * Performance: ~2-5s per image, no UI freeze
 */
export class MLRemovalProcessor implements ImageProcessor {
  public readonly name = 'ML Background Removal';
  public readonly description = 'AI-powered background removal (slower, higher quality)';
  public readonly avgTimePerImage = '2-5s';

  private worker: Worker | null = null;

  /**
   * Initialize worker (lazy initialization)
   * Worker is created on first use to avoid unnecessary resource allocation
   */
  private initWorker(): Worker {
    if (!this.worker) {
      this.worker = new MLRemovalWorker();
    }
    return this.worker;
  }

  /**
   * Process image using ML background removal worker
   *
   * @param file - Image file to process
   * @param onProgress - Optional progress callback
   * @returns Processed image blob with transparent background
   * @throws Error if processing fails
   */
  async process(file: File, onProgress?: ProgressCallback): Promise<Blob> {
    const worker = this.initWorker();

    return new Promise<Blob>((resolve, reject) => {
      // Set up message handler for this processing task
      const handleMessage = (event: MessageEvent) => {
        const { type, progress, stage, buffer, mimeType, message } = event.data;

        switch (type) {
          case 'progress':
            onProgress?.(progress, stage);
            break;

          case 'result':
            // Success - convert ArrayBuffer back to Blob
            worker.removeEventListener('message', handleMessage);
            const blob = new Blob([buffer], { type: mimeType || 'image/png' });
            resolve(blob);
            break;

          case 'error':
            // Error occurred in worker
            worker.removeEventListener('message', handleMessage);
            reject(new Error(`Worker error: ${message}`));
            break;

          default:
            console.warn(`Unknown message type from worker: ${type}`);
        }
      };

      // Attach message listener
      worker.addEventListener('message', handleMessage);

      // Convert File to ArrayBuffer and send to worker
      file.arrayBuffer()
        .then((buffer) => {
          worker.postMessage({
            type: 'process',
            fileBuffer: buffer,
            fileType: file.type,
          });
        })
        .catch((err) => {
          worker.removeEventListener('message', handleMessage);
          reject(new Error(`Failed to read file: ${err.message}`));
        });
    });
  }

  /**
   * Cleanup - terminate worker and free resources
   * MUST be called when processor is no longer needed
   */
  dispose(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
