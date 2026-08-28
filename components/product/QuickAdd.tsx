"use client";

import { ShoppingCart } from "iconsax-reactjs";
import { useCart } from "@/components/cart/CartProvider";
import type { ProductCard } from "@/lib/catalog";

/** Add straight from a grid card, without leaving the listing. */
export function QuickAdd({ product }: { product: ProductCard }) {
  const { add } = useCart();

  return (
    <button
      type="button"
      aria-label={`Add ${product.name} to cart`}
      onClick={(e) => {
        // The card is wrapped in a Link — don't navigate on add
        e.preventDefault();
        e.stopPropagation();
        add({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          unitPrice: product.price,
          imageUrl: product.images[0]?.url ?? null,
        });
      }}
      className="absolute bottom-2.5 right-2.5 grid size-10 place-items-center rounded-full bg-paper/95 text-ink shadow-sm backdrop-blur transition hover:bg-ink hover:text-cream active:scale-95 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
    >
      <ShoppingCart size={18} />
    </button>
  );
}
