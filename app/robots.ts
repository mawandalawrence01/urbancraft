import type { MetadataRoute } from "next";

import { siteUrl as base } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Nothing here is useful in an index, and cart/checkout URLs are per-visitor.
        // /og/* is deliberately NOT listed: those are the link-preview images,
        // and a crawler that cannot fetch them shows a link with no picture.
        disallow: ["/admin", "/api/", "/cart", "/checkout", "/orders/", "/account", "/search"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
