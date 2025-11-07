import { openDB, DBSchema, IDBPDatabase } from 'idb';

// IndexedDB schema for storing images
interface FittedDB extends DBSchema {
  images: {
    key: string;
    value: {
      id: string;
      blob: Blob;
      createdAt: Date;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<FittedDB>> | null = null;

// Initialize IndexedDB
export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<FittedDB>('fitted-images', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

// Save image to IndexedDB
export const saveImage = async (id: string, blob: Blob): Promise<void> => {
  const db = await initDB();
  await db.put('images', {
    id,
    blob,
    createdAt: new Date(),
  });
};

// Get image from IndexedDB
export const getImage = async (id: string): Promise<Blob | undefined> => {
  const db = await initDB();
  const record = await db.get('images', id);
  return record?.blob;
};

// Delete image from IndexedDB
export const deleteImage = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete('images', id);
};

// URL cache to prevent creating duplicate object URLs
const urlCache = new Map<string, string>();

// Get image as object URL
export const getImageURL = async (id: string): Promise<string | null> => {
  // Check cache first
  if (urlCache.has(id)) {
    return urlCache.get(id) || null;
  }

  const blob = await getImage(id);
  if (!blob) return null;

  const url = URL.createObjectURL(blob);
  urlCache.set(id, url);
  return url;
};

// Clean up cached URLs
export const cleanupImageURL = (id: string) => {
  const url = urlCache.get(id);
  if (url) {
    URL.revokeObjectURL(url);
    urlCache.delete(id);
  }
};

// Convert File to Blob and compress if needed
export const compressImage = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate compression ratio
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          0.85
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};
