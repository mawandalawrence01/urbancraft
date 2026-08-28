"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";

/** The order exists on the server now, so the local cart should not linger. */
export function ClearCartOnMount() {
  const { clear, ready, lines } = useCart();

  useEffect(() => {
    if (ready && lines.length > 0) clear();
  }, [ready, lines.length, clear]);

  return null;
}
