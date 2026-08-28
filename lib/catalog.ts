import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

export const PER_PAGE = 24;

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "name";

const ORDER_BY: Record<SortKey, Prisma.ProductOrderByWithRelationInput[]> = {
  featured: [
    { heroRank: { sort: "asc", nulls: "last" } },
    { isFeatured: "desc" },
    { position: "asc" },
  ],
  newest: [{ publishedAt: "desc" }],
  "price-asc": [{ price: "asc" }],
  "price-desc": [{ price: "desc" }],
  name: [{ name: "asc" }],
};

export const productCard = {
  id: true, slug: true, name: true, price: true, compareAtPrice: true,
  inStock: true, isFeatured: true, summary: true,
  category: { select: { slug: true, name: true } },
  images: {
    select: { url: true, alt: true, blurDataUrl: true, width: true, height: true },
    orderBy: [{ needsReview: "asc" as const }, { position: "asc" as const }],
    take: 2,
  },
} satisfies Prisma.ProductSelect;

export type ProductCard = Prisma.ProductGetPayload<{ select: typeof productCard }>;

/** The full navigable tree: top-level rooms, each with their leaf categories. */
export const getCategoryTree = cache(async () => {
  const parents = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { position: "asc" },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { position: "asc" },
        include: { _count: { select: { productLinks: true } } },
      },
      _count: { select: { productLinks: true } },
    },
  });
  return parents;
});

export const getCategoryBySlug = cache(async (slug: string) => {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      parent: { select: { slug: true, name: true } },
      children: { where: { isActive: true }, orderBy: { position: "asc" },
                  include: { _count: { select: { productLinks: true } } } },
    },
  });
});

export type ProductFilters = {
  categorySlug?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: SortKey;
  page?: number;
  perPage?: number;
};

export async function listProducts(filters: ProductFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = filters.perPage ?? PER_PAGE;

  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };

  if (filters.categorySlug) {
    // productLinks carries both the leaf and its parent room, so one clause
    // serves "/c/living-room" and "/c/sofas" alike.
    where.categories = { some: { category: { slug: filters.categorySlug } } };
  }
  if (filters.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {
      ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.inStockOnly) where.inStock = true;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productCard,
      orderBy: ORDER_BY[filters.sort ?? "featured"],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, perPage, pageCount: Math.max(1, Math.ceil(total / perPage)) };
}

/** Price bounds for the active filter set, so the range slider matches reality. */
export async function getPriceBounds(categorySlug?: string) {
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };
  if (categorySlug) where.categories = { some: { category: { slug: categorySlug } } };
  const agg = await prisma.product.aggregate({ where, _min: { price: true }, _max: { price: true } });
  return { min: agg._min.price ?? 0, max: agg._max.price ?? 10_000_000 };
}

export const getProductBySlug = cache(async (slug: string) => {
  return prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
      category: { include: { parent: { select: { slug: true, name: true } } } },
      categories: { include: { category: { select: { slug: true, name: true } } } },
      reviews: { where: { isApproved: true }, orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
});

export async function getRelatedProducts(productId: string, categoryId: string | null, take = 8) {
  if (!categoryId) return [];
  return prisma.product.findMany({
    where: { status: "ACTIVE", id: { not: productId }, categories: { some: { categoryId } } },
    select: productCard,
    orderBy: [{ isFeatured: "desc" }, { position: "asc" }],
    take,
  });
}

export async function getFeaturedProducts(take = 8) {
  return prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [{ heroRank: { not: null } }, { isFeatured: true }],
      // Never lead the home page with a photo we have flagged for replacement
      images: { some: { needsReview: false } },
    },
    select: productCard,
    orderBy: [{ heroRank: { sort: "asc", nulls: "last" } }, { position: "asc" }],
    take,
  });
}

/** Hand-picked pieces for the home hero collage. */
export async function getHeroProducts(take = 3) {
  return prisma.product.findMany({
    where: { status: "ACTIVE", heroRank: { not: null } },
    select: productCard,
    orderBy: { heroRank: "asc" },
    take,
  });
}

export async function getNewestProducts(take = 8) {
  return prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: productCard,
    orderBy: { publishedAt: "desc" },
    take,
  });
}

/** Lightweight typeahead for the search sheet. */
export async function quickSearch(q: string, take = 6) {
  if (!q.trim()) return [];
  return prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { category: { name: { contains: q, mode: "insensitive" } } },
      ],
    },
    select: {
      slug: true, name: true, price: true,
      images: { select: { url: true, blurDataUrl: true }, take: 1, orderBy: { position: "asc" } },
    },
    take,
  });
}

/**
 * One cover image per room, in a single round trip.
 * Rendering a tile per room and querying inside each is an N+1 on the busiest
 * page on the site.
 */
export const getRoomCovers = cache(async (slugs: string[]) => {
  if (slugs.length === 0) return {} as Record<string, { url: string; blurDataUrl: string | null }>;

  const rows = await prisma.productImage.findMany({
    where: {
      position: 0,
      needsReview: false,
      product: {
        status: "ACTIVE",
        categories: { some: { category: { slug: { in: slugs } } } },
      },
    },
    select: {
      url: true, blurDataUrl: true,
      product: {
        select: {
          isFeatured: true,
          categories: { select: { category: { select: { slug: true } } } },
        },
      },
    },
    orderBy: [
      { product: { heroRank: { sort: "asc", nulls: "last" } } },
      { product: { isFeatured: "desc" } },
      { product: { price: "desc" } },
    ],
    take: 600,
  });

  const covers: Record<string, { url: string; blurDataUrl: string | null }> = {};
  for (const row of rows) {
    for (const { category } of row.product.categories) {
      if (slugs.includes(category.slug) && !covers[category.slug]) {
        covers[category.slug] = { url: row.url, blurDataUrl: row.blurDataUrl };
      }
    }
  }
  return covers;
});
