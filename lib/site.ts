/**
 * The canonical origin, as an absolute URL with a scheme.
 *
 * `NEXT_PUBLIC_SITE_URL` is entered by hand in a dashboard, so it routinely
 * arrives without a scheme or with a trailing slash. `new URL()` throws on the
 * former, which fails the whole build during metadata collection — so we
 * normalise rather than trust it.
 */
function normalise(value: string | undefined): string | null {
  const raw = value?.trim().replace(/\/+$/, "");
  if (!raw) return null;

  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return null;
  }
}

/**
 * The live domain, hard-coded on purpose.
 *
 * Canonical tags, the sitemap, JSON-LD and every Open Graph image URL are
 * derived from this. When it fell back to Vercel's generated deployment URL,
 * every one of those pointed at `*.vercel.app` — which tells Google the real
 * copy of each page lives on a host nobody links to, and leaves WhatsApp
 * resolving preview images against the wrong origin. That is too costly to
 * leave depending on an environment variable somebody has to remember to set,
 * so the production origin lives in the repo and the env var overrides it.
 */
const PRODUCTION_ORIGIN = "https://www.urbancraft.co.ug";

export const siteUrl =
  normalise(process.env.NEXT_PUBLIC_SITE_URL) ??
  // Production always claims the real domain, whatever URL Vercel built it at.
  (process.env.VERCEL_ENV === "production" ? PRODUCTION_ORIGIN : null) ??
  // Previews and branch deploys describe themselves, so they never claim to be
  // the canonical copy of a page.
  normalise(process.env.VERCEL_URL) ??
  normalise(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  "http://localhost:3000";

export const siteUrlObject = new URL(siteUrl);

/** Absolute URL for a site-relative path. Schema.org and Open Graph both
 *  require absolute URLs; a relative one is silently dropped by most crawlers. */
export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}
