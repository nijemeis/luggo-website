import { promises as fs } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

/**
 * File storage abstraction.
 *  - "media"   → public product images, served via /media/<key>
 *  - "private" → customer STL uploads, only reachable through the admin
 * Local disk by default (./storage). Set S3_BUCKET (+ credentials/endpoint)
 * to use S3 or Cloudflare R2 instead.
 */

export type Bucket = "media" | "private";

const useS3 = !!process.env.S3_BUCKET;
const storageDir = path.resolve(process.env.STORAGE_DIR || "./storage");

function localPath(bucket: Bucket, key: string) {
  const safe = key.replace(/\.\.+/g, "").replace(/^\/+/, "");
  return path.join(storageDir, bucket, safe);
}

async function s3() {
  const { S3Client } = await import("@aws-sdk/client-s3");
  return new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: !!process.env.S3_ENDPOINT,
    credentials: process.env.S3_ACCESS_KEY_ID
      ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "" }
      : undefined,
  });
}

/** In production a bucket is mandatory: App Platform disks are ephemeral and per-instance. */
export function storageConfigured(): boolean {
  return useS3 || process.env.NODE_ENV !== "production" || process.env.ALLOW_LOCAL_STORAGE === "true";
}

export async function putObject(bucket: Bucket, key: string, body: Buffer, contentType: string): Promise<void> {
  if (!storageConfigured()) throw new Error("File storage is not configured: set S3_BUCKET, S3_ENDPOINT, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY (DigitalOcean Spaces).");
  if (useS3) {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await s3();
    await client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: `${bucket}/${key}`, Body: body, ContentType: contentType }));
    return;
  }
  const p = localPath(bucket, key);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, body);
}

export async function getObject(bucket: Bucket, key: string): Promise<{ body: Buffer; contentType: string } | null> {
  if (useS3) {
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await s3();
    try {
      const res = await client.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: `${bucket}/${key}` }));
      const bytes = await res.Body!.transformToByteArray();
      return { body: Buffer.from(bytes), contentType: res.ContentType || "application/octet-stream" };
    } catch {
      return null;
    }
  }
  try {
    const body = await fs.readFile(localPath(bucket, key));
    return { body, contentType: guessType(key) };
  } catch {
    return null;
  }
}

export async function deleteObject(bucket: Bucket, key: string): Promise<void> {
  if (useS3) {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await s3();
    await client.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: `${bucket}/${key}` })).catch(() => {});
    return;
  }
  await fs.rm(localPath(bucket, key), { force: true });
}

export function guessType(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "webp": return "image/webp";
    case "png": return "image/png";
    case "jpg": case "jpeg": return "image/jpeg";
    case "gif": return "image/gif";
    case "svg": return "image/svg+xml";
    case "stl": return "model/stl";
    case "3mf": return "model/3mf";
    case "obj": return "model/obj";
    case "step": case "stp": return "model/step";
    default: return "application/octet-stream";
  }
}

export function toWebStream(buf: Buffer): ReadableStream {
  return Readable.toWeb(Readable.from(buf)) as ReadableStream;
}
