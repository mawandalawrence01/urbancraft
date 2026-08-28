import "server-only";
import { put, del } from "@vercel/blob";
import sharp from "sharp";

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export type UploadedImage = {
  url: string;
  width: number;
  height: number;
  blurDataUrl: string;
};

/**
 * Normalises an uploaded photo the same way the seed pipeline does — resized,
 * re-encoded to WebP, with an inline blur placeholder — so admin uploads look
 * and load exactly like the imported catalogue.
 */
export async function processAndUpload(
  file: File,
  prefix: string,
): Promise<UploadedImage> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Upload a JPEG, PNG, WebP or AVIF image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("That image is larger than 12MB. Please use a smaller file.");
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Image storage is not configured. Set BLOB_READ_WRITE_TOKEN to enable uploads.",
    );
  }

  const input = Buffer.from(await file.arrayBuffer());

  const webp = await sharp(input, { failOn: "none" })
    .rotate() // honour EXIF orientation from phone cameras
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();

  const meta = await sharp(webp).metadata();
  const blur = await sharp(webp)
    .resize(16, 16, { fit: "inside" })
    .webp({ quality: 45 })
    .toBuffer();

  const blob = await put(`${prefix}/${crypto.randomUUID()}.webp`, webp, {
    access: "public",
    contentType: "image/webp",
    addRandomSuffix: false,
  });

  return {
    url: blob.url,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}

/** Only blob-hosted files can be deleted; seeded files live in /public. */
export async function deleteUpload(url: string) {
  if (!url.startsWith("https://") || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await del(url);
  } catch {
    // Already gone, or never ours — the database row is what matters.
  }
}

export const uploadsConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
