"use client";

import { useState } from "react";
import { Add, Minus, ShoppingCart, Whatsapp } from "iconsax-reactjs";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartProvider";
import { cn, formatUGX } from "@/lib/utils";

export type Variant = {
  id: string; name: string; price: number;
  warrantyMonths: number | null; description: string | null;
};

export function AddToCart({
  productId, slug, name, price, imageUrl, variants, whatsapp,
}: {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  variants: Variant[];
  whatsapp?: string;
}) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [variantId, setVariantId] = useState<string | null>(
    variants.find((v) => v.name.toLowerCase().includes("standard"))?.id ?? variants[0]?.id ?? null,
  );

  const variant = variants.find((v) => v.id === variantId) ?? null;
  const unitPrice = variant?.price ?? price;

  const submit = () => {
    add({
      productId,
      variantId: variant?.id ?? null,
      slug, name,
      variantName: variant?.name ?? null,
      unitPrice,
      imageUrl,
      quantity,
    });
  };

  return (
    <div className="space-y-5">
      {variants.length > 1 && (
        <fieldset>
          <legend className="mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-muted">
            Quality class
          </legend>
          <div className="space-y-2">
            {variants.map((v) => (
              <label
                key={v.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition",
                  v.id === variantId ? "border-ink bg-sand" : "border-line bg-paper hover:border-ink-3",
                )}
              >
                <input
                  type="radio" name="variant" value={v.id}
                  checked={v.id === variantId}
                  onChange={() => setVariantId(v.id)}
                  className="mt-1 accent-[var(--color-tan)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium">{v.name}</span>
                    <span className="tabular font-display font-semibold">{formatUGX(v.price)}</span>
                  </span>
                  {v.warrantyMonths ? (
                    <span className="mt-0.5 block text-[0.76rem] text-tan-2">
                      {v.warrantyMonths / 12} year warranty
                    </span>
                  ) : null}
                  {v.description && (
                    <span className="mt-1 block text-[0.8rem] leading-relaxed text-muted">
                      {v.description}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-line bg-paper">
          <button
            type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="grid size-11 place-items-center rounded-full disabled:opacity-30"
            aria-label="Decrease quantity"
          >
            <Minus size={17} />
          </button>
          <span className="tabular w-8 text-center font-medium" aria-live="polite">{quantity}</span>
          <button
            type="button" onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            className="grid size-11 place-items-center rounded-full"
            aria-label="Increase quantity"
          >
            <Add size={17} />
          </button>
        </div>

        <Button size="lg" className="flex-1" onClick={submit} data-testid="add-to-cart">
          <ShoppingCart size={18} /> Add to cart · {formatUGX(unitPrice * quantity)}
        </Button>
      </div>

      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
            `Hello UrbanCraft, I would like to ask about the ${name}${
              variant ? ` (${variant.name})` : ""
            }.`,
          )}`}
          target="_blank" rel="noreferrer"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-paper font-medium transition hover:border-ink"
        >
          <Whatsapp size={19} className="text-success" />
          Ask about this piece
        </a>
      )}
    </div>
  );
}

/** Compact bar that follows the user down a long product page on mobile. */
export function StickyBuyBar({
  productId, slug, name, price, imageUrl, variants,
}: {
  productId: string; slug: string; name: string; price: number;
  imageUrl: string | null; variants: Variant[];
}) {
  const { add } = useCart();
  const defaultVariant =
    variants.find((v) => v.name.toLowerCase().includes("standard")) ?? variants[0] ?? null;
  const unitPrice = defaultVariant?.price ?? price;

  return (
    <div
      className="fixed inset-x-0 bottom-16 z-30 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur lg:hidden"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.78rem] text-muted">{name}</p>
          <p className="tabular font-display font-semibold">{formatUGX(unitPrice)}</p>
        </div>
        <Button
          size="lg"
          data-testid="sticky-add-to-cart"
          onClick={() =>
            add({
              productId, variantId: defaultVariant?.id ?? null, slug, name,
              variantName: defaultVariant?.name ?? null, unitPrice, imageUrl,
            })
          }
        >
          <ShoppingCart size={18} /> Add to cart
        </Button>
      </div>
    </div>
  );
}
