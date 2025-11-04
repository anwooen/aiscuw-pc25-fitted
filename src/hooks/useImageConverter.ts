import { useState, useCallback } from 'react';
import {
  convertImageIfNeeded,
  convertImagesIfNeeded,
  detectImageFormat,
  needsConversion,
  getFormatName,
  type ConversionProgress,
} from '../utils/imageFormatConverter';

interface UseImageConverterState {
  isConverting: boolean;
  progress: ConversionProgress | null;
  error: string | null;
}

interface UseImageConverterReturn {
  convertImage: (file: File) => Promise<File | null>;
  convertImages: (files: File[]) => Promise<File[]>;
  isConverting: boolean;
  progress: ConversionProgress | null;
  error: string | null;
  checkIfNeedsConversion: (file: File) => boolean;
  getFormat: (file: File) => string;
}

/**
 * React hook for image format conversion
 *
 * Usage:
 * ```tsx
 * const { convertImage, isConverting, progress, error } = useImageConverter();
 *
 * const handleFileSelect = async (file: File) => {
 *   const converted = await convertImage(file);
 *   if (converted) {
 *     // Use converted file
 *   }
 * };
 * ```
 */
export const useImageConverter = (): UseImageConverterReturn => {
  const [state, setState] = useState<UseImageConverterState>({
    isConverting: false,
    progress: null,
    error: null,
  });

  /**
   * Convert a single image file
   */
  const convertImage = useCallback(async (file: File): Promise<File | null> => {
    setState({
      isConverting: true,
      progress: null,
      error: null,
    });

    try {
      const converted = await convertImageIfNeeded(file, (progress) => {
        setState((prev) => ({
          ...prev,
          progress,
        }));
      });

      setState({
        isConverting: false,
        progress: {
          stage: 'complete',
          progress: 100,
          message: 'Conversion complete',
        },
        error: null,
      });

      return converted;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to convert image format';

      setState({
        isConverting: false,
        progress: null,
        error: errorMessage,
      });

      return null;
    }
  }, []);

  /**
   * Convert multiple image files
   */
  const convertImages = useCallback(async (files: File[]): Promise<File[]> => {
    setState({
      isConverting: true,
      progress: null,
      error: null,
    });

    try {
      const converted = await convertImagesIfNeeded(
        files,
        (fileIndex, progress) => {
          setState((prev) => ({
            ...prev,
            progress: {
              ...progress,
              message: `[${fileIndex + 1}/${files.length}] ${progress.message}`,
            },
          }));
        }
      );

      setState({
        isConverting: false,
        progress: {
          stage: 'complete',
          progress: 100,
          message: 'All images converted',
        },
        error: null,
      });

      return converted;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to convert images';

      setState({
        isConverting: false,
        progress: null,
        error: errorMessage,
      });

      return [];
    }
  }, []);

  /**
   * Check if a file needs conversion (without converting)
   */
  const checkIfNeedsConversion = useCallback((file: File): boolean => {
    return needsConversion(file);
  }, []);

  /**
   * Get format name for a file
   */
  const getFormat = useCallback((file: File): string => {
    return getFormatName(file);
  }, []);

  return {
    convertImage,
    convertImages,
    isConverting: state.isConverting,
    progress: state.progress,
    error: state.error,
    checkIfNeedsConversion,
    getFormat,
  };
};

/**
 * Simple utility hook that just checks format info
 */
export const useImageFormatInfo = (file: File | null) => {
  if (!file) {
    return null;
  }

  return detectImageFormat(file);
};
