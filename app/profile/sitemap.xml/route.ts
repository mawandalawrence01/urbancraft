/**
 * The profile site is one page, so its sitemap is one entry. It exists so the
 * subdomain can be submitted to Search Console on its own — a sitemap listing
 * only www.urbancraft.co.ug URLs tells Google nothing about this host.
 */
export const dynamic = "force-static";

const PROFILE_URL = "https://david.urbancraft.co.ug";

export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
<url>
<loc>${PROFILE_URL}/</loc>
<changefreq>monthly</changefreq>
<priority>1.0</priority>
<image:image>
<image:loc>https://www.urbancraft.co.ug/brand/founder-david-collins-kibirige.webp</image:loc>
<image:title>David Collins Kibirige</image:title>
</image:image>
</url>
</urlset>
`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=86400",
    },
  });
}
