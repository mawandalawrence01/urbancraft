import "server-only";

import { prisma } from "@/lib/db";
import { productCard, type ProductCard } from "@/lib/catalog";

/**
 * The home page is one continuous feed: the whole catalogue, with photographs
 * of installed work mixed in, loaded a batch at a time as the visitor scrolls.
 *
 * A batch is 12 tiles because 12 fills whole rows at 2, 3 and 4 columns, so a
 * batch boundary never leaves a ragged row in the middle of the page. While
 * there are products left, a batch is 10 pieces and 2 photographs; after the
 * last piece, the remaining photographs carry on 12 at a time.
 */
const BATCH = 12;
const PHOTOS_PER_MIXED = 2;
const PRODUCTS_PER_MIXED = BATCH - PHOTOS_PER_MIXED;

/** The last page a client may ask for. Far beyond any real catalogue. */
export const MAX_FEED_PAGE = 500;

export type FeedPhoto = {
  id: string;
  url: string;
  blurDataUrl: string | null;
  caption: string | null;
  service: { slug: string; name: string };
};

export type FeedItem =
  | { kind: "product"; product: ProductCard }
  | { kind: "photo"; photo: FeedPhoto };

export type FeedPage = {
  page: number;
  items: FeedItem[];
  hasMore: boolean;
  /** Live pieces in the catalogue, for the heading. */
  productTotal: number;
};

/** Same gate as the design galleries: only approved photos of our own work. */
const photoWhere = {
  origin: "OWN_WORK",
  needsReview: false,
  service: { isPublished: true, kind: "FITOUT" },
} as const;

export async function getFeedPage(page: number): Promise<FeedPage> {
  const [productTotal, photoTotal] = await Promise.all([
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.designImage.count({ where: photoWhere }),
  ]);

  const mixedPages = Math.ceil(productTotal / PRODUCTS_PER_MIXED);
  const mixed = page < mixedPages;

  const productSkip = page * PRODUCTS_PER_MIXED;
  const photoSkip = mixed
    ? page * PHOTOS_PER_MIXED
    : mixedPages * PHOTOS_PER_MIXED + (page - mixedPages) * BATCH;
  const photoTake = mixed ? PHOTOS_PER_MIXED : BATCH;

  const [products, photos] = await Promise.all([
    mixed
      ? prisma.product.findMany({
          where: { status: "ACTIVE" },
          select: productCard,
          // Best-shot pieces first, so the feed opens on its strongest photographs.
          orderBy: [
            { heroRank: { sort: "asc", nulls: "last" } },
            { isFeatured: "desc" },
            { position: "asc" },
            { id: "asc" },
          ],
          skip: productSkip,
          take: PRODUCTS_PER_MIXED,
        })
      : Promise.resolve([]),
    photoSkip < photoTotal
      ? prisma.designImage.findMany({
          where: photoWhere,
          select: {
            id: true, url: true, blurDataUrl: true, caption: true,
            service: { select: { slug: true, name: true } },
          },
          // Position first, trade second: the feed shows each trade's best
          // photograph before anyone's second, rather than ten kitchens in a row.
          orderBy: [{ position: "asc" }, { service: { position: "asc" } }, { id: "asc" }],
          skip: photoSkip,
          take: photoTake,
        })
      : Promise.resolve([]),
  ]);

  // One photograph after every half-batch of furniture.
  const items: FeedItem[] = [];
  const half = Math.ceil(products.length / 2);
  const photoItems = photos.map((photo): FeedItem => ({ kind: "photo", photo }));
  products.forEach((product, i) => {
    items.push({ kind: "product", product });
    if (i === half - 1 && photoItems.length > 0) items.push(photoItems.shift()!);
  });
  items.push(...photoItems);

  const hasMore =
    page + 1 < mixedPages || photoSkip + photos.length < photoTotal;

  return { page, items, hasMore, productTotal };
}
