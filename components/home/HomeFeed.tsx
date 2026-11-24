"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { ProductCard } from "@/components/product/ProductCard";
import { Badge } from "@/components/ui/Badge";
import type { FeedItem, FeedPage, FeedPhoto } from "@/lib/feed";

type Loaded = { pages: FeedItem[][]; hasMore: boolean };

/**
 * Pages loaded in this tab, kept outside React. Opening a product and pressing
 * back remounts the home page; without this the feed would shrink back to its
 * first batches and the visitor would lose their place.
 */
let memo: { key: string; loaded: Loaded } | null = null;

/** Start fetching well before the end, so scrolling never meets a gap. */
const PREFETCH_MARGIN = "1600px 0px";

/**
 * The home page's endless feed. The first pages arrive server-rendered; the
 * rest load as the visitor scrolls. `interludes[i]` sits after page i, so the
 * editorial sections arrive as part of the scroll rather than after it, and
 * `end` appears only once everything has loaded.
 */
export function HomeFeed({
  initial, interludes, end,
}: {
  initial: FeedPage[];
  interludes: ReactNode[];
  end: ReactNode;
}) {
  const key = initial[0]?.items[0]
    ? feedKey(initial[0].items[0]) + `:${initial[0].productTotal}`
    : "empty";

  const [loaded, setLoaded] = useState<Loaded>(() =>
    memo?.key === key
      ? memo.loaded
      : { pages: initial.map((p) => p.items), hasMore: initial.at(-1)?.hasMore ?? false },
  );
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const busy = useRef(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    memo = { key, loaded };
  }, [key, loaded]);

  const loadMore = useCallback(async () => {
    if (busy.current || !loaded.hasMore) return;
    busy.current = true;
    setStatus("loading");
    try {
      const res = await fetch(`/api/feed?page=${loaded.pages.length}`);
      if (!res.ok) throw new Error(String(res.status));
      const next = (await res.json()) as FeedPage;
      setLoaded((prev) =>
        // A late response for a page we already have must not be appended twice.
        next.page !== prev.pages.length
          ? prev
          : { pages: [...prev.pages, next.items], hasMore: next.hasMore },
      );
      setStatus("idle");
    } catch {
      setStatus("error");
    } finally {
      busy.current = false;
    }
  }, [loaded]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !loaded.hasMore || status === "error") return;
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) void loadMore(); },
      { rootMargin: PREFETCH_MARGIN },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, loaded.hasMore, status]);

  const { pages, hasMore } = loaded;
  const pieces = pages.reduce((n, p) => n + p.filter((i) => i.kind === "product").length, 0);

  return (
    <>
      {pages.map((items, i) => (
        <Fragment key={i}>
          <div
            className={
              i < initial.length
                ? "container-page mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6"
                : "container-page animate-fade-in mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6"
            }
          >
            {items.map((item) =>
              item.kind === "product"
                ? <ProductCard key={feedKey(item)} product={item.product} />
                : <WorkTile key={feedKey(item)} photo={item.photo} />,
            )}
          </div>
          {interludes[i]}
        </Fragment>
      ))}

      {hasMore ? (
        <div ref={sentinel} className="container-page mt-10">
          {status === "error" ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-[0.9rem] text-ink-3">The next pieces did not load.</p>
              <button
                type="button"
                onClick={() => { setStatus("idle"); void loadMore(); }}
                className="inline-flex h-11 items-center rounded-[var(--radius-card)] border border-rule px-6 text-[0.9rem] font-medium transition hover:border-ink"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              {/* Placeholder row so the page keeps its length while the next batch arrives. */}
              <div aria-hidden className="grid grid-cols-2 gap-x-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
                {[0, 1, 2, 3].map((n) => (
                  <div key={n} className={n >= 2 ? "hidden md:block" : undefined}>
                    <div className="skeleton aspect-[4/5] rounded-[var(--radius-card)]" />
                    <div className="skeleton mt-3 h-3.5 w-3/4 rounded-full" />
                    <div className="skeleton mt-2.5 h-3.5 w-1/3 rounded-full" />
                  </div>
                ))}
              </div>
              {/* Keyboard and screen-reader users never trip the observer. */}
              <button
                type="button"
                onClick={() => void loadMore()}
                disabled={status === "loading"}
                className="sr-only focus:not-sr-only focus:mt-6 focus:inline-flex focus:h-11 focus:items-center focus:rounded-[var(--radius-card)] focus:border focus:border-rule focus:px-6 focus:text-[0.9rem]"
              >
                Load more pieces
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          {interludes.slice(pages.length)}
          {end}
        </>
      )}

      <p aria-live="polite" className="sr-only">
        {status === "loading" ? "Loading more pieces" : `${pieces} pieces shown`}
      </p>
    </>
  );
}

function feedKey(item: FeedItem) {
  return item.kind === "product" ? `p-${item.product.id}` : `w-${item.photo.id}`;
}

/** A photograph of installed work, sized and spaced like a product card. */
function WorkTile({ photo }: { photo: FeedPhoto }) {
  return (
    <article className="group relative flex flex-col">
      <Link href={`/design/${photo.service.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-sand">
          <Image
            src={photo.url}
            alt={photo.caption ?? `${photo.service.name} installed by UrbanCraft`}
            fill
            sizes="(min-width:1280px) 20vw, (min-width:768px) 26vw, 45vw"
            placeholder={photo.blurDataUrl ? "blur" : "empty"}
            blurDataURL={photo.blurDataUrl ?? undefined}
            className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-105"
          />
          <div className="pointer-events-none absolute left-2.5 top-2.5">
            <Badge tone="neutral">Our work</Badge>
          </div>
        </div>
        <div className="flex flex-1 flex-col pt-3">
          <h3 className="text-[0.92rem] font-semibold leading-snug">{photo.service.name}</h3>
          <p className="mt-auto pt-2 text-[0.84rem] text-ink-3">Measured, built and fitted by us</p>
        </div>
      </Link>
    </article>
  );
}
