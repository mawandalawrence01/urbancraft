import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { QuickAdd } from "@/components/product/QuickAdd";
import type { ProductCard as ProductCardType } from "@/lib/catalog";
import { cn, discountPercent, formatUGX } from "@/lib/utils";

export function ProductCard({
  product,
  priority = false,
  className,
  sizes = "(min-width:1280px) 20vw, (min-width:768px) 26vw, 45vw",
}: {
  product: ProductCardType;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const [primary, hover] = product.images;
  const off = discountPercent(product.price, product.compareAtPrice);

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <Link href={`/product/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-sand">
          {primary ? (
            <Image
              src={primary.url}
              alt={primary.alt ?? product.name}
              fill
              sizes={sizes}
              priority={priority}
              placeholder={primary.blurDataUrl ? "blur" : "empty"}
              blurDataURL={primary.blurDataUrl ?? undefined}
              className={cn(
                "object-cover transition-transform duration-700 ease-[var(--ease-out-soft)]",
                hover ? "group-hover:opacity-0" : "group-hover:scale-105",
              )}
            />
          ) : (
            <div className="grid size-full place-items-center text-xs text-muted">No image</div>
          )}

          {hover && (
            <Image
              src={hover.url}
              alt=""
              fill
              sizes={sizes}
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}

          <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
            {off && <Badge tone="tan">−{off}%</Badge>}
            {product.isFeatured && !off && <Badge tone="ink">Bestseller</Badge>}
            {!product.inStock && <Badge tone="neutral">Made to order</Badge>}
          </div>

          <QuickAdd product={product} />
        </div>

        <div className="flex flex-1 flex-col pt-3">
          {product.category && (
            <p className="text-[0.7rem] uppercase tracking-[0.12em] text-muted">
              {product.category.name}
            </p>
          )}
          <h3 className="mt-1 line-clamp-2 text-[0.92rem] font-medium leading-snug">
            {product.name}
          </h3>
          <div className="mt-auto flex items-baseline gap-2 pt-2">
            <span className="tabular font-display text-[1.02rem] font-semibold">
              {formatUGX(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="tabular text-[0.8rem] text-muted line-through">
                {formatUGX(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

export function ProductGrid({
  products,
  priorityCount = 4,
  className,
}: {
  products: ProductCardType[];
  priorityCount?: number;
  className?: string;
}) {
  return (
    // Listing pages put a filter rail beside this grid, so it steps up to four
    // columns only at xl — at lg four columns leaves the cards too narrow.
    <div className={cn("grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:gap-x-5 xl:grid-cols-4", className)}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}
