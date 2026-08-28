import type { Metadata } from "next";
import { Call, Whatsapp, Sms, Location, Clock } from "iconsax-reactjs";
import { ContactForm } from "@/components/layout/ContactForm";
import { getSetting, type ContactSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact & Commissions",
  description:
    "Talk to the UrbanCraft workshop in Kampala about a custom piece, a fit-out, or an order already in production.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const contact = await getSetting<ContactSettings>("site.contact");

  return (
    <div className="container-page pt-8">
      <header className="max-w-2xl">
        <p className="text-[0.75rem] uppercase tracking-[0.2em] text-tan-2">Contact</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Start a commission</h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-3">
          Send a photo, a sketch, or just the measurements. We will come back with a price in all
          three quality classes and a build time.
        </p>
      </header>

      <div className="mt-9 lg:flex lg:gap-12">
        <div className="min-w-0 flex-1">
          <ContactForm />
        </div>

        <aside className="mt-10 lg:mt-0 lg:w-80 lg:shrink-0">
          <div className="rounded-2xl border border-line bg-paper p-6">
            <h2 className="font-display text-base font-semibold">Reach the workshop</h2>
            <ul className="mt-4 space-y-4 text-[0.9rem]">
              <li>
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-start gap-3 hover:text-tan-2">
                  <Call size={18} className="mt-0.5 shrink-0 text-tan" />
                  <span>
                    <span className="block font-medium">{contact.phone}</span>
                    {contact.altPhone && <span className="block text-muted">{contact.altPhone}</span>}
                  </span>
                </a>
              </li>
              {contact.whatsapp && (
                <li>
                  <a
                    href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-start gap-3 hover:text-tan-2"
                  >
                    <Whatsapp size={18} className="mt-0.5 shrink-0 text-tan" />
                    <span className="font-medium">Message us on WhatsApp</span>
                  </a>
                </li>
              )}
              <li>
                <a href={`mailto:${contact.email}`} className="flex items-start gap-3 hover:text-tan-2">
                  <Sms size={18} className="mt-0.5 shrink-0 text-tan" />
                  <span className="font-medium break-all">{contact.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Location size={18} className="mt-0.5 shrink-0 text-tan" />
                <span>
                  <span className="block">{contact.address}</span>
                  {contact.mapUrl && (
                    <a href={contact.mapUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-tan-2 underline">
                      Open in Maps
                    </a>
                  )}
                </span>
              </li>
              {contact.hours?.length > 0 && (
                <li className="flex items-start gap-3">
                  <Clock size={18} className="mt-0.5 shrink-0 text-tan" />
                  <span className="space-y-0.5">
                    {contact.hours.map((h) => <span key={h} className="block text-muted">{h}</span>)}
                  </span>
                </li>
              )}
            </ul>
            <p className="mt-5 rounded-xl bg-sand p-3 text-[0.82rem] leading-relaxed text-ink-3">
              We work by appointment. Please call before setting off so we can give you proper time.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
