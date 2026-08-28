"use client";

import Image from "next/image";
import Link from "next/link";
import { Add, Minus, Trash, ShoppingCart, ArrowRight2 } from "iconsax-reactjs";
import { Button, ButtonLink } from "@/components/ui/Button";
import { lineKey, useCart } from "@/components/cart/CartProvider";
import { formatUGX } from "@/lib/utils";

export function CartView({ freeFrom }: { freeFrom: number }) {
  const { lines, subtotal, setQuantity, remove, clear, ready } = useCart();

  if (!ready) {
    return (
      <div className="mt-8 space-y-3">
        {[0, 1, 2].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-line bg-paper px-6 py-16 text-center">
        <ShoppingCart size={38} className="mx-auto text-muted" />
        <h2 className="mt-4 font-display text-lg font-semibold">Your cart is empty</h2>
        <p className="mx-auto mt-2 max-w-sm text-[0.9rem] text-muted">
          Browse the catalogue and add the pieces you want. Nothing is charged until you check out.
        </p>
        <ButtonLink href="/shop" className="mt-6" size="lg">Start shopping</ButtonLink>
      </div>
    );
  }

  return (
    <div className="mt-7 lg:flex lg:items-start lg:gap-10">
      <ul className="min-w-0 flex-1 divide-y divide-line border-y border-line">
        {lines.map((line) => {
          const key = lineKey(line);
          return (
            <li key={key} className="flex gap-3 py-4 sm:gap-4">
              <Link
                href={`/product/${line.slug}`}
                className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-sand sm:size-28"
              >
                {line.imageUrl && (
                  <Image src={line.imageUrl} alt="" fill sizes="112px" className="object-cover" />
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/product/${line.slug}`} className="line-clamp-2 font-medium leading-snug hover:underline">
                      {line.name}
                    </Link>
                    {line.variantName && (
                      <p className="mt-0.5 text-[0.8rem] text-tan-2">{line.variantName}</p>
                    )}
                    <p className="tabular mt-1 text-[0.85rem] text-muted">
                      {formatUGX(line.unitPrice)} each
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(key)}
                    aria-label={`Remove ${line.name}`}
                    className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-sand hover:text-danger"
                  >
                    <Trash size={17} />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  <div className="flex items-center rounded-full border border-line bg-paper">
                    <button
                      type="button"
                      onClick={() => setQuantity(key, line.quantity - 1)}
                      className="grid size-9 place-items-center rounded-full"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="tabular w-7 text-center text-[0.9rem] font-medium">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(key, line.quantity + 1)}
                      className="grid size-9 place-items-center rounded-full"
                      aria-label="Increase quantity"
                    >
                      <Add size={15} />
                    </button>
                  </div>
                  <span className="tabular font-display font-semibold">
                    {formatUGX(line.unitPrice * line.quantity)}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="mt-6 lg:sticky lg:top-24 lg:mt-0 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-line bg-paper p-5">
          <h2 className="font-display text-lg font-semibold">Summary</h2>

          <dl className="mt-4 space-y-2.5 text-[0.9rem]">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular font-medium">{formatUGX(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd className="text-right text-[0.85rem] text-muted">
                {freeFrom === 0 ? "Free in Kampala Central" : "Calculated at checkout"}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="font-medium">Total</span>
            <span className="tabular font-display text-xl font-semibold">{formatUGX(subtotal)}</span>
          </div>
          <p className="mt-1 text-[0.78rem] text-muted">Delivery added at the next step.</p>

          <ButtonLink href="/checkout" size="lg" className="mt-5 w-full">
            Checkout <ArrowRight2 size={16} />
          </ButtonLink>

          <div className="mt-3 flex items-center justify-between">
            <Link href="/shop" className="text-[0.85rem] text-tan-2 hover:underline">
              Continue shopping
            </Link>
            <Button variant="ghost" size="sm" onClick={clear} className="text-muted">
              Clear cart
            </Button>
          </div>
        </div>

        <p className="mt-4 px-1 text-[0.8rem] leading-relaxed text-muted">
          Made-to-order pieces take 1–2 weeks to build. We confirm every order by phone before
          production starts.
        </p>
      </aside>
    </div>
  );
}
