/**
 * robots.txt for david.urbancraft.co.ug.
 *
 * The proxy rewrites this host's /robots.txt here. Without it the subdomain
 * served the storefront's file, which declares `Host: www.urbancraft.co.ug`
 * and points at the storefront sitemap — so this site advertised a sitemap
 * that never mentions it, and listed none of its own.
 */
export const dynamic = "force-static";

const PROFILE_URL = "https://david.urbancraft.co.ug";

export function GET() {
  const body = [
    "User-Agent: *",
    "Allow: /",
    "",
    `Host: ${PROFILE_URL}`,
    `Sitemap: ${PROFILE_URL}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=86400",
    },
  });
}
