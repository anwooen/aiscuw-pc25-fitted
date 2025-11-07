/* eslint-disable no-restricted-globals */
// Worker for smart cropping images off the main thread
// Receives: { type: 'process', fileBuffer: ArrayBuffer, fileType: string }
// Posts: { type: 'progress', progress: number, stage: string }
// Posts final: { type: 'result', buffer: ArrayBuffer, mimeType: string }

// When TypeScript can't find DedicatedWorkerGlobalScope in the DOM lib,
// fall back to typing `self` as any for the worker file.
const _self: any = self;

_self.addEventListener('message', async (ev: any) => {
  const data = ev.data;
  if (!data || data.type !== 'process') return;

  try {
    const { fileBuffer, fileType } = data as { fileBuffer: ArrayBuffer; fileType: string };
    const blob = new Blob([fileBuffer], { type: fileType || 'image/jpeg' });

    self.postMessage({ type: 'progress', progress: 5, stage: 'Loading image in worker...' });

    const bitmap = await createImageBitmap(blob);
    const width = bitmap.width;
    const height = bitmap.height;

    const off = new OffscreenCanvas(width, height);
    const ctx = off.getContext('2d');
    if (!ctx) throw new Error('Failed to get OffscreenCanvas context');
    ctx.drawImage(bitmap, 0, 0);

    const step = 4;
    const totalRows = Math.ceil(height / step);
    const CHUNK_ROWS = Math.max(4, Math.floor(totalRows / 60));

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    const topLeft = pixels[0] + pixels[1] + pixels[2];

    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;

    let rowIndex = 0;

    while (rowIndex < totalRows) {
      const end = Math.min(totalRows, rowIndex + CHUNK_ROWS);

      for (let r = rowIndex; r < end; r++) {
        const y = r * step;
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4;
          const rC = pixels[idx];
          const gC = pixels[idx + 1];
          const bC = pixels[idx + 2];
          const current = rC + gC + bC;
          if (Math.abs(current - topLeft) > 30 * 3) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      rowIndex = end;
      const detectProgress = 10 + Math.round((rowIndex / totalRows) * 40);
      self.postMessage({ type: 'progress', progress: Math.min(50, detectProgress), stage: 'Detecting clothing boundaries...' });
      // Yield implicitly in worker loop
    }

    self.postMessage({ type: 'progress', progress: 60, stage: 'Analyzing image content...' });

    const padding = 0.1;
    const widthFound = Math.max(1, maxX - minX);
    const heightFound = Math.max(1, maxY - minY);

    minX = Math.max(0, minX - widthFound * padding);
    minY = Math.max(0, minY - heightFound * padding);
    maxX = Math.min(width, maxX + widthFound * padding);
    maxY = Math.min(height, maxY + heightFound * padding);

    const croppedWidth = Math.max(1, Math.round(maxX - minX));
    const croppedHeight = Math.max(1, Math.round(maxY - minY));

    const cropped = new OffscreenCanvas(croppedWidth, croppedHeight);
    const croppedCtx = cropped.getContext('2d');
    if (!croppedCtx) throw new Error('Failed to get cropped OffscreenCanvas context');
    croppedCtx.drawImage(off, minX, minY, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight);

    self.postMessage({ type: 'progress', progress: 90, stage: 'Finalizing crop...' });

    const outBlob = await cropped.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
    const outBuffer = await outBlob.arrayBuffer();

    self.postMessage({ type: 'progress', progress: 100, stage: 'Cropping complete!' });
    // postMessage with transfer: browsers expect transfer list as second arg
    // but TypeScript worker typings may be absent here; use (self as any).postMessage
    (_self as any).postMessage({ type: 'result', buffer: outBuffer, mimeType: outBlob.type }, [outBuffer]);
  } catch (err: any) {
    (_self as any).postMessage({ type: 'error', message: err?.message ?? String(err) });
  }
});

export {};
