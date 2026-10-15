import "server-only";
import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";

/**
 * Photo storage, on Cloudinary.
 *
 * The workshop owns the Cloudinary account, so every photo the admin uploads is
 * also visible, searchable and replaceable in the Cloudinary media library —
 * which is the point: the people running the site can manage their own pictures
 * without a deploy.
 *
 * This talks to the REST API directly rather than through the `cloudinary` SDK.
 * Two signed calls is the whole surface area, and the SDK brings a large
 * dependency and a global-configuration singleton for no gain here.
 *
 * The account is in *dynamic folders* mode, so `asset_folder` (where it appears
 * in the library) and `public_id` (what the delivery URL contains) are set
 * separately. The public_id carries the folder path anyway so that a stored URL
 * is enough to find the asset again when it has to be deleted.
 */

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Everything the workshop uploads lives under one root in the library. */
const ROOT = "urbancraft";

export type UploadedImage = {
  url: string;
  width: number;
  height: number;
  blurDataUrl: string;
};

type Credentials = { cloudName: string; apiKey: string; apiSecret: string };

function credentials(): Credentials | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

export const uploadsConfigured = () => credentials() !== null;

/**
 * Cloudinary's signature: the signed parameters sorted by name, joined as a
 * query string, with the API secret appended, hashed with SHA-1. `file`,
 * `api_key` and `resource_type` are never part of it.
 */
function sign(params: Record<string, string>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(payload + apiSecret).digest("hex");
}

async function callCloudinary(
  endpoint: "upload" | "destroy",
  creds: Credentials,
  params: Record<string, string>,
  file?: Blob,
) {
  const signed = { ...params, timestamp: String(Math.floor(Date.now() / 1000)) };

  const body = new FormData();
  for (const [key, value] of Object.entries(signed)) body.append(key, value);
  body.append("api_key", creds.apiKey);
  body.append("signature", sign(signed, creds.apiSecret));
  if (file) body.append("file", file);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${creds.cloudName}/image/${endpoint}`,
    { method: "POST", body },
  );

  const json = (await res.json()) as { error?: { message?: string } } & Record<string, unknown>;
  if (!res.ok) {
    throw new Error(json.error?.message ?? `Cloudinary rejected the ${endpoint} (${res.status}).`);
  }
  return json;
}

/**
 * Normalises an uploaded photo the same way the seed pipeline does — EXIF
 * rotation honoured, resized, re-encoded to WebP, with an inline blur
 * placeholder — so an admin upload looks and loads exactly like the imported
 * catalogue. Cloudinary could transform on the fly, but then the stored asset
 * would be a 9MB phone original and every size would cost a transformation.
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

  const creds = credentials();
  if (!creds) {
    throw new Error(
      "Photo storage is not connected. Set the CLOUDINARY_* keys to enable uploads.",
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

  const folder = `${ROOT}/${prefix}`;
  const result = await callCloudinary(
    "upload",
    creds,
    { public_id: `${folder}/${randomUUID()}`, asset_folder: folder },
    new Blob([new Uint8Array(webp)], { type: "image/webp" }),
  );

  const url = result.secure_url;
  if (typeof url !== "string") throw new Error("Cloudinary returned no URL for that upload.");

  return {
    url,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}

/**
 * The public_id a delivery URL was built from, or null if the URL is not one of
 * ours — a seeded `/design/...` path, or an asset from some other account.
 */
export function publicIdFromUrl(url: string): string | null {
  const creds = credentials();
  if (!creds) return null;

  const prefix = `https://res.cloudinary.com/${creds.cloudName}/image/upload/`;
  if (!url.startsWith(prefix)) return null;

  return (
    url
      .slice(prefix.length)
      // the version segment Cloudinary inserts for cache busting
      .replace(/^v\d+\//, "")
      .replace(/\.[a-z0-9]+$/i, "") || null
  );
}

/** Only Cloudinary-hosted files can be deleted; seeded files live in /public. */
export async function deleteUpload(url: string) {
  const creds = credentials();
  const publicId = publicIdFromUrl(url);
  if (!creds || !publicId) return;

  try {
    await callCloudinary("destroy", creds, { public_id: publicId });
  } catch {
    // Already gone, or never ours — the database row is what matters, and a
    // failed cleanup must not block the delete the admin asked for.
  }
}
