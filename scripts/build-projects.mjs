import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const SRC = "/home/laurent/dev/urbancraft/public";
const DEST = path.join(SRC, "projects");
await fs.mkdir(DEST, { recursive: true });

const projects = [
  ["shop-interior-1", "Retail Shop Interior", "Commercial", "Custom white and oak shelving built to carry retail display weight without deflecting."],
  ["showroom-display", "Premium Showroom", "Commercial", "Arched display units with integrated LED lighting and glass counters."],
  ["tech-store-shelving", "Electronics Store", "Commercial", "Modern tech retail space with integrated display and cable-managed shelving."],
  ["reception-counter", "Reception Counter", "Commercial", "Branded reception desk with a full-height shelving backdrop."],
  ["office-shelving", "Executive Office", "Office", "Oak and navy office fit-out with custom shelving and a matching desk."],
  ["office-interior", "Modern Workspace", "Office", "Contemporary office interior with built-in storage along the full wall."],
  ["wayfinding-signage", "Wayfinding Signage", "Office", "Wood slat wayfinding and directional signage cut to the building's grid."],
  ["minimalist-reception", "Minimalist Reception", "Office", "A clean reception desk reduced to two planes and a light line."],
  ["salon-interior", "Beauty Salon", "Hospitality", "Salon stations with wood slat panelling and concealed servicing."],
  ["modern-salon", "Modern Salon Interior", "Hospitality", "Styling stations under pendant lighting, mirrors set flush into the panelling."],
  ["classic-arched-shelving", "Boutique Display", "Hospitality", "Classic arched shelving with walnut accents."],
  ["arched-shelving", "Arched Display Wall", "Hospitality", "A repeating arch motif carried across the length of the retail wall."],
  ["illuminated-shelving", "LED Illuminated Shelving", "Shelving", "Backlit display shelving in an oak finish."],
  ["led-shelving", "Corner LED Display", "Shelving", "Floor-to-ceiling illuminated corner shelving."],
  ["custom-shelving", "Custom Built-ins", "Shelving", "Bespoke shelving photographed mid-installation."],
  ["wood-slat-feature", "Wood Slat Feature Wall", "Shelving", "Slatted feature wall, spacing set out so the run ends on a full slat."],
  ["baby-crib", "Baby Nursery Set", "Residential", "Custom cot with matching storage, finished in a non-toxic lacquer."],
  ["nursery-furniture", "Nursery Fit-out", "Residential", "A full nursery built as one set so the finishes match exactly."],
  ["balcony-furniture", "Balcony Design", "Residential", "Balcony seating and planting integrated into a single timber frame."],
  ["balcony-design", "Balcony Joinery", "Residential", "Weather-finished balcony joinery sized to a narrow footprint."],
  ["workshop-progress", "Work in Progress", "Workshop", "Behind the scenes during a showroom installation."],
  ["work-in-progress", "Installation Phase", "Workshop", "Custom cabinetry during fitting."],
  ["work-in-progress-2", "Fitting and Finishing", "Workshop", "Final scribing and finishing on site."],
];

const out = [];
for (const [file, title, category, summary] of projects) {
  let srcPath = null;
  for (const ext of [".jpeg", ".jpg", ".png", ".webp"]) {
    const p = path.join(SRC, file + ext);
    try { await fs.access(p); srcPath = p; break; } catch {}
  }
  if (!srcPath) { console.warn("missing:", file); continue; }

  const buf = await sharp(srcPath)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toBuffer();
  await fs.writeFile(path.join(DEST, `${file}.webp`), buf);
  const meta = await sharp(buf).metadata();
  const blur = await sharp(buf).resize(16, 16, { fit: "inside" }).webp({ quality: 45 }).toBuffer();

  out.push({
    slug: file, title, category, summary,
    coverImage: `/projects/${file}.webp`,
    width: meta.width, height: meta.height,
    blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`,
  });
  await fs.unlink(srcPath);
}

await fs.writeFile("/home/laurent/dev/urbancraft/data/projects.json", JSON.stringify(out, null, 1));
console.log(`projects: ${out.length}`);
