process.loadEnvFile(".env");
import sharp from "sharp";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client.js";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const where = process.argv[2] ? { categories: { some: { category: { slug: process.argv[2] } } } } : {};
const rows = await prisma.product.findMany({
  where: { status: "ACTIVE", ...where },
  orderBy: { price: "desc" },
  take: 24,
  select: { name: true, slug: true, price: true, images: { take: 1, orderBy: { position: "asc" }, select: { url: true } } },
});

const CELL = 240, COLS = 6;
const rowsN = Math.ceil(rows.length / COLS);
const tiles = [];
for (const [i, p] of rows.entries()) {
  if (!p.images[0]) continue;
  const buf = await sharp(`public${p.images[0].url}`).resize(CELL, CELL, { fit: "cover" }).toBuffer();
  tiles.push({ input: buf, left: (i % COLS) * CELL, top: Math.floor(i / COLS) * CELL });
}
await sharp({ create: { width: COLS * CELL, height: rowsN * CELL, channels: 3, background: "#eee" } })
  .composite(tiles).png().toFile(process.argv[3] ?? "/tmp/sheet.png");

rows.forEach((p, i) => console.log(`${i}: ${p.slug} — ${p.price.toLocaleString()}`));
await prisma.$disconnect();
