import { removeBackground as mlRemoveBackground } from '@imgly/background-removal';

/**
 * Progress callback for background removal operations
 */
export type ProgressCallback = (progress: number, stage: string) => void;

/**
 * Remove background from image using ML model
 * Primary method - runs in browser using WASM
 * @returns Blob with transparent background, or null if failed
 */
export async function removeBackground(
  imageFile: File,
  onProgress?: ProgressCallback
): Promise<Blob | null> {
  try {
    onProgress?.(0, 'Loading ML model...');

    // Configure background removal
    const blob = await mlRemoveBackground(imageFile, {
      progress: (_key, current, total) => {
        const percentage = Math.round((current / total) * 100);
        onProgress?.(percentage, 'Removing background...');
      },
    });

    onProgress?.(100, 'Background removed!');
    return blob;
  } catch (error) {
    console.error('ML background removal failed:', error);
    return null;
  }
}

/**
 * Smart crop to focus on main subject
 * Fallback method when ML removal fails
 * Uses edge detection to find clothing boundaries
 */
export async function smartCropClothing(
  imageFile: File,
  onProgress?: ProgressCallback
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    onProgress?.(0, 'Loading image...');

    const reader = new FileReader();
    reader.readAsDataURL(imageFile);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        onProgress?.(30, 'Detecting clothing boundaries...');

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw full image first
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        onProgress?.(60, 'Analyzing image content...');

        // Get image data for edge detection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Find bounding box of non-background content
        // Simple edge detection: find where pixel intensity changes significantly
        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = 0;
        let maxY = 0;

        const threshold = 30; // Color difference threshold

        // Sample every 4th pixel for performance
        for (let y = 0; y < canvas.height; y += 4) {
          for (let x = 0; x < canvas.width; x += 4) {
            const idx = (y * canvas.width + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];

            // Check if this pixel differs from corners (likely background)
            const topLeft = pixels[0] + pixels[1] + pixels[2];
            const current = r + g + b;

            if (Math.abs(current - topLeft) > threshold * 3) {
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        }

        onProgress?.(80, 'Cropping to subject...');

        // Add 10% padding around detected bounds
        const padding = 0.1;
        const width = maxX - minX;
        const height = maxY - minY;

        minX = Math.max(0, minX - width * padding);
        minY = Math.max(0, minY - height * padding);
        maxX = Math.min(canvas.width, maxX + width * padding);
        maxY = Math.min(canvas.height, maxY + height * padding);

        const croppedWidth = maxX - minX;
        const croppedHeight = maxY - minY;

        // Create cropped canvas
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = croppedWidth;
        croppedCanvas.height = croppedHeight;
        const croppedCtx = croppedCanvas.getContext('2d');

        if (!croppedCtx) {
          reject(new Error('Failed to get cropped canvas context'));
          return;
        }

        // Draw cropped region
        croppedCtx.drawImage(
          canvas,
          minX, minY, croppedWidth, croppedHeight,
          0, 0, croppedWidth, croppedHeight
        );

        onProgress?.(100, 'Cropping complete!');

        // Convert to blob
        croppedCanvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create cropped blob'));
            }
          },
          'image/jpeg',
          0.9
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

/**
 * Process image for AI analysis with automatic background removal
 * Main entry point - ALWAYS runs background removal
 *
 * Pipeline:
 * 1. Try ML background removal (preferred)
 * 2. If ML fails, fall back to smart cropping
 * 3. Return processed image
 */
export async function processImageForAI(
  imageFile: File,
  onProgress?: ProgressCallback
): Promise<Blob> {
  try {
    // Stage 1: Try ML background removal
    onProgress?.(0, 'Starting background removal...');
    const mlResult = await removeBackground(imageFile, onProgress);

    if (mlResult) {
      onProgress?.(100, 'Background removed successfully!');
      return mlResult;
    }

    // Stage 2: Fallback to smart cropping
    console.warn('ML background removal failed, falling back to smart crop');
    onProgress?.(0, 'Using fallback method...');
    const cropResult = await smartCropClothing(imageFile, onProgress);

    return cropResult;
  } catch (error) {
    // Ultimate fallback: return original file
    console.error('All background removal methods failed:', error);
    onProgress?.(100, 'Using original image');
    return imageFile;
  }
}

/**
 * Convert Blob to File
 * Useful for maintaining File interface after processing
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, {
    type: blob.type || 'image/jpeg',
    lastModified: Date.now(),
  });
}

/**
 * Check if image has transparent background
 * Useful for determining if background removal was successful
 */
export async function hasTransparentBackground(blob: Blob): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(false);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Check alpha channel - if any pixel has alpha < 255, it's transparent
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] < 255) {
          URL.revokeObjectURL(url);
          resolve(true);
          return;
        }
      }

      URL.revokeObjectURL(url);
      resolve(false);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
  });
}
