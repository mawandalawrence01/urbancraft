import type { Metadata } from "next";
import Link from "next/link";
import { getSetting, type ContactSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms UrbanCraft sells, builds and delivers under.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const contact = await getSetting<ContactSettings>("site.contact");

  const sections: [string, string[]][] = [
    ["Orders", [
      "Placing an order on this site is an offer to buy, not a completed sale. We confirm every order by phone before production starts, and we may decline an order if we cannot build or deliver it as specified.",
      "Prices are in Ugandan Shillings and are the price at the moment you check out. Delivery is added at checkout according to your area.",
    ]],
    ["Made-to-order work", [
      "Most pieces are cut to your specification. Once production has started, a specification change may carry a cost and will change the delivery date. We will always tell you before doing the work.",
      "Photographs show the design. Because timber is a natural material, grain and colour vary between pieces; that variation is not a defect.",
    ]],
    ["Quality classes", [
      "Every design can be built in Economy, Standard or Top class. The class determines the timber, the finishing and the warranty, and is agreed before we start. Economy class carries no warranty and we will say so plainly at the point of sale.",
    ]],
    ["Payment", [
      "We accept mobile money, bank deposit and cash on delivery. For made-to-order pieces we start production once the agreed deposit clears, with the balance due on delivery.",
      "Mobile money payments are processed by Yo! Uganda Limited. A payment is only complete once we receive confirmation from them.",
    ]],
    ["Delivery", [
      "Delivery times are estimates given in good faith and depend on the build queue and, for upcountry deliveries, on transport.",
      "Please inspect your piece before our driver leaves. Transit damage reported at the point of delivery is ours to put right.",
    ]],
    ["Warranty", [
      "Standard class carries two years and Top class five years, covering joinery and finish under normal household use. The warranty does not cover accidental damage, water damage, alterations by others, or commercial use of furniture sold for the home.",
    ]],
    ["Liability", [
      "Our liability for any order is limited to the value of that order. Nothing here limits liability that Ugandan law does not allow us to limit.",
    ]],
    ["Governing law", [
      "These terms are governed by the laws of Uganda.",
    ]],
  ];

  return (
    <div className="container-page max-w-3xl pt-8">
      <h1 className="text-3xl font-semibold sm:text-4xl">Terms &amp; conditions</h1>
      <p className="mt-3 text-[0.95rem] text-muted">
        Last updated {new Date().toLocaleDateString("en-UG", { month: "long", year: "numeric" })}.
      </p>

      {sections.map(([title, paras]) => (
        <section key={title} className="mt-9">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <div className="mt-2.5 space-y-3 text-[0.93rem] leading-relaxed text-ink-3">
            {paras.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </section>
      ))}

      <p className="mt-10 rounded-xl bg-sand p-4 text-[0.9rem] leading-relaxed text-ink-3">
        Questions about any of this? Call {contact.phone} or{" "}
        <Link href="/contact" className="text-tan-2 underline">send us a message</Link>.
      </p>
    </div>
  );
}
