import type { Metadata } from "next";
import { Suspense } from "react";
import { FilterSidebar, FilterToolbar } from "@/components/shop/Filters";
import { Pagination } from "@/components/shop/Pagination";
import { ProductGrid } from "@/components/product/ProductCard";
import { getCategoryTree, getPriceBounds, listProducts, type SortKey } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "All Furniture",
  description:
    "Every piece in the UrbanCraft catalogue — sofas, beds, wall units, dining sets, office and kids furniture, made to order in Kampala.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Number(one(sp.page) ?? 1) || 1;
  const sort = (one(sp.sort) as SortKey) ?? "featured";
  const min = one(sp.min) ? Number(one(sp.min)) : undefined;
  const max = one(sp.max) ? Number(one(sp.max)) : undefined;
  const inStockOnly = one(sp.stock) === "1";

  const [{ items, total, pageCount }, bounds, tree] = await Promise.all([
    listProducts({ page, sort, minPrice: min, maxPrice: max, inStockOnly }),
    getPriceBounds(),
    getCategoryTree(),
  ]);

  const categories = tree.map((t) => ({
    slug: t.slug, name: t.name, count: t._count.productLinks,
  }));

  return (
    <div className="container-page pt-8">
      <header className="mb-2">
        <h1 className="text-3xl font-semibold sm:text-4xl">All furniture</h1>
        <p className="mt-2 max-w-xl text-[0.95rem] text-ink-3">
          {total} pieces, each made to order. Choose your timber and finish at checkout.
        </p>
      </header>

      <div className="lg:flex lg:gap-10">
        <Suspense>
          <FilterSidebar bounds={bounds} categories={categories} total={total} />
        </Suspense>

        <div className="min-w-0 flex-1">
          <Suspense>
            <FilterToolbar bounds={bounds} categories={categories} total={total} />
          </Suspense>

          {items.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <ProductGrid products={items} />
              <Pagination
                page={page} pageCount={pageCount} basePath="/shop"
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

function EmptyState() {
  return (
    <div className="rounded-2xl border border-line bg-paper px-6 py-16 text-center">
      <h2 className="font-display text-lg font-semibold">Nothing matches those filters</h2>
      <p className="mx-auto mt-2 max-w-sm text-[0.9rem] text-muted">
        Widen the price range or clear the filters to see the full catalogue.
      </p>
    </div>
  );
}
