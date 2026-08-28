import type { MetadataRoute } from "next";

import { siteUrl as base } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Nothing here is useful in an index, and cart/checkout URLs are per-visitor
        disallow: ["/admin", "/api/", "/cart", "/checkout", "/orders/", "/account", "/search"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
