/**
 * Applies the manual image audit:
 *  - deletes stock placeholder graphics that were scraped as product photos
 *  - flags photos carrying a third-party watermark or burnt-in price badge
 *  - ranks a hand-picked set of well-shot pieces for hero and category artwork
 */
process.loadEnvFile(".env");
import { unlink } from "node:fs/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const PLACEHOLDERS = [
  "5-seater-leather-box-sofa-set-311-seater-premium-leather-seating-3", "dottie-grey-cup-board-3",
  "eland-throne-chair-2", "ferann-3-in-1-tables-2", "mahogany-wooden-l-6-seater-sofa-2",
  "makena-modern-wall-unit-2", "milo-purple-8-seater-sofas-1", "modern-l-shaped-sofa-2",
  "putin-glass-center-table-2", "round-head-vintage-dining-set-2", "treasure-diamond-aquarium-3",
  "twin-jurrien-metallic-center-table-3", "twin-turner-metallic-center-table-3",
  "verrati-ottoman-stools-3",
];

const WATERMARKED = [
  "a1-skyline-center-table-2", "ameire-6-seater-l-sofa-1", "ameire-6-seater-l-sofa-2",
  "bachelors-mini-cupboard-1", "bunk-bed-with-2-beds-drawers-1", "cenary-center-table-2",
  "ferann-3-in-1-tables-1", "jiffy-wooden-towel-rack-1", "jiffy-wooden-towel-rack-2",
  "jovanic-3-peice-tv-stand-1", "kate-purple-bathroom-cabinets-1", "keith-bent-5-seaters-sofa-1",
  "keith-bent-5-seaters-sofa-2", "little-ian-bunk-bed-1", "lorenzo-center-table-1",
  "louis-sink-cabinet-1", "makato-wooden-bed-1", "mikalus-l-sofa-1", "monaco-bunk-bed-1",
  "morgan-love-u-8-seater-sofa-1", "natalia-5-seater-sofa-2", "nkore-leather-6-seater-1",
  "noelle-l-shaped-6-seaters-sofa-1", "round-head-vintage-dining-set-1", "slim-j-sofa-bed-1",
  "slim-j-sofa-bed-2", "triplet-3-in-1-bed-available-on-order-1", "u-shaped-kitchen-cabinets-1",
  "u-shaped-kitchen-cabinets-2", "zibu-white-trending-tv-stand-1",
];

/** Well-composed, watermark-free photography, in the order we want to show it. */
const HERO_PRODUCTS = [
  "richmond-buttoned-6-seater-sofa", "salvadoress-u-shaped-sofa", "piper-trending-l-sofa",
  "yolande-wooden-6-seater-chair", "pookie-wooden-6-seater-chair", "gasolina-wooden-bed-2",
  "arizona-curved-sofa", "nike-curved-shaped-sofa", "taro-8-seater-dining-set",
  "grey-moose-4-seater-dining-set", "domonick-wooden-chair", "cooper-l-shaped-sofa",
  "baguette-simple-l-shaped-sofa",
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
