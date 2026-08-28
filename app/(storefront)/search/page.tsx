import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchNormal1 } from "iconsax-reactjs";

import { FilterSidebar, FilterToolbar } from "@/components/shop/Filters";
import { Pagination } from "@/components/shop/Pagination";
import { ProductGrid } from "@/components/product/ProductCard";
import { getPriceBounds, listProducts, type SortKey } from "@/lib/catalog";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const q = one((await searchParams).q) ?? "";
  return {
    title: q ? `Search: ${q}` : "Search",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = (one(sp.q) ?? "").trim();
  const page = Number(one(sp.page) ?? 1) || 1;

  const [{ items, total, pageCount }, bounds] = await Promise.all([
    listProducts({
      q, page,
      sort: (one(sp.sort) as SortKey) ?? "featured",
      minPrice: one(sp.min) ? Number(one(sp.min)) : undefined,
      maxPrice: one(sp.max) ? Number(one(sp.max)) : undefined,
      inStockOnly: one(sp.stock) === "1",
    }),
    getPriceBounds(),
  ]);

  return (
    <div className="container-page pt-8">
      <h1 className="text-2xl font-semibold sm:text-3xl">
        {q ? <>Results for “{q}”</> : "Search"}
      </h1>
      <p className="mt-2 text-[0.9rem] text-muted">
        {q ? `${total} ${total === 1 ? "piece" : "pieces"} found` : "Search the whole catalogue."}
      </p>

      <div className="mt-6 lg:flex lg:gap-10">
        <Suspense>
          <FilterSidebar bounds={bounds} total={total} />
        </Suspense>

        <div className="min-w-0 flex-1">
          <Suspense>
            <FilterToolbar bounds={bounds} total={total} />
          </Suspense>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-line bg-paper px-6 py-16 text-center">
              <SearchNormal1 size={34} className="mx-auto text-muted" />
              <h2 className="mt-4 font-display text-lg font-semibold">Nothing matched</h2>
              <p className="mx-auto mt-2 max-w-sm text-[0.9rem] text-muted">
                Try a room or a piece — “sofa”, “bunk bed”, “wall unit” — or{" "}
                <Link href="/contact" className="text-tan-2 underline">ask us to build it</Link>.
              </p>
            </div>
          ) : (
            <>
              <ProductGrid products={items} />
              <Pagination
                page={page} pageCount={pageCount} basePath="/search"
                params={{ q, sort: one(sp.sort), min: one(sp.min), max: one(sp.max), stock: one(sp.stock) }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
