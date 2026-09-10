/**
 * Converts any image source (including SVG data URIs) into a clean, raster PNG Base64 Data URL.
 * This guarantees compatibility with the Gemini Vision API which expects raster image bytes (PNG/JPEG/WebP).
 */
export async function rasterizeToPngDataUrl(dataUrl: string): Promise<string> {
  if (typeof window === 'undefined') return dataUrl;

  // If it's already a standard raster base64, return it directly
  if (
    dataUrl.startsWith('data:image/png;base64,') ||
    dataUrl.startsWith('data:image/jpeg;base64,') ||
    dataUrl.startsWith('data:image/webp;base64,')
  ) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    // Allow cross-origin if needed
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = img.naturalWidth || 800;
        const height = img.naturalHeight || 600;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const pngDataUrl = canvas.toDataURL('image/png');
          resolve(pngDataUrl);
          return;
        }
      } catch (err) {
        console.warn('Canvas rasterization error:', err);
      }
      resolve(dataUrl);
    };

    img.onerror = (err) => {
      console.warn('Image load error during rasterization:', err);
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}
