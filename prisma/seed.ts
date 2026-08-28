/**
 * Seeds the catalogue from data/catalog.json (extracted product data),
 * data/images.json (optimised image metadata) and data/projects.json.
 *
 * Safe to re-run: everything is upserted by slug/key.
 */
process.loadEnvFile?.(".env.local");
process.loadEnvFile?.(".env");

import { readFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const root = process.cwd();
const readJson = async <T>(p: string): Promise<T> =>
  JSON.parse(await readFile(path.join(root, p), "utf8"));

type Block = [string, string];
type Catalog = {
  taxonomy: [string, string, string, [string, string, string[]][]][];
  products: {
    sourceId: number; slug: string; name: string; price: number;
    compareAt?: number; sku: string; parent: string; child: string;
    allCategories?: string[]; featured: boolean; inStock: boolean;
    images: string[]; blocks: Block[];
    tiers: { name: string; price: number; warrantyMonths: number }[];
  }[];
};
type ImageMeta = Record<string, { src: string; width: number; height: number; blurDataURL: string }>;
type ProjectSeed = {
  slug: string; title: string; category: string; summary: string;
  coverImage: string; width: number; height: number; blurDataUrl: string;
};

async function main() {
  const catalog = await readJson<Catalog>("data/catalog.json");
  const images = await readJson<ImageMeta>("data/images.json");
  const projects = await readJson<ProjectSeed[]>("data/projects.json");

  // ---------------------------------------------------------- categories
  const productsPerChild = new Map<string, number>();
  for (const p of catalog.products) {
    productsPerChild.set(p.child, (productsPerChild.get(p.child) ?? 0) + 1);
    for (const c of p.allCategories ?? []) {
      if (c !== p.child) productsPerChild.set(c, productsPerChild.get(c) ?? 0);
    }
  }

  const categoryIds = new Map<string, string>();
  let parentPos = 0;

  for (const [pslug, pname, pdesc, children] of catalog.taxonomy) {
    const liveChildren = children.filter(([cslug]) => (productsPerChild.get(cslug) ?? 0) > 0);
    if (liveChildren.length === 0) continue;

    const parent = await prisma.category.upsert({
      where: { slug: pslug },
      create: {
        slug: pslug, name: pname, description: pdesc, position: parentPos++,
        seoTitle: `${pname} Furniture in Uganda`,
        seoDescription: `${pdesc} Made to order in Kampala by UrbanCraft, delivered countrywide.`,
      },
      update: { name: pname, description: pdesc, position: parentPos - 1 },
    });
    categoryIds.set(pslug, parent.id);

    let childPos = 0;
    for (const [cslug, cname] of liveChildren) {
      const child = await prisma.category.upsert({
        where: { slug: cslug },
        create: {
          slug: cslug, name: cname, parentId: parent.id, position: childPos++,
          description: `${cname} handmade in our Kampala workshop.`,
          seoTitle: `${cname} in Uganda — Prices & Delivery`,
          seoDescription: `Browse ${cname.toLowerCase()} made to order by UrbanCraft. Choose your timber and finish, delivered across Uganda.`,
        },
        update: { name: cname, parentId: parent.id, position: childPos - 1 },
      });
      categoryIds.set(cslug, child.id);
    }
  }
  console.log(`categories: ${categoryIds.size}`);

  // ---------------------------------------------------------- products
  let created = 0;
  let imagesLinked = 0;
  let variants = 0;

  for (const [i, p] of catalog.products.entries()) {
    const categoryId = categoryIds.get(p.child) ?? null;

    const body = p.blocks.map(([type, text]) => ({ type, text }));
    const summary =
      p.blocks.find(([t]) => t === "p")?.[1].slice(0, 180).replace(/\s+\S*$/, "") ?? null;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug, name: p.name, sku: p.sku,
        summary, body,
        price: p.price, compareAtPrice: p.compareAt ?? null,
        inStock: p.inStock, isFeatured: p.featured,
        categoryId, position: i,
        warrantyMonths: p.tiers.find((t) => /standard/i.test(t.name))?.warrantyMonths ?? 24,
        seoTitle: `${p.name} — Price in Uganda`,
        seoDescription: summary ?? `${p.name} made to order by UrbanCraft Kampala.`,
      },
      update: {
        name: p.name, price: p.price, compareAtPrice: p.compareAt ?? null,
        inStock: p.inStock, isFeatured: p.featured, categoryId, summary, body,
      },
    });
    created++;

    // multi-category links
    const leaves = new Set<string>([p.child, ...(p.allCategories ?? [])]);
    const parentSlug = p.parent;
    if (categoryIds.has(parentSlug)) leaves.add(parentSlug);
    await prisma.productCategory.deleteMany({ where: { productId: product.id } });
    await prisma.productCategory.createMany({
      data: [...leaves]
        .map((slug) => categoryIds.get(slug))
        .filter((id): id is string => Boolean(id))
        .map((categoryId) => ({ productId: product.id, categoryId })),
      skipDuplicates: true,
    });

    // images
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    const rows = p.images
      .map((_, idx) => images[`${p.slug}-${idx + 1}`])
      .filter(Boolean)
      .map((m, idx) => ({
        productId: product.id, url: m.src, alt: p.name,
        width: m.width, height: m.height, blurDataUrl: m.blurDataURL, position: idx,
      }));
    if (rows.length) {
      await prisma.productImage.createMany({ data: rows });
      imagesLinked += rows.length;
    }

    // quality tiers, where the source listed real tier pricing
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    if (p.tiers.length > 1) {
      await prisma.productVariant.createMany({
        data: p.tiers.map((t, idx) => ({
          productId: product.id,
          // Tier names already read as classes ("Standard", "Top Class") —
          // appending "Class" produced "Top Class Class".
          name: t.name,
          price: t.price,
          warrantyMonths: t.warrantyMonths || null,
          isDefault: /standard/i.test(t.name),
          position: idx,
          description: TIER_NOTES[t.name.toLowerCase()] ?? null,
        })),
      });
      variants += p.tiers.length;
    }
  }
  console.log(`products: ${created}, images: ${imagesLinked}, variants: ${variants}`);

  // ---------------------------------------------------------- projects
  for (const [i, pr] of projects.entries()) {
    await prisma.project.upsert({
      where: { slug: pr.slug },
      create: {
        slug: pr.slug, title: pr.title, summary: pr.summary,
        coverImage: pr.coverImage, clientType: pr.category, position: i,
        images: [{ url: pr.coverImage, width: pr.width, height: pr.height, blurDataUrl: pr.blurDataUrl }],
        body: [{ type: "p", text: pr.summary }],
      },
      update: { title: pr.title, summary: pr.summary, coverImage: pr.coverImage, clientType: pr.category, position: i },
    });
  }
  console.log(`projects: ${projects.length}`);

  // ---------------------------------------------------------- delivery
  const zones = [
    ["Kampala Central", 0, "Free delivery and installation"],
    ["Kampala Suburbs (Ntinda, Kololo, Bugolobi, Naalya)", 50_000, "Same or next day"],
    ["Wakiso & Mukono", 80_000, "1–2 days"],
    ["Entebbe", 100_000, "1–2 days"],
    ["Jinja, Mbarara, Gulu & other towns", 250_000, "2–4 days, quoted on distance"],
    ["Pickup from workshop", 0, "Kawempe, Kampala"],
  ] as const;
  for (const [i, [name, fee, etaNote]] of zones.entries()) {
    await prisma.deliveryZone.upsert({
      where: { name }, create: { name, fee, etaNote, position: i }, update: { fee, etaNote, position: i },
    });
  }
  console.log(`delivery zones: ${zones.length}`);

  // ---------------------------------------------------------- settings
  const settings: Record<string, unknown> = {
    "site.contact": {
      phone: "+256 784 201 141",
      whatsapp: "+256784201141",
      altPhone: "+256 751 764 257",
      email: "hello@urbancraft.co.ug",
      address: "Kawempe Division, Kampala, Uganda",
      mapUrl: "https://maps.google.com/?q=Kawempe+Division+Kampala",
      hours: [
        "Monday – Friday · 8:00am – 6:30pm",
        "Saturday · 9:30am – 6:30pm",
        "Sunday · by appointment",
      ],
    },
    "site.social": { facebook: "", instagram: "", tiktok: "" },
    "site.hero": {
      eyebrow: "Made to order in Kampala",
      title: "Furniture built to outlast the room it is bought for",
      body: "Choose the timber, the finish and the dimensions. We build it in our workshop and deliver it to your door.",
      ctaLabel: "Shop the catalogue",
      ctaHref: "/shop",
    },
    "site.announcement": {
      enabled: true,
      text: "Free delivery and installation within Kampala Central.",
    },
    "payments.bank": {
      bankName: "Stanbic Bank Uganda",
      accountName: "UrbanCraft Furniture Workshop",
      accountNumber: "9030000000000",
      branch: "Kampala Road",
      instructions: "Send your deposit slip or reference to WhatsApp +256 784 201 141 and we will confirm your order.",
    },
    "checkout.deposit": {
      // Made-to-order furniture is normally started against a deposit
      percent: 50,
      note: "Production starts once a 50% deposit clears. The balance is due on delivery.",
    },
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, create: { key, value: value as never }, update: {} });
  }
  console.log(`settings: ${Object.keys(settings).length}`);

  // ---------------------------------------------------------- admin
  const email = process.env.ADMIN_EMAIL ?? "admin@urbancraft.co.ug";
  const password = process.env.ADMIN_PASSWORD ?? "urbancraft2026";
  await prisma.adminUser.upsert({
    where: { email },
    create: { email, name: "Workshop Admin", passwordHash: await bcrypt.hash(password, 10), role: "OWNER" },
    update: {},
  });
  console.log(`admin: ${email}`);
}

const TIER_NOTES: Record<string, string> = {
  economy: "Affordable construction with hand-applied finishing. Best for light or short-term use. No warranty.",
  standard: "Musambya, muvule and comparable hardwoods — the joinery and finish we build by default.",
  "top class": "Mahogany, Elgon teak or mugavu with machine-sprayed finishing for an imported look.",
};

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
