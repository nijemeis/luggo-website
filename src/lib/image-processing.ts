import sharp from "sharp";
import { putObject, deleteObject } from "./storage";
import { IMAGE_SIZES } from "./image-urls";

/** Resize an upload into the three WebP renditions and store them. */
export async function processAndStoreImage(input: Buffer, keyBase: string): Promise<{ key: string; width: number; height: number }> {
  const meta = await sharp(input).rotate().metadata();
  for (const size of IMAGE_SIZES) {
    const out = await sharp(input)
      .rotate()
      .resize({ width: size, withoutEnlargement: true })
      .webp({ quality: size >= 1600 ? 82 : 80 })
      .toBuffer();
    await putObject("media", `${keyBase}-${size}.webp`, out, "image/webp");
  }
  return { key: keyBase, width: meta.width ?? 0, height: meta.height ?? 0 };
}

export async function deleteImageRenditions(keyBase: string): Promise<void> {
  await Promise.all(IMAGE_SIZES.map((s) => deleteObject("media", `${keyBase}-${s}.webp`)));
}

export function newImageKey(): string {
  return `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
