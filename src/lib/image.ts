// Resizes a user-picked image file down to a small square data URI.
// Logos are stored in the OS keyring split across multiple chunked secrets
// (see storage.ts) — no single-value size ceiling anymore — so the budget
// here just needs to keep the total reasonable, not squeeze under one
// secret's ~1280-char limit. PNG is tried first to preserve transparency
// (logos are usually flat-color icons, which PNG compresses well); only when
// that's too big do we fall back to JPEG flattened onto a white background —
// JPEG has no alpha channel.
const SIZES = [128, 96, 72, 56];
const JPEG_QUALITIES = [0.85, 0.7, 0.55, 0.4];

export function readImageAsDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = dataUri;
  });
}

function drawToCanvas(img: HTMLImageElement, size: number, background: string | null): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size, size);
  }
  // Contain-fit: scale to fit entirely within the square (letterboxed, not
  // cropped) — logos/icons often aren't square, and cropping cuts them off.
  const scale = Math.min(size / img.width, size / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return canvas;
}

/** Reads a picked file and returns a small data URI, or null if it's still too large to store. */
export async function prepareLogoUpload(file: File, maxChars = 12000): Promise<string | null> {
  const original = await readImageAsDataUri(file);
  const img = await loadImage(original);

  for (const size of SIZES) {
    const pngUri = drawToCanvas(img, size, null).toDataURL("image/png");
    if (pngUri.length <= maxChars) return pngUri;
  }

  for (const size of SIZES) {
    const canvas = drawToCanvas(img, size, "#ffffff");
    for (const quality of JPEG_QUALITIES) {
      const jpegUri = canvas.toDataURL("image/jpeg", quality);
      if (jpegUri.length <= maxChars) return jpegUri;
    }
  }

  return null;
}
