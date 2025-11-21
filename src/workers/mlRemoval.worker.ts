/* eslint-disable no-restricted-globals */
// Worker for ML-powered background removal off the main thread
// Receives: { type: 'process', fileBuffer: ArrayBuffer, fileType: string }
// Posts: { type: 'progress', progress: number, stage: string }
// Posts final: { type: 'result', buffer: ArrayBuffer, mimeType: string }
// Posts error: { type: 'error', message: string }

import { removeBackground } from '@imgly/background-removal';

// When TypeScript can't find DedicatedWorkerGlobalScope in the DOM lib,
// fall back to typing `self` as any for the worker file.
const _self: any = self;

_self.addEventListener('message', async (ev: any) => {
  const data = ev.data;
  if (!data || data.type !== 'process') return;

  try {
    const { fileBuffer, fileType } = data as { fileBuffer: ArrayBuffer; fileType: string };

    // Convert ArrayBuffer back to Blob for ML library
    const blob = new Blob([fileBuffer], { type: fileType || 'image/jpeg' });

    self.postMessage({ type: 'progress', progress: 0, stage: 'Initializing ML model...' });

    // Run background removal with progress tracking
    // The library's progress callback receives (key, current, total)
    const resultBlob = await removeBackground(blob, {
      progress: (_key: string, current: number, total: number) => {
        const percentage = Math.round((current / total) * 100);
        self.postMessage({
          type: 'progress',
          progress: Math.min(99, percentage),
          stage: 'Removing background...'
        });
      },
    });

    self.postMessage({ type: 'progress', progress: 100, stage: 'Background removal complete!' });

    // Convert result Blob to ArrayBuffer for transfer
    const outBuffer = await resultBlob.arrayBuffer();
    const mimeType = resultBlob.type || 'image/png'; // ML removal typically outputs PNG

    // Transfer ArrayBuffer (avoids copying large image data)
    (_self as any).postMessage(
      { type: 'result', buffer: outBuffer, mimeType },
      [outBuffer]
    );
  } catch (err: any) {
    (_self as any).postMessage({
      type: 'error',
      message: err?.message ?? String(err)
    });
  }
});

export {};
