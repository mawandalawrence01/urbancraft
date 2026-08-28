process.loadEnvFile(".env");
import sharp, { type OverlayOptions } from "sharp";
import { readdir } from "node:fs/promises";
import { mkdir } from "node:fs/promises";

const OUT = process.env.SHOT_DIR ?? "tmp";
await mkdir(OUT, { recursive: true });

const DIR = "public/products";
const files = (await readdir(DIR)).filter((f) => f.endsWith(".webp")).sort();

const CELL = 190, COLS = 8, ROWS = 6, PER = COLS * ROWS;
const sheets = Math.ceil(files.length / PER);

for (let s = 0; s < sheets; s++) {
  const slice = files.slice(s * PER, (s + 1) * PER);
  const tiles: OverlayOptions[] = [];
  for (const [i, f] of slice.entries()) {
    const left = (i % COLS) * CELL, top = Math.floor(i / COLS) * CELL;
    tiles.push({
      input: await sharp(`${DIR}/${f}`).resize(CELL, CELL - 16, { fit: "cover" }).toBuffer(),
      left, top,
    });
    const label = String(s * PER + i);
    tiles.push({
      input: Buffer.from(
        `<svg width="${CELL}" height="16"><rect width="${CELL}" height="16" fill="#111"/>` +
        `<text x="3" y="12" font-family="monospace" font-size="11" fill="#fff">${label}</text></svg>`),
      left, top: top + CELL - 16,
    });
  }
  await sharp({ create: { width: COLS * CELL, height: ROWS * CELL, channels: 3, background: "#222" } })
    .composite(tiles).png()
    .toFile(`${OUT}/audit-${s}.png`);
}
console.log(`${files.length} images across ${sheets} sheets`);
