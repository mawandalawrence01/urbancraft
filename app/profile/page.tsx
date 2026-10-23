import type { Metadata } from "next";
import Image from "next/image";
import { Whatsapp, Call, ArrowRight2 } from "iconsax-reactjs";

import { FOUNDER } from "@/lib/founder";
import { getSetting, type ContactSettings } from "@/lib/settings";

export const revalidate = 3600;

const PROFILE_URL = "https://david.urbancraft.co.ug";
const COMPANY_URL = "https://www.urbancraft.co.ug";

export const metadata: Metadata = {
  // Absolute, so the storefront's "%s · UrbanCraft" template does not append
  // the company name to his own site's title.
  title: { absolute: "David Collins Kibirige — Furniture Maker & Interior Designer, Kampala" },
  description:
    "David Collins Kibirige is a Ugandan furniture maker, interior designer and entrepreneur, and the founder of Urbancraft Furniture & Interior Design in Kitalanga, Kansanga, Kampala.",
  keywords: [
    "David Collins Kibirige",
    "Urbancraft Furniture & Interior Design",
    "furniture maker Kampala",
    "interior designer Kampala",
    "custom furniture Uganda",
  ],
  alternates: { canonical: PROFILE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "profile",
    title: "David Collins Kibirige — Urbancraft, Kampala",
    description: "Furniture maker and interior designer in Kampala.",
    url: PROFILE_URL,
    images: [{ url: `${COMPANY_URL}/og/founder.jpg`, width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: [`${COMPANY_URL}/og/founder.jpg`] },
};

export default async function ProfilePage() {
  const contact = await getSetting<ContactSettings>("site.contact");
  const whatsapp = contact.whatsapp?.replace(/\D/g, "");
  const tel = contact.phone?.replace(/\s/g, "");

  const address = {
    "@type": "PostalAddress",
    streetAddress: "Kitalanga, Kansanga — Second Boda Boda Stage",
    addressLocality: "Kampala",
    addressCountry: "UG",
  };

  // Two linked nodes rather than one: Google will show a person and the
  // business they founded, and founder/foundedBy has to point both ways for
  // it to connect them.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${PROFILE_URL}/#person`,
        name: FOUNDER.name,
        givenName: "David",
        familyName: "Kibirige",
        jobTitle: ["Furniture maker", "Interior designer", "Founder"],
        description:
          "Ugandan furniture maker, interior designer and entrepreneur, and the founder of Urbancraft Furniture & Interior Design, a Kampala workshop specialising in modern custom furniture and interior solutions.",
        image: `${COMPANY_URL}${FOUNDER.photo}`,
        url: PROFILE_URL,
        telephone: contact.phone,
        nationality: { "@type": "Country", name: "Uganda" },
        knowsAbout: [
          "Custom furniture",
          "Interior design",
          "3D design",
          "TV and feature walls",
          "Gypsum ceilings",
          "Fitted wardrobes",
          "Wooden staircases",
          "Fitted kitchens",
        ],
        address,
        worksFor: { "@id": `${COMPANY_URL}/#organisation` },
        founder: { "@id": `${COMPANY_URL}/#organisation` },
      },
      {
        "@type": "LocalBusiness",
        "@id": `${COMPANY_URL}/#organisation`,
        name: "Urbancraft Furniture & Interior Design",
        url: COMPANY_URL,
        telephone: contact.phone,
        image: `${COMPANY_URL}${FOUNDER.ogCard}`,
        description:
          "Kampala-based workshop making modern custom furniture and fitting out interiors — kitchens, wardrobes, staircases, ceilings and feature walls.",
        address,
        areaServed: { "@type": "City", name: "Kampala" },
        foundedBy: { "@id": `${PROFILE_URL}/#person` },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="min-h-dvh bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:py-24">
          <div className="relative aspect-square w-40 overflow-hidden rounded-full bg-sand sm:w-60">
            <Image
              src={FOUNDER.photo}
              alt={FOUNDER.name}
              fill
              priority
              // Must track the rendered width above, or next/image keeps
              // serving the old 144px crop into a 240px circle.
              sizes="(min-width: 640px) 240px, 160px"
              placeholder="blur"
              blurDataURL={FOUNDER.blur}
              className="object-cover object-top"
            />
          </div>

          <h1 className="mt-8 text-[clamp(1.8rem,4vw,2.6rem)] font-medium leading-[1.1] tracking-[-0.02em]">
            {FOUNDER.name}
          </h1>

          {/* His own approved bio. Emphasis comes from the copy itself, so the
              runs are modelled rather than parsed out of markdown. */}
          <div className="mt-10 max-w-[62ch] space-y-5 text-[1.02rem] leading-relaxed text-ink-2">
            {FOUNDER.bio.map((para) => (
              <p key={para[0].text.slice(0, 32)}>
                {para.map((run) =>
                  run.strong ? (
                    <strong key={run.text} className="font-medium text-ink">
                      {run.text}
                    </strong>
                  ) : (
                    <span key={run.text}>{run.text}</span>
                  ),
                )}
              </p>
            ))}
          </div>

          <p className="mt-7 max-w-[62ch] border-l-2 border-accent pl-4 text-[1.02rem] leading-relaxed text-ink-2">
            <strong className="font-medium text-ink">Mission:</strong> {FOUNDER.mission}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2.5 rounded-[var(--radius-card)] bg-accent px-6 text-[0.92rem] font-medium text-white transition hover:bg-accent-2"
              >
                <Whatsapp size={19} /> WhatsApp
              </a>
            )}
            {tel && (
              <a
                href={`tel:${tel}`}
                className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-card)] border border-rule px-6 text-[0.92rem] font-medium transition hover:border-ink"
              >
                <Call size={17} /> {contact.phone}
              </a>
            )}
          </div>

          <div className="mt-14 border-t border-line pt-8 text-[0.95rem] leading-relaxed text-ink-3">
            <p>Kitalanga, Kansanga — 2nd Boda Boda Stage, Kampala</p>
            <a
              href={COMPANY_URL}
              className="mt-3 inline-flex items-center gap-2 text-ink transition hover:gap-3"
            >
              urbancraft.co.ug <ArrowRight2 size={15} />
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
