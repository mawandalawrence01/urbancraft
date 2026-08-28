"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { TickCircle } from "iconsax-reactjs";
import { useCart } from "@/components/cart/CartProvider";
import { formatUGX } from "@/lib/utils";

export function CartToast() {
  const { justAdded, dismissToast, count } = useCart();

  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(dismissToast, 4200);
    return () => clearTimeout(t);
  }, [justAdded, dismissToast]);

  if (!justAdded) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-20 z-40 animate-fade-up lg:inset-x-auto lg:right-6 lg:bottom-6 lg:w-96"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-paper p-3 shadow-[0_20px_50px_-20px_rgba(23,21,15,0.45)]">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-sand">
          {justAdded.imageUrl && (
            <Image src={justAdded.imageUrl} alt="" fill sizes="56px" className="object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[0.72rem] font-medium text-success">
            <TickCircle size={14} variant="Bold" /> Added to cart
          </p>
          <p className="truncate text-[0.88rem] font-medium">{justAdded.name}</p>
          <p className="tabular text-[0.8rem] text-muted">{formatUGX(justAdded.unitPrice)}</p>
        </div>
        <Link
          href="/cart"
          onClick={dismissToast}
          className="shrink-0 rounded-full bg-ink px-4 py-2.5 text-[0.8rem] font-medium text-cream"
        >
          Cart ({count})
        </Link>
      </div>
    </div>
  );
}
