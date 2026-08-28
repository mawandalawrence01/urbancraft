import type { Metadata } from "next";
import { Truck, Clock, ShieldTick, Wallet3 } from "iconsax-reactjs";
import { getDeliveryZones } from "@/lib/orders";
import { getSetting, type DepositSettings } from "@/lib/settings";
import { formatUGX } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Delivery, Payment & Returns",
  description:
    "UrbanCraft delivery areas and fees across Uganda, how payment works, build times, and what our warranty covers.",
  alternates: { canonical: "/delivery" },
};

export default async function DeliveryPage() {
  const [zones, deposit] = await Promise.all([
    getDeliveryZones(),
    getSetting<DepositSettings>("checkout.deposit"),
  ]);

  return (
    <div className="container-page max-w-3xl pt-8">
      <h1 className="text-3xl font-semibold sm:text-4xl">Delivery, payment &amp; returns</h1>
      <p className="mt-3 text-[0.97rem] leading-relaxed text-ink-3">
        Everything below applies to every order. If something here does not fit your situation,
        call us — we would rather agree it up front than surprise you later.
      </p>

      <section className="mt-10">
        <h2 className="flex items-center gap-2.5 font-display text-xl font-semibold">
          <Truck size={21} className="text-tan" /> Where we deliver
        </h2>
        <table className="mt-4 w-full border-collapse text-[0.9rem]">
          <thead>
            <tr className="border-b border-line text-left text-[0.78rem] uppercase tracking-[0.1em] text-muted">
              <th className="pb-2 font-medium">Area</th>
              <th className="pb-2 text-right font-medium">Fee</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z.id} className="border-b border-line-2">
                <td className="py-3">
                  <span className="block font-medium">{z.name}</span>
                  {z.etaNote && <span className="text-[0.8rem] text-muted">{z.etaNote}</span>}
                </td>
                <td className="tabular py-3 text-right font-medium">
                  {z.fee === 0 ? "Free" : formatUGX(z.fee)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-[0.85rem] text-muted">
          Delivery includes carrying the piece in and assembling it. Upstairs deliveries with no
          lift may be quoted separately — tell us at checkout.
        </p>
      </section>

      {[
        {
          Icon: Clock, title: "Build times",
          body: [
            "Most pieces are made to order and take one to two working weeks from the day your deposit clears. Fitted work — kitchens, wardrobes, wall units — takes longer because we survey the space first.",
            "Anything marked “Ready to deliver” is already built and can go out within a few days.",
          ],
        },
        {
          Icon: Wallet3, title: "Paying for your order",
          body: [
            "You can pay by MTN or Airtel mobile money, by bank deposit, or in cash when we deliver.",
            deposit.note ||
              "Production on made-to-order pieces starts once a deposit clears; the balance is due on delivery.",
            "We confirm every order by phone before we start cutting. Nothing is built on an unconfirmed order.",
          ],
        },
        {
          Icon: ShieldTick, title: "Warranty and returns",
          body: [
            "Standard class carries a two year warranty and Top class five years, covering joinery and finish under normal household use. Economy class is sold without a warranty and we will always tell you so before you buy.",
            "If a joint moves, a drawer stops running true, or a finish fails within the warranty, we collect the piece, repair it and bring it back at our cost.",
            "Made-to-order pieces are cut to your specification, so they cannot be returned simply because you changed your mind. If we got the specification wrong, that is ours to fix.",
            "Damage in transit is our responsibility — check the piece before our driver leaves and tell us there and then.",
          ],
        },
      ].map(({ Icon, title, body }) => (
        <section key={title} className="mt-10">
          <h2 className="flex items-center gap-2.5 font-display text-xl font-semibold">
            <Icon size={21} className="text-tan" /> {title}
          </h2>
          <div className="mt-3 space-y-3 text-[0.93rem] leading-relaxed text-ink-3">
            {body.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </section>
      ))}
    </div>
  );
}
