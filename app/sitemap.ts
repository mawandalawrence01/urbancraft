import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

import { siteUrl as base } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, projects, services] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: {
        slug: true,
        updatedAt: true,
        // Google Images indexes what the sitemap declares, so each product
        // carries its own photography. Flagged shots are never listed.
        images: {
          where: { needsReview: false },
          orderBy: { position: "asc" },
          take: 5,
          select: { url: true },
        },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.project.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true, coverImage: true },
    }),
    // Only services with an approved photo — an empty gallery is not worth
    // sending a crawler to.
    prisma.designService.findMany({
      where: {
        isPublished: true,
        images: { some: { origin: "OWN_WORK", needsReview: false } },
      },
      select: {
        slug: true,
        updatedAt: true,
        images: {
          where: { origin: "OWN_WORK", needsReview: false },
          orderBy: { position: "asc" },
          take: 5,
          select: { url: true },
        },
      },
    }),
  ]);

  const abs = (path: string) => new URL(path, base).toString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/design`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/design/enquire`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/projects`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/delivery`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/orders/track`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...staticPages,
    ...categories.map((c) => ({
      url: `${base}/c/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    // Product pages are the ones we actually want ranking for search traffic
    ...products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: p.images.map((i) => abs(i.url)),
    })),
    ...projects.map((p) => ({
      url: `${base}/projects/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.4,
      images: p.coverImage ? [abs(p.coverImage)] : undefined,
    })),
    ...services.map((s) => ({
      url: `${base}/design/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: s.images.map((i) => abs(i.url)),
    })),
  ];
}
