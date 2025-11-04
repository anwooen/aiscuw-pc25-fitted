import heic2any from 'heic2any';

export interface ImageFormatInfo {
  format: string;
  mimeType: string;
  needsConversion: boolean;
  isSupported: boolean;
}

export interface ConversionProgress {
  stage: 'detecting' | 'loading' | 'converting' | 'complete';
  progress: number; // 0-100
  message: string;
}

export type ProgressCallback = (progress: ConversionProgress) => void;

// Supported formats by OpenAI Vision API
const OPENAI_SUPPORTED_FORMATS = ['image/jpeg', 'image/png'];

// Formats that might work but should be converted for safety
const MAYBE_SUPPORTED_FORMATS = ['image/webp'];

/**
 * Detect image format from file
 */
export const detectImageFormat = (file: File): ImageFormatInfo => {
  const mimeType = file.type;
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  // Determine format based on MIME type and extension
  let format = mimeType.split('/')[1] || extension;

  // Special case: HEIC files might have different MIME types
  if (extension === 'heic' || extension === 'heif') {
    format = 'heic';
  }

  const isOpenAISupported = OPENAI_SUPPORTED_FORMATS.includes(mimeType);
  const isMaybeSupported = MAYBE_SUPPORTED_FORMATS.includes(mimeType);

  return {
    format,
    mimeType: mimeType || `image/${format}`,
    needsConversion: !isOpenAISupported,
    isSupported: isOpenAISupported || isMaybeSupported,
  };
};

/**
 * Convert HEIC image to JPEG using heic2any library
 */
const convertHEICToJPEG = async (
  file: File,
  onProgress?: ProgressCallback
): Promise<File> => {
  try {
    onProgress?.({
      stage: 'converting',
      progress: 25,
      message: 'Converting HEIC to JPEG...',
    });

    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });

    onProgress?.({
      stage: 'converting',
      progress: 75,
      message: 'Finalizing HEIC conversion...',
    });

    // heic2any can return Blob or Blob[], we want a single Blob
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

    // Create a new File from the Blob
    const fileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
    return new File([blob], fileName, { type: 'image/jpeg' });
  } catch (error) {
    console.error('HEIC conversion failed:', error);
    throw new Error('Failed to convert HEIC image. Please try a different format.');
  }
};

/**
 * Convert image to JPEG using Canvas API
 * Handles: WebP, BMP, GIF, PNG (with transparency), TIFF, etc.
 */
const convertToJPEGUsingCanvas = async (
  file: File,
  onProgress?: ProgressCallback
): Promise<File> => {
  return new Promise((resolve, reject) => {
    onProgress?.({
      stage: 'loading',
      progress: 25,
      message: 'Loading image...',
    });

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        try {
          onProgress?.({
            stage: 'converting',
            progress: 50,
            message: 'Converting to JPEG...',
          });

          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }

          // Fill with white background (for transparency)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw image
          ctx.drawImage(img, 0, 0);

          onProgress?.({
            stage: 'converting',
            progress: 75,
            message: 'Finalizing conversion...',
          });

          // Convert to JPEG blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to convert image to JPEG'));
                return;
              }

              // Create new File
              const fileName = file.name.replace(/\.[^.]+$/, '.jpg');
              const jpegFile = new File([blob], fileName, {
                type: 'image/jpeg',
              });

              resolve(jpegFile);
            },
            'image/jpeg',
            0.9 // Quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for conversion'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Main conversion function - automatically detects format and converts if needed
 */
export const convertImageIfNeeded = async (
  file: File,
  onProgress?: ProgressCallback
): Promise<File> => {
  // Detect format
  onProgress?.({
    stage: 'detecting',
    progress: 0,
    message: 'Detecting image format...',
  });

  const formatInfo = detectImageFormat(file);

  // If already supported, return as-is
  if (!formatInfo.needsConversion) {
    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Image format already supported',
    });
    return file;
  }

  // Convert based on format
  let convertedFile: File;

  if (formatInfo.format === 'heic' || formatInfo.format === 'heif') {
    // Special HEIC handling
    convertedFile = await convertHEICToJPEG(file, onProgress);
  } else {
    // All other formats use Canvas conversion
    convertedFile = await convertToJPEGUsingCanvas(file, onProgress);
  }

  onProgress?.({
    stage: 'complete',
    progress: 100,
    message: `Converted ${formatInfo.format.toUpperCase()} to JPEG`,
  });

  return convertedFile;
};

/**
 * Batch convert multiple images
 */
export const convertImagesIfNeeded = async (
  files: File[],
  onProgress?: (fileIndex: number, progress: ConversionProgress) => void
): Promise<File[]> => {
  const convertedFiles: File[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const converted = await convertImageIfNeeded(file, (progress) => {
      onProgress?.(i, progress);
    });

    convertedFiles.push(converted);
  }

  return convertedFiles;
};

/**
 * Check if a file needs conversion (without converting)
 */
export const needsConversion = (file: File): boolean => {
  return detectImageFormat(file).needsConversion;
};

/**
 * Get human-readable format name
 */
export const getFormatName = (file: File): string => {
  const info = detectImageFormat(file);
  return info.format.toUpperCase();
};
