/**
 * Applies the manual image audit:
 *  - deletes stock placeholder graphics that were scraped as product photos
 *  - flags photos carrying a third-party watermark or burnt-in price badge
 *  - ranks a hand-picked set of well-shot pieces for hero and category artwork
 */
// Same guard as the other scripts: loadEnvFile throws when the file is absent.
for (const f of [".env.local", ".env"]) {
  try { process.loadEnvFile(f); } catch { /* fall through to the real environment */ }
}
import { unlink } from "node:fs/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// Empty: every scraped placeholder has been deleted along with its product.
// Add a base filename here to remove a new one.
const PLACEHOLDERS: string[] = [];

// Empty: the watermarked photos, and the products carrying them, are gone.
// Add a base filename here to flag a new one for replacement.
const WATERMARKED: string[] = [];

/**
 * Well-composed, watermark-free photography, in the order we want to show it.
 *
 * This ranks COMPOSITION, not provenance: several entries are supplier
 * catalogue renders rather than photographs of our own finished work, so it
 * orders the product grids and must not be treated as a source of "our work".
 */
const HERO_PRODUCTS = [
  "salvadoress-u-shaped-sofa", "piper-trending-l-sofa", "yolande-wooden-6-seater-chair",
  "pookie-wooden-6-seater-chair", "gasolina-wooden-bed-2", "arizona-curved-sofa",
  "nike-curved-shaped-sofa", "taro-8-seater-dining-set", "grey-moose-4-seater-dining-set",
  "domonick-wooden-chair", "cooper-l-shaped-sofa", "baguette-simple-l-shaped-sofa",
];

const url = (base: string) => `/products/${base}.webp`;

// ---- 1. placeholders: remove from disk and from the catalogue -------------
const deleted = await prisma.productImage.deleteMany({
  where: { url: { in: PLACEHOLDERS.map(url) } },
});
for (const base of PLACEHOLDERS) {
  await unlink(`public/products/${base}.webp`).catch(() => {});
}
console.log(`placeholders removed: ${deleted.count}`);

// ---- 2. watermarks: flag, and demote so a clean photo leads the gallery ---
const flagged = await prisma.productImage.updateMany({
  where: { url: { in: WATERMARKED.map(url) } },
  data: { needsReview: true, reviewNote: "Carries a third-party watermark or price badge — replace with our own photograph." },
});
console.log(`watermarked flagged: ${flagged.count}`);

// Push flagged images to the back of their product's gallery, but only where a
// clean alternative exists — otherwise the product would lose its only thumbnail.
const affected = await prisma.product.findMany({
  where: { images: { some: { needsReview: true } } },
  select: { id: true, slug: true, images: { orderBy: { position: "asc" } } },
});
let reordered = 0;
for (const product of affected) {
  const clean = product.images.filter((i) => !i.needsReview);
  if (clean.length === 0) continue;
  const ordered = [...clean, ...product.images.filter((i) => i.needsReview)];
  await Promise.all(
    ordered.map((img, position) =>
      prisma.productImage.update({ where: { id: img.id }, data: { position } }),
    ),
  );
  reordered++;
}
console.log(`galleries reordered: ${reordered}`);

// ---- 3. curation ranking --------------------------------------------------
await prisma.product.updateMany({ data: { heroRank: null } });
for (const [rank, slug] of HERO_PRODUCTS.entries()) {
  await prisma.product.updateMany({ where: { slug }, data: { heroRank: rank } });
}
const ranked = await prisma.product.count({ where: { heroRank: { not: null } } });
console.log(`curated for hero: ${ranked}`);

// ---- 4. report ------------------------------------------------------------
const orphans = await prisma.product.count({ where: { images: { none: {} } } });
const onlyFlagged = await prisma.product.count({
  where: { images: { every: { needsReview: true }, some: {} } },
});
console.log(`products with no image at all: ${orphans}`);
console.log(`products whose every image needs review: ${onlyFlagged}`);

await prisma.$disconnect();
