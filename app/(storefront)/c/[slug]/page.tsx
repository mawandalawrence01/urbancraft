import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight2 } from "iconsax-reactjs";

import { Filters } from "@/components/shop/Filters";
import { Pagination } from "@/components/shop/Pagination";
import { ProductGrid } from "@/components/product/ProductCard";
import {
  getCategoryBySlug, getCategoryTree, getPriceBounds, listProducts, type SortKey,
} from "@/lib/catalog";

// Filters and pagination arrive as searchParams, so this route renders per
// request rather than prerendering.
export const revalidate = 300;

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.seoTitle ?? category.name,
    description: category.seoDescription ?? category.description ?? undefined,
    alternates: { canonical: `/c/${category.slug}` },
  };
}

export default async function CategoryPage({
  params, searchParams,
}: { params: Params; searchParams: SearchParams }) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category || !category.isActive) notFound();

  const page = Number(one(sp.page) ?? 1) || 1;
  const sort = (one(sp.sort) as SortKey) ?? "featured";
  const min = one(sp.min) ? Number(one(sp.min)) : undefined;
  const max = one(sp.max) ? Number(one(sp.max)) : undefined;

  const [{ items, total, pageCount }, bounds, tree] = await Promise.all([
    listProducts({
      categorySlug: slug, page, sort, minPrice: min, maxPrice: max,
      inStockOnly: one(sp.stock) === "1",
    }),
    getPriceBounds(slug),
    getCategoryTree(),
  ]);

  // Siblings when we're on a leaf, children when we're on a room
  const siblings = category.parentId
    ? (tree.find((t) => t.slug === category.parent?.slug)?.children ?? [])
    : category.children;

  const filterCategories = siblings.map((c) => ({
    slug: c.slug, name: c.name, count: c._count.productLinks,
  }));

  return (
    <div className="container-page pt-6">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-[0.8rem] text-muted">
        <Link href="/shop" className="hover:text-ink">Shop</Link>
        {category.parent && (
          <>
            <ArrowRight2 size={12} />
            <Link href={`/c/${category.parent.slug}`} className="hover:text-ink">
              {category.parent.name}
            </Link>
          </>
        )}
        <ArrowRight2 size={12} />
        <span className="text-ink">{category.name}</span>
      </nav>

      <header className="mb-4">
        <h1 className="text-3xl font-semibold sm:text-4xl">{category.name}</h1>
        {category.description && (
          <p className="mt-2 max-w-xl text-[0.95rem] text-ink-3">{category.description}</p>
        )}
      </header>

      {!category.parentId && category.children.length > 1 && (
        <div className="snap-rail mb-6 gap-2">
          {category.children.map((c) => (
            <Link
              key={c.slug} href={`/c/${c.slug}`}
              className="rounded-full border border-line bg-paper px-4 py-2 text-[0.85rem] transition hover:border-ink"
            >
              {c.name}
              <span className="tabular ml-1.5 text-xs text-muted">{c._count.productLinks}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="lg:flex lg:gap-10">
        <Suspense>
          <Filters
            bounds={bounds} categories={filterCategories}
            activeCategory={category.slug} total={total}
          />
        </Suspense>

        <div className="min-w-0 flex-1">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-line bg-paper px-6 py-16 text-center">
              <h2 className="font-display text-lg font-semibold">Nothing here yet</h2>
              <p className="mx-auto mt-2 max-w-sm text-[0.9rem] text-muted">
                Try clearing the filters, or{" "}
                <Link href="/contact" className="text-tan-2 underline">ask us to build it</Link>.
              </p>
            </div>
          ) : (
            <>
              <ProductGrid products={items} />
              <Pagination
                page={page} pageCount={pageCount} basePath={`/c/${slug}`}
                params={{
                  sort: one(sp.sort), min: one(sp.min),
                  max: one(sp.max), stock: one(sp.stock),
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
