/**
 * Generates the favicon set from app/icon.svg.
 *
 * The .ico embeds PNGs rather than BMPs — supported everywhere that matters,
 * and it keeps the alpha channel clean at small sizes.
 */
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

const svg = await readFile("app/icon.svg");
const render = (size) => sharp(svg, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

// --- favicon.ico (16, 32, 48) ---------------------------------------------
const icoSizes = [16, 32, 48];
const pngs = await Promise.all(icoSizes.map(render));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);            // reserved
header.writeUInt16LE(1, 2);            // type: icon
header.writeUInt16LE(pngs.length, 4);  // image count

let offset = 6 + pngs.length * 16;
const entries = pngs.map((png, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(icoSizes[i] === 256 ? 0 : icoSizes[i], 0); // width
  e.writeUInt8(icoSizes[i] === 256 ? 0 : icoSizes[i], 1); // height
  e.writeUInt8(0, 2);                  // palette size
  e.writeUInt8(0, 3);                  // reserved
  e.writeUInt16LE(1, 4);               // colour planes
  e.writeUInt16LE(32, 6);              // bits per pixel
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += png.length;
  return e;
});

await writeFile("app/favicon.ico", Buffer.concat([header, ...entries, ...pngs]));

// --- platform icons --------------------------------------------------------
await writeFile("app/apple-icon.png", await render(180));
await writeFile("public/brand/icon-192.png", await render(192));
await writeFile("public/brand/icon-512.png", await render(512));

console.log(`favicon.ico  ${icoSizes.join(", ")}px  (${pngs.reduce((n, p) => n + p.length, 0)} bytes of image data)`);
console.log("apple-icon.png 180px · icon-192.png · icon-512.png");
