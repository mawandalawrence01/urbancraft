/**
 * The canonical origin, as an absolute URL with a scheme.
 *
 * `NEXT_PUBLIC_SITE_URL` is entered by hand in a dashboard, so it routinely
 * arrives without a scheme or with a trailing slash. `new URL()` throws on the
 * former, which fails the whole build during metadata collection — so we
 * normalise rather than trust it.
 *
 * When it is not set at all we fall back to the URL Vercel injects, which
 * means a deploy works before anyone has configured anything.
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

export const siteUrl =
  normalise(process.env.NEXT_PUBLIC_SITE_URL) ??
  // Set by Vercel to the stable production domain
  normalise(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  // Set by Vercel to this specific deployment
  normalise(process.env.VERCEL_URL) ??
  "http://localhost:3000";

export const siteUrlObject = new URL(siteUrl);
