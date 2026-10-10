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
    <footer className="mt-20 border-t border-line bg-paper text-ink-2 lg:mt-28">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo showTagline />
          <p className="mt-4 max-w-xs text-[0.88rem] leading-relaxed text-ink-3">
            A workshop in Kansanga, Kampala. We cut, joint and finish every piece ourselves,
            then deliver it &mdash; or measure your room, draw it, build it and fit it.
          </p>
        </div>

        <div>
          <h3 className="label-xs mb-4 text-muted">Furniture</h3>
          <ul className="space-y-2 text-[0.88rem]">
            <li><Link href="/shop" className="transition hover:text-ink">All furniture</Link></li>
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/c/${c.slug}`} className="transition hover:text-ink">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="label-xs mb-4 text-muted">Interiors</h3>
          <ul className="space-y-2 text-[0.88rem]">
            {[
              ["/design", "Interior design"],
              ["/design/enquire", "Book a site survey"],
              ["/projects", "Installed work"],
              ["/about", "About the workshop"],
              ["/orders/track", "Track an order"],
              ["/delivery", "Delivery & returns"],
              ["/contact", "Contact"],
            ].map(([href, label]) => (
              <li key={href}><Link href={href} className="transition hover:text-ink">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="label-xs mb-4 text-muted">Reach us</h3>
          <ul className="space-y-3 text-[0.88rem]">
            <li>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 transition hover:text-ink">
                <Call size={17} className="shrink-0 text-muted" /> {contact.phone}
              </a>
            </li>
            {contact.whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2.5 transition hover:text-ink"
                >
                  <Whatsapp size={17} className="shrink-0 text-muted" /> WhatsApp
                </a>
              </li>
            )}
            <li>
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2.5 transition hover:text-ink">
                <Sms size={17} className="shrink-0 text-muted" /> {contact.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Location size={17} className="mt-0.5 shrink-0 text-muted" /> {contact.address}
            </li>
            {contact.hours?.length > 0 && (
              <li className="flex items-start gap-2.5">
                <Clock size={17} className="mt-0.5 shrink-0 text-muted" />
                <span>{contact.hours.map((h) => <span key={h} className="block">{h}</span>)}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-3 py-6 text-[0.82rem] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} UrbanCraft &mdash; Furniture &amp; Interiors, Kampala</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="transition hover:text-ink">Privacy</Link>
            <Link href="/terms" className="transition hover:text-ink">Terms</Link>
            <span>
              Website by{" "}
              <a
                href="https://dashlead.co.ug"
                target="_blank"
                // An outbound credit link: noopener for safety, and nofollow so
                // the site does not pass ranking signal it did not intend to.
                rel="noopener noreferrer nofollow"
                className="underline transition hover:text-ink"
              >
                Dashlead
              </a>{" "}
              <a href="tel:+256744480528" className="transition hover:text-ink">
                0744 480 528
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* The tab bar overlays the last strip on mobile */}
      <div className="h-16 lg:hidden" aria-hidden />
    </footer>
  );
}
