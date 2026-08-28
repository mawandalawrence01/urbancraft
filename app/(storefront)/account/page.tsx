import type { Metadata } from "next";
import Link from "next/link";
import { Receipt21, ShoppingCart, Call, Whatsapp, Shop, Setting2 } from "iconsax-reactjs";
import { getSetting, type ContactSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Your Account",
  robots: { index: false, follow: true },
};

export default async function AccountPage() {
  const contact = await getSetting<ContactSettings>("site.contact");

  const links = [
    { href: "/orders/track", Icon: Receipt21, title: "Track an order", body: "Look up an order with your order number and phone." },
    { href: "/cart", Icon: ShoppingCart, title: "Your cart", body: "Items you have saved on this device." },
    { href: "/shop", Icon: Shop, title: "Browse the catalogue", body: "243 pieces, made to order in Kampala." },
  ];

  return (
    <div className="container-page max-w-2xl pt-10">
      <h1 className="text-3xl font-semibold">Your account</h1>
      <p className="mt-2 text-[0.93rem] leading-relaxed text-ink-3">
        You do not need an account to order from us — checkout takes a name, a phone number and an
        address. Keep your order number and you can look it up any time.
      </p>

      <div className="mt-7 grid gap-px overflow-hidden rounded-2xl border border-line bg-line">
        {links.map(({ href, Icon, title, body }) => (
          <Link key={href} href={href} className="flex items-start gap-4 bg-paper p-5 transition hover:bg-sand">
            <Icon size={22} className="mt-0.5 shrink-0 text-tan" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{title}</span>
              <span className="mt-0.5 block text-[0.85rem] text-muted">{body}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-paper p-5">
        <h2 className="font-display text-base font-semibold">Need a hand?</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <a
            href={`tel:${contact.phone.replace(/\s/g, "")}`}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-[0.88rem] font-medium transition hover:border-ink"
          >
            <Call size={17} className="text-tan" /> {contact.phone}
          </a>
          {contact.whatsapp && (
            <a
              href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
              target="_blank" rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-[0.88rem] font-medium transition hover:border-ink"
            >
              <Whatsapp size={17} className="text-success" /> WhatsApp
            </a>
          )}
        </div>
      </div>

      <Link
        href="/admin"
        className="mt-8 inline-flex items-center gap-2 text-[0.83rem] text-muted transition hover:text-ink"
      >
        <Setting2 size={15} /> Workshop staff sign in
      </Link>
    </div>
  );
}
