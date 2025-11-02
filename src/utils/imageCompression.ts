import imageCompression from 'browser-image-compression';

/**
 * Compress an image file using browser-image-compression
 * @param file - The image file to compress
 * @param maxSizeMB - Maximum file size in MB (default: 1)
 * @param maxWidthOrHeight - Maximum width or height in pixels (default: 800)
 * @returns Compressed image as a Blob
 */
export const compressImage = async (
  file: File,
  maxSizeMB = 1,
  maxWidthOrHeight = 800
): Promise<Blob> => {
  const options = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: 'image/jpeg' as const,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
};

/**
 * Extract dominant colors from an image
 * @param file - The image file to analyze
 * @returns Array of hex color codes
 */
export const extractColors = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Use smaller canvas for color sampling
        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);

        const imageData = ctx.getImageData(0, 0, 100, 100);
        const colorMap = new Map<string, number>();

        // Sample every 5th pixel to improve performance
        for (let i = 0; i < imageData.data.length; i += 20) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];

          // Skip near-white and near-black pixels
          if ((r > 230 && g > 230 && b > 230) || (r < 25 && g < 25 && b < 25)) {
            continue;
          }

          // Quantize colors to reduce variation
          const qR = Math.round(r / 30) * 30;
          const qG = Math.round(g / 30) * 30;
          const qB = Math.round(b / 30) * 30;

          const hex = rgbToHex(qR, qG, qB);
          colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
        }

        // Get top 3 most common colors
        const sortedColors = Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([hex]) => hex);

        resolve(sortedColors.length > 0 ? sortedColors : ['#000000']);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

/**
 * Convert RGB values to hex color code
 */
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Validate if file is an image
 */
export const isValidImage = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Get file size in MB
 */
export const getFileSizeMB = (file: File): number => {
  return file.size / (1024 * 1024);
};
