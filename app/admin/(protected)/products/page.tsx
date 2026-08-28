import Image from "next/image";
import Link from "next/link";
import { Add, SearchNormal1, Warning2 } from "iconsax-reactjs";

import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card, EmptyState, PageHeader, inputClass } from "@/components/admin/ui";
import { Pagination } from "@/components/shop/Pagination";
import { prisma } from "@/lib/db";
import { formatUGX } from "@/lib/utils";
import type { Prisma } from "@/lib/generated/prisma/client";

const PER_PAGE = 30;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = (one(sp.q) ?? "").trim();
  const status = one(sp.status);
  const page = Number(one(sp.page) ?? 1) || 1;

  const where: Prisma.ProductWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status && status !== "ALL") where.status = status as Prisma.ProductWhereInput["status"];

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true, name: true, slug: true, sku: true, price: true, status: true,
        inStock: true, isFeatured: true, heroRank: true,
        category: { select: { name: true } },
        images: { select: { url: true, needsReview: true }, orderBy: { position: "asc" }, take: 1 },
        _count: { select: { images: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.count(),
  ]);

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${total} matching · ${categories} categories`}
        action={
          <ButtonLink href="/admin/products/new" size="sm">
            <Add size={16} /> New product
          </ButtonLink>
        }
      />

      <form className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-0 flex-1">
          <SearchNormal1 size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            name="q" defaultValue={q} placeholder="Search name, SKU or slug…"
            className={`${inputClass} pl-10`}
          />
        </div>
        <select name="status" defaultValue={status ?? "ALL"} className={`${inputClass} w-auto`}>
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button type="submit" className="rounded-xl bg-ink px-5 text-[0.88rem] font-medium text-cream">
          Filter
        </button>
      </form>

      {products.length === 0 ? (
        <EmptyState
          title="No products match"
          body="Try a different search, or add a new piece to the catalogue."
          action={<ButtonLink href="/admin/products/new" size="sm">Add a product</ButtonLink>}
        />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-line">
            {products.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 p-3 transition hover:bg-sand sm:gap-4 sm:p-4">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-sand sm:size-16">
                    {p.images[0] ? (
                      <Image src={p.images[0].url} alt="" fill sizes="64px" className="object-cover" />
                    ) : (
                      <span className="grid size-full place-items-center text-[0.6rem] text-muted">No image</span>
                    )}
                    {p.images[0]?.needsReview && (
                      <span className="absolute inset-x-0 bottom-0 grid place-items-center bg-warn/90 py-0.5">
                        <Warning2 size={11} className="text-white" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-[0.9rem] font-medium">{p.name}</p>
                    <p className="truncate text-[0.78rem] text-muted">
                      {p.category?.name ?? "Uncategorised"}
                      {p.sku ? ` · ${p.sku}` : ""} · {p._count.images} photo{p._count.images === 1 ? "" : "s"}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge tone={p.status === "ACTIVE" ? "success" : p.status === "DRAFT" ? "warn" : "neutral"}>
                        {p.status.toLowerCase()}
                      </Badge>
                      {p.heroRank !== null && <Badge tone="tan">featured on home</Badge>}
                      {!p.inStock && <Badge tone="neutral">made to order</Badge>}
                    </div>
                  </div>

                  <span className="tabular shrink-0 text-[0.9rem] font-medium">{formatUGX(p.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Pagination
        page={page} pageCount={Math.max(1, Math.ceil(total / PER_PAGE))}
        basePath="/admin/products" params={{ q, status }}
      />
    </>
  );
}
