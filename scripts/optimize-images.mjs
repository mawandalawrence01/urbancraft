import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const DIR = '/home/laurent/dev/urbancraft/public/products';
const files = (await fs.readdir(DIR)).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
const meta = {};
let before = 0, after = 0, n = 0;

for (const f of files) {
  const src = path.join(DIR, f);
  const stat = await fs.stat(src);
  before += stat.size;
  const base = f.replace(/\.(jpe?g|png|webp)$/i, '');
  const dest = path.join(DIR, base + '.webp');

  const img = sharp(src, { failOn: 'none' });
  const info = await img.metadata();

  const buf = await sharp(src, { failOn: 'none' })
    .rotate()
    .resize({ width: 1200, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toBuffer();
  await fs.writeFile(dest, buf);
  if (path.extname(f).toLowerCase() !== '.webp') await fs.unlink(src);
  after += buf.length;

  const out = await sharp(buf).metadata();
  const blur = await sharp(buf).resize(16, 16, { fit: 'inside' }).webp({ quality: 45 }).toBuffer();
  meta[base] = {
    src: `/products/${base}.webp`,
    width: out.width, height: out.height,
    blurDataURL: `data:image/webp;base64,${blur.toString('base64')}`,
  };
  if (++n % 60 === 0) console.log(`${n}/${files.length}`);
}

await fs.writeFile('/home/laurent/dev/urbancraft/data/images.json', JSON.stringify(meta, null, 1));
console.log(`done ${n} images  ${(before/1e6).toFixed(1)}MB -> ${(after/1e6).toFixed(1)}MB`);
