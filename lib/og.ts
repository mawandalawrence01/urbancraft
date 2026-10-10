import "server-only";

import sharp from "sharp";

import { absoluteUrl } from "@/lib/site";

/**
 * Open Graph card rendering.
 *
 * Every photograph on this site is WebP, which is right for the page and wrong
 * for a link preview: Meta documents a 600KB ceiling and a 300px minimum width
 * for og:image but never commits to WebP, and field reports of WhatsApp
 * silently dropping WebP previews are common enough that it is not worth the
 * risk. So previews are re-rendered as JPEG at the 1200x630 every crawler
 * understands, well inside the size budget.
 *
 * Generated on request rather than committed, because pre-rendering a card for
 * every product, service and project would add roughly 25MB of near-duplicate
 * images to the repository. The result is immutable for a given source image,
 * so it is cached hard at the edge and generated at most once.
 */

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** Matches the page ground, so a letterboxed photo reads as deliberate. */
const GROUND = { r: 255, g: 255, b: 255, alpha: 1 };

export type OgCard = { body: Buffer; contentType: string };

/**
 * Fetches a site image and re-frames it as a preview card.
 *
 * The source is fetched over HTTP rather than read from `public/` because
 * static assets are served by the CDN and are not reliably present on the
 * filesystem of the function that renders this.
 */
export async function renderOgCard(imagePath: string): Promise<OgCard | null> {
  let source: ArrayBuffer;
  try {
    const res = await fetch(absoluteUrl(imagePath), {
      // The source is immutable; let the platform cache it between renders.
      next: { revalidate: 86_400 },
    });
    if (!res.ok) return null;
    source = await res.arrayBuffer();
  } catch {
    return null;
  }

  try {
    const body = await sharp(Buffer.from(source))
      .rotate()
      .resize(OG_WIDTH, OG_HEIGHT, {
        fit: "cover",
        // Portrait furniture shots lose their subject to a centre crop at
        // 1.9:1, so the crop follows the busiest region instead.
        position: sharp.strategy.attention,
        background: GROUND,
      })
      .flatten({ background: GROUND })
      .jpeg({ quality: 78, progressive: true, mozjpeg: true })
      .toBuffer();

    return { body, contentType: "image/jpeg" };
  } catch {
    return null;
  }
}

/** Shared response headers. The card only changes when its source does. */
export const OG_CACHE_HEADERS = {
  "Content-Type": "image/jpeg",
  "Cache-Control": "public, max-age=3600, s-maxage=31536000, stale-while-revalidate=86400",
} as const;

/**
 * The card for any page without artwork of its own — the home page included.
 * Without this a shared link renders as a bare grey box in WhatsApp.
 */
export const DEFAULT_OG_PATH = "/og/default.jpg";

export function ogImageMeta(url: string, alt: string) {
  return [{ url, width: OG_WIDTH, height: OG_HEIGHT, alt, type: "image/jpeg" }];
}
