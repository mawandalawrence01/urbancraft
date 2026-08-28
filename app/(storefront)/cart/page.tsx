import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { getDeliveryZones } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const zones = await getDeliveryZones();
  const cheapest = zones.reduce(
    (min, z) => (z.fee < min ? z.fee : min),
    zones[0]?.fee ?? 0,
  );

  return (
    <div className="container-page pt-8">
      <h1 className="text-3xl font-semibold sm:text-4xl">Your cart</h1>
      <CartView freeFrom={cheapest} />
    </div>
  );
}
