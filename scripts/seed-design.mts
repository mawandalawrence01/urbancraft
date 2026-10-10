/**
 * Imports data/design.json (produced from the workshop photo drop) into
 * DesignService / DesignImage.
 *
 * Safe to re-run: services upsert by slug and images upsert by url, so a
 * second pass refreshes dimensions without duplicating rows — and, critically,
 * without resetting an `origin` an admin has already decided. Everything lands
 * as UNSET the first time, which keeps it off the storefront until sorted.
 */
// `loadEnvFile` throws when the file is absent, and the optional call only
// guards against the function missing — so each one needs its own catch or a
// machine without .env.local cannot seed at all (CI, Vercel).
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // absent — fall through to the real environment
  }
}

import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client.js";
import { DESIGN_SERVICES } from "../lib/design-services.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

type DesignAsset = {
  slug: string;
  bucket: string;
  src: string;
  width: number;
  height: number;
  blurDataUrl: string;
  needsReview?: boolean;
  reviewNote?: string;
};

const assets: DesignAsset[] = JSON.parse(
  await readFile(path.join(process.cwd(), "data/design.json"), "utf8"),
);

let services = 0;
let created = 0;
let refreshed = 0;

for (const [i, meta] of DESIGN_SERVICES.entries()) {
  const service = await prisma.designService.upsert({
    where: { slug: meta.slug },
    create: {
      slug: meta.slug,
      name: meta.name,
      tagline: meta.tagline,
      description: meta.description,
      kind: meta.kind,
      position: i,
    },
    // Copy is owned by the code, so re-running republishes edited wording.
    // `isPublished` is owned by the admin and deliberately left alone.
    update: {
      name: meta.name,
      tagline: meta.tagline,
      description: meta.description,
      kind: meta.kind,
      position: i,
    },
  });
  services++;

  const mine = assets.filter((a) => a.bucket === meta.slug);
  for (const [position, asset] of mine.entries()) {
    const existing = await prisma.designImage.findUnique({
      where: { url: asset.src },
      select: { id: true },
    });

    await prisma.designImage.upsert({
      where: { url: asset.src },
      create: {
        serviceId: service.id,
        url: asset.src,
        width: asset.width,
        height: asset.height,
        blurDataUrl: asset.blurDataUrl,
        position,
        needsReview: asset.needsReview ?? false,
        reviewNote: asset.reviewNote ?? null,
      },
      update: {
        serviceId: service.id,
        width: asset.width,
        height: asset.height,
        blurDataUrl: asset.blurDataUrl,
        position,
      },
    });

    if (existing) refreshed++;
    else created++;
  }
}

const unsorted = await prisma.designImage.count({ where: { origin: "UNSET" } });
const flagged = await prisma.designImage.count({ where: { needsReview: true } });

console.log(`services : ${services}`);
console.log(`images   : ${created} created, ${refreshed} refreshed`);
console.log(`unsorted : ${unsorted} awaiting review at /admin/design`);
console.log(`flagged  : ${flagged} carry a third-party watermark`);

await prisma.$disconnect();
