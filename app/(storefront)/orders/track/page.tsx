import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Receipt21, Warning2 } from "iconsax-reactjs";
import { Button } from "@/components/ui/Button";
import { getOrderByNumber } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Track an Order",
  description: "Look up an UrbanCraft order with your order number and phone number.",
};

type SearchParams = Promise<{ error?: string }>;

async function lookup(formData: FormData) {
  "use server";
  const number = String(formData.get("orderNumber") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const order = await getOrderByNumber(number, phone);
  if (!order) redirect("/orders/track?error=1");
  redirect(`/orders/${order.orderNumber}?phone=${encodeURIComponent(phone)}`);
}

export default async function TrackPage({ searchParams }: { searchParams: SearchParams }) {
  const { error } = await searchParams;

  return (
    <div className="container-page max-w-md pt-10">
      <div className="rounded-2xl border border-line bg-paper p-7">
        <Receipt21 size={30} className="text-tan" />
        <h1 className="mt-3 text-2xl font-semibold">Track an order</h1>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">
          Enter the order number from your confirmation and the phone number you gave us.
        </p>

        {error && (
          <p className="mt-5 flex items-start gap-2 rounded-xl bg-danger-soft px-4 py-3 text-[0.86rem] text-danger">
            <Warning2 size={17} className="mt-0.5 shrink-0" />
            We could not find an order with that number and phone number.
          </p>
        )}

        <form action={lookup} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[0.83rem] font-medium">Order number</span>
            <input
              name="orderNumber" required placeholder="UC-A1B2C3" autoComplete="off"
              className="w-full rounded-xl border border-line bg-cream px-4 py-3 uppercase outline-none transition focus:border-tan"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[0.83rem] font-medium">Phone number</span>
            <input
              name="phone" required type="tel" inputMode="tel" placeholder="0772 123 456"
              autoComplete="tel"
              className="w-full rounded-xl border border-line bg-cream px-4 py-3 outline-none transition focus:border-tan"
            />
          </label>
          <Button type="submit" size="lg" className="w-full">Find my order</Button>
        </form>
      </div>
    </div>
  );
}
