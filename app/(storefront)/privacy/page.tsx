import type { Metadata } from "next";
import { getSetting, type ContactSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What UrbanCraft collects when you order, why, and how to have it removed.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const contact = await getSetting<ContactSettings>("site.contact");

  const sections: [string, string[]][] = [
    ["What we collect", [
      "When you place an order we collect your name, phone number, delivery address, an optional email address, and any note you add to the order.",
      "If you pay by mobile money we also store the number the payment came from and the reference our payment provider returns. We never see or store your mobile money PIN.",
      "We do not collect card details. Payments are handled by Yo! Uganda Limited.",
    ]],
    ["Why we hold it", [
      "To build, deliver and support your order, and to reach you if there is a problem with it.",
      "To honour warranty claims, which means we keep order records for the length of the warranty.",
      "To meet Ugandan tax and record-keeping obligations.",
    ]],
    ["Who we share it with", [
      "Our payment provider, Yo! Uganda Limited, receives the amount and the paying phone number in order to process the transaction.",
      "Our delivery team receives your name, phone number and address so they can find you.",
      "We do not sell your details, and we do not pass them to advertisers.",
    ]],
    ["How long we keep it", [
      "Order records are kept for the life of the warranty plus the period Ugandan law requires. Enquiries that do not become orders are deleted once they are closed.",
    ]],
    ["Your choices", [
      "You can ask us what we hold about you, ask us to correct it, or ask us to delete anything we are not legally required to keep.",
      `Call ${contact.phone} or email ${contact.email} and we will action it.`,
    ]],
    ["Cookies", [
      "This site stores your shopping cart in your own browser so it survives a page reload. That data never leaves your device until you place an order. We do not run advertising trackers.",
    ]],
  ];

  return (
    <div className="container-page max-w-3xl pt-8">
      <h1 className="text-3xl font-semibold sm:text-4xl">Privacy policy</h1>
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
    </div>
  );
}
