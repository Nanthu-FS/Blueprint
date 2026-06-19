'use client';

// Client-side image downscale -> base64. Smaller images encode faster in the
// vision model, which is the single biggest snappiness win on the input side.

export interface PreparedImage {
  dataUrl: string; // full data: URL, for thumbnails/preview
  base64: string; // payload sent to the API (no data: prefix)
}

const MAX_DIM = 1200; // longest edge; plenty for a sketch, fast to encode

export async function prepareImage(file: File, maxDim = MAX_DIM): Promise<PreparedImage> {
  const bitmap = await fileToBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(bitmap, 0, 0, w, h);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
  const base64 = dataUrl.split(',')[1] ?? '';
  return { dataUrl, base64 };
}

async function fileToBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall through to <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Could not load image'));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Turn a captured canvas/dataURL into a PreparedImage (used by the camera). */
export function fromDataUrl(dataUrl: string): PreparedImage {
  return { dataUrl, base64: dataUrl.split(',')[1] ?? '' };
}
