import Link from "next/link";
import { Call, Sms, Location, Whatsapp, Clock } from "iconsax-reactjs";
import { Logo } from "@/components/brand/Logo";
import type { ContactSettings } from "@/lib/settings";

export function Footer({
  contact,
  categories,
}: {
  contact: ContactSettings;
  categories: { slug: string; name: string }[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-line bg-ink text-cream/80">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo className="text-cream" showTagline />
          <p className="mt-4 max-w-xs text-[0.88rem] leading-relaxed text-cream/60">
            A furniture workshop in Kampala. We cut, joint and finish every piece by hand,
            then deliver and install it ourselves.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-[0.8rem] uppercase tracking-[0.16em] text-cream/45">Shop</h3>
          <ul className="space-y-2 text-[0.88rem]">
            <li><Link href="/shop" className="transition hover:text-tan">All furniture</Link></li>
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/c/${c.slug}`} className="transition hover:text-tan">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-[0.8rem] uppercase tracking-[0.16em] text-cream/45">Workshop</h3>
          <ul className="space-y-2 text-[0.88rem]">
            {[
              ["/projects", "Our work"],
              ["/about", "About us"],
              ["/orders/track", "Track an order"],
              ["/delivery", "Delivery & returns"],
              ["/contact", "Contact"],
            ].map(([href, label]) => (
              <li key={href}><Link href={href} className="transition hover:text-tan">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-[0.8rem] uppercase tracking-[0.16em] text-cream/45">Reach us</h3>
          <ul className="space-y-3 text-[0.88rem]">
            <li>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 transition hover:text-tan">
                <Call size={17} className="shrink-0 text-tan" /> {contact.phone}
              </a>
            </li>
            {contact.whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2.5 transition hover:text-tan"
                >
                  <Whatsapp size={17} className="shrink-0 text-tan" /> WhatsApp
                </a>
              </li>
            )}
            <li>
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2.5 transition hover:text-tan">
                <Sms size={17} className="shrink-0 text-tan" /> {contact.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Location size={17} className="mt-0.5 shrink-0 text-tan" /> {contact.address}
            </li>
            {contact.hours?.length > 0 && (
              <li className="flex items-start gap-2.5">
                <Clock size={17} className="mt-0.5 shrink-0 text-tan" />
                <span>{contact.hours.map((h) => <span key={h} className="block">{h}</span>)}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col gap-3 py-5 text-[0.78rem] text-cream/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} UrbanCraft Furniture Workshop. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="transition hover:text-cream">Privacy</Link>
            <Link href="/terms" className="transition hover:text-cream">Terms</Link>
          </div>
        </div>
      </div>

      {/* The tab bar overlays the last strip on mobile */}
      <div className="h-16 lg:hidden" aria-hidden />
    </footer>
  );
}
