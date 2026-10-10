import "server-only";

import { prisma } from "@/lib/db";

export { DESIGN_SERVICES, SERVICE_KINDS, type DesignServiceSeed } from "@/lib/design-services";

/** Only `OWN_WORK` is ever shown publicly — see the DesignOrigin doc comment. */
const PUBLIC_IMAGE_FILTER = {
  origin: "OWN_WORK",
  needsReview: false,
} as const;

/**
 * Published services with their approved cover art, if any.
 *
 * A service with no sorted photos yet is still returned — these are disciplines
 * the workshop genuinely offers, and the page should say so whether or not the
 * photo library has been reviewed. Only the gallery needs pictures.
 */
export async function getPublishedServices(kind?: string) {
  return prisma.designService.findMany({
    where: { isPublished: true, ...(kind ? { kind } : {}) },
    orderBy: { position: "asc" },
    include: {
      images: {
        where: PUBLIC_IMAGE_FILTER,
        orderBy: { position: "asc" },
        take: 1,
      },
      _count: { select: { images: { where: PUBLIC_IMAGE_FILTER } } },
    },
  });
}

export async function getServiceWithImages(slug: string) {
  return prisma.designService.findFirst({
    where: { slug, isPublished: true },
    include: {
      images: { where: PUBLIC_IMAGE_FILTER, orderBy: { position: "asc" } },
    },
  });
}

/** Home page art — only services that actually have an approved photo. */
export async function getDesignHighlights(limit = 4) {
  const services = await getPublishedServices("FITOUT");
  return services
    .filter((s) => s.images.length > 0)
    .slice(0, limit)
    .map((s) => ({
      slug: s.slug,
      name: s.name,
      tagline: s.tagline,
      count: s._count.images,
      cover: s.images[0],
    }));
}

/** Admin: how much of the import is still unsorted. */
export async function getReviewCounts() {
  const [unset, flagged, own, reference] = await Promise.all([
    prisma.designImage.count({ where: { origin: "UNSET" } }),
    prisma.designImage.count({ where: { needsReview: true } }),
    prisma.designImage.count({ where: { origin: "OWN_WORK" } }),
    prisma.designImage.count({ where: { origin: "REFERENCE" } }),
  ]);
  return { unset, flagged, own, reference };
}
