import type { Metadata } from "next";
import Image from "next/image";
import { Whatsapp, Call, ArrowRight2 } from "iconsax-reactjs";

import { FOUNDER } from "@/lib/founder";
import { getSetting, type ContactSettings } from "@/lib/settings";

export const revalidate = 3600;

const PROFILE_URL = "https://david.urbancraft.co.ug";
const COMPANY_URL = "https://www.urbancraft.co.ug";

export const metadata: Metadata = {
  title: "David Collins Kibirige — Urbancraft, Kampala",
  description:
    "Furniture maker and interior designer in Kampala. Founder of Urbancraft Furniture & Interior Design, Kitalanga, Kansanga.",
  alternates: { canonical: PROFILE_URL },
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: FOUNDER.name,
    jobTitle: "Founder",
    image: `${COMPANY_URL}${FOUNDER.photo}`,
    url: PROFILE_URL,
    telephone: contact.phone,
    worksFor: {
      "@type": "Organization",
      name: "Urbancraft Furniture & Interior Design",
      url: COMPANY_URL,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kitalanga, Kansanga",
      addressLocality: "Kampala",
      addressCountry: "UG",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="min-h-dvh bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:py-24">
          <div className="relative aspect-square w-32 overflow-hidden rounded-full bg-sand sm:w-36">
            <Image
              src={FOUNDER.photo}
              alt={FOUNDER.name}
              fill
              priority
              sizes="144px"
              placeholder="blur"
              blurDataURL={FOUNDER.blur}
              className="object-cover object-top"
            />
          </div>

          <h1 className="mt-8 text-[clamp(1.8rem,4vw,2.6rem)] font-medium leading-[1.1] tracking-[-0.02em]">
            {FOUNDER.name}
          </h1>
          <p className="mt-2 text-[1.02rem] text-ink-3">
            Furniture maker and interior designer, Kampala
          </p>

          {/* Plain facts, in his own voice, with nothing to sell. */}
          <div className="mt-10 max-w-[60ch] space-y-5 text-[1.02rem] leading-relaxed text-ink-2">
            {FOUNDER.story.map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </div>

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
