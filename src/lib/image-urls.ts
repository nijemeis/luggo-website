/**
 * Pure helpers for product image URLs — safe to import from client components.
 * Renditions live at <key>-400.webp · <key>-900.webp · <key>-1600.webp.
 */
export const IMAGE_SIZES = [400, 900, 1600] as const;
export type ImageSize = (typeof IMAGE_SIZES)[number];

/** Public base for media. Set NEXT_PUBLIC_MEDIA_URL when images are served straight from S3/R2. */
export function mediaUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_MEDIA_URL;
  if (base) return `${base.replace(/\/$/, "")}/${key}`;
  return `/media/${key}`;
}

export function imgSrc(key: string, size: ImageSize = 900): string {
  if (!key) return "";
  return mediaUrl(`${key}-${size}.webp`);
}

export function imgSrcSet(key: string): string {
  if (!key) return "";
  return IMAGE_SIZES.map((s) => `${imgSrc(key, s)} ${s}w`).join(", ");
}
