import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight2, Truck, ShieldTick, Ruler, Clock, Box, Award,
} from "iconsax-reactjs";

import { Gallery } from "@/components/product/Gallery";
import { AddToCart, StickyBuyBar } from "@/components/product/AddToCart";
import { ProductCard } from "@/components/product/ProductCard";
import { Badge } from "@/components/ui/Badge";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { getSetting, type ContactSettings } from "@/lib/settings";
import { discountPercent, formatUGX } from "@/lib/utils";

export const revalidate = 600;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  // Pre-render the pieces most likely to be landed on from search
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true },
    orderBy: [{ isFeatured: "desc" }, { position: "asc" }],
    take: 60,
  });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const image = product.images[0]?.url;
  return {
    title: product.seoTitle ?? product.name,
    description:
      product.seoDescription ??
      product.summary ??
      `${product.name} made to order by UrbanCraft in Kampala. ${formatUGX(product.price)}.`,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.summary ?? undefined,
      images: image ? [{ url: image, width: 1200, height: 1500 }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, contact] = await Promise.all([
    getRelatedProducts(product.id, product.categoryId, 8),
    getSetting<ContactSettings>("site.contact"),
  ]);

  const body = (product.body ?? []) as { type: string; text: string }[];
  const paragraphs = body.filter((b) => b.type === "p");
  const bullets = body.filter((b) => b.type === "li");
  const off = discountPercent(product.price, product.compareAtPrice);
  const room = product.category?.parent ?? product.category;

  const prices = product.variants.length
    ? product.variants.map((v) => v.price)
    : [product.price];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary ?? product.name,
    sku: product.sku ?? undefined,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: "UrbanCraft" },
    category: product.category?.name,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "UGX",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: prices.length,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
      seller: { "@type": "Organization", name: "UrbanCraft Furniture Workshop" },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-page pt-5">
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-[0.8rem] text-muted">
          <Link href="/shop" className="hover:text-ink">Shop</Link>
          {room && (
            <>
              <ArrowRight2 size={12} />
              <Link href={`/c/${room.slug}`} className="hover:text-ink">{room.name}</Link>
            </>
          )}
          {product.category && product.category.slug !== room?.slug && (
            <>
              <ArrowRight2 size={12} />
              <Link href={`/c/${product.category.slug}`} className="hover:text-ink">
                {product.category.name}
              </Link>
            </>
          )}
        </nav>

        <div className="lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <Gallery images={product.images} name={product.name} />

          <div className="mt-7 lg:mt-0">
            <div className="mb-3 flex flex-wrap gap-2">
              {product.isFeatured && <Badge tone="ink">Bestseller</Badge>}
              {off && <Badge tone="tan">−{off}% today</Badge>}
              <Badge tone={product.inStock ? "success" : "neutral"}>
                {product.inStock ? "Ready to deliver" : "Made to order"}
              </Badge>
            </div>

            <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">{product.name}</h1>

            <div className="mt-3 flex flex-wrap items-baseline gap-3">
              <span className="tabular font-display text-2xl font-semibold sm:text-3xl">
                {formatUGX(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="tabular text-base text-muted line-through">
                  {formatUGX(product.compareAtPrice)}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[0.82rem] text-muted">
              Price shown is Standard class. Delivery quoted at checkout.
            </p>

            <div className="mt-7">
              <AddToCart
                productId={product.id}
                slug={product.slug}
                name={product.name}
                price={product.price}
                imageUrl={product.images[0]?.url ?? null}
                variants={product.variants.map((v) => ({
                  id: v.id, name: v.name, price: v.price,
                  warrantyMonths: v.warrantyMonths, description: v.description,
                }))}
                whatsapp={contact.whatsapp}
              />
            </div>

            <ul className="mt-7 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
              {[
                [Clock, "Build time", `${product.leadTimeDays} working days`],
                [ShieldTick, "Warranty", `${Math.round(product.warrantyMonths / 12)} year${product.warrantyMonths >= 24 ? "s" : ""}`],
                [Truck, "Delivery", "Free in Kampala Central"],
                [Ruler, "Sizing", "Built to your measurements"],
              ].map(([Icon, label, value]) => {
                const I = Icon as typeof Clock;
                return (
                  <li key={label as string} className="flex items-start gap-3 bg-cream p-4">
                    <I size={19} className="mt-0.5 shrink-0 text-tan" />
                    <div>
                      <p className="text-[0.75rem] uppercase tracking-[0.1em] text-muted">
                        {label as string}
                      </p>
                      <p className="text-[0.88rem] font-medium">{value as string}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            {(paragraphs.length > 0 || bullets.length > 0) && (
              <section className="mt-9">
                <h2 className="font-display text-lg font-semibold">About this piece</h2>
                <div className="mt-3 space-y-3.5 text-[0.93rem] leading-relaxed text-ink-3">
                  {paragraphs.map((b, i) => <p key={i}>{b.text}</p>)}
                </div>
                {bullets.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {bullets.map((b, i) => (
                      <li key={i} className="flex gap-2.5 text-[0.9rem] text-ink-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-tan" />
                        {b.text}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            <dl className="mt-8 divide-y divide-line border-y border-line text-[0.88rem]">
              {[
                ["Item code", product.sku],
                ["Category", product.category?.name],
                ["Material", product.material],
                ["Dimensions", product.dimensions],
                ["Finish", product.colour],
              ]
                .filter(([, v]) => Boolean(v))
                .map(([label, value]) => (
                  <div key={label as string} className="flex justify-between gap-4 py-3">
                    <dt className="text-muted">{label as string}</dt>
                    <dd className="text-right font-medium">{value as string}</dd>
                  </div>
                ))}
            </dl>

            {product.variants.length <= 1 && (
              <section className="mt-8 rounded-2xl border border-line bg-sand p-5">
                <h2 className="flex items-center gap-2 font-display text-[1rem] font-semibold">
                  <Award size={19} className="text-tan" /> Available in three quality classes
                </h2>
                <p className="mt-2 text-[0.87rem] leading-relaxed text-ink-3">
                  This price is our Standard class — musambya, muvule or similar hardwood with a
                  2 year warranty. Economy and Top class are quoted on request; Top class uses
                  mahogany, Elgon teak or mugavu and carries 5 years.
                </p>
                <Link href="/contact" className="mt-3 inline-flex items-center gap-1 text-[0.87rem] font-medium text-tan-2 hover:underline">
                  Ask for a class quote <ArrowRight2 size={14} />
                </Link>
              </section>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold">You may also like</h2>
              {product.category && (
                <Link
                  href={`/c/${product.category.slug}`}
                  className="flex shrink-0 items-center gap-1 text-[0.88rem] text-tan-2 hover:underline"
                >
                  All {product.category.name.toLowerCase()} <ArrowRight2 size={15} />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>

      <StickyBuyBar
        productId={product.id}
        slug={product.slug}
        name={product.name}
        price={product.price}
        imageUrl={product.images[0]?.url ?? null}
        variants={product.variants.map((v) => ({
          id: v.id, name: v.name, price: v.price,
          warrantyMonths: v.warrantyMonths, description: v.description,
        }))}
      />
      {/* Clears the sticky bar so the footer is reachable */}
      <div className="h-20 lg:hidden" aria-hidden />
    </>
  );
}
