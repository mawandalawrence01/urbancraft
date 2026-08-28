import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { getDeliveryZones } from "@/lib/orders";
import { getSetting, type BankSettings, type DepositSettings } from "@/lib/settings";
import { isConfigured } from "@/lib/yo";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [zones, bank, deposit] = await Promise.all([
    getDeliveryZones(),
    getSetting<BankSettings>("payments.bank"),
    getSetting<DepositSettings>("checkout.deposit"),
  ]);

  return (
    <div className="container-page pt-8">
      <h1 className="text-3xl font-semibold sm:text-4xl">Checkout</h1>
      <p className="mt-2 max-w-xl text-[0.93rem] text-ink-3">
        We confirm every order by phone before production starts. {deposit.note}
      </p>

      <CheckoutForm
        zones={zones.map((z) => ({ id: z.id, name: z.name, fee: z.fee, etaNote: z.etaNote }))}
        bank={bank}
        momoAvailable={isConfigured()}
      />
    </div>
  );
}
