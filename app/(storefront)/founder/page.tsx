import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight2, Whatsapp, Call } from "iconsax-reactjs";

import { FOUNDER } from "@/lib/founder";
import { ogImageMeta } from "@/lib/og";
import { getSetting, type ContactSettings } from "@/lib/settings";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${FOUNDER.name} — ${FOUNDER.role}`,
  description:
    `${FOUNDER.name} founded Urbancraft Furniture and Interior Designing in Kansanga, Kitalanga, Kampala, and supervises every project in the workshop himself.`,
  alternates: { canonical: "/founder" },
  openGraph: {
    type: "profile",
    title: `${FOUNDER.name} — ${FOUNDER.role}, Urbancraft`,
    description:
      "Work directly with the person who builds your furniture. No middlemen, no shortcuts.",
    url: "/founder",
    images: ogImageMeta(FOUNDER.ogCard, `${FOUNDER.name}, ${FOUNDER.role} at Urbancraft`),
  },
  twitter: { card: "summary_large_image", images: [FOUNDER.ogCard] },
};

export default async function FounderPage() {
  const contact = await getSetting<ContactSettings>("site.contact");
  const whatsapp = contact.whatsapp?.replace(/\D/g, "");

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: FOUNDER.name,
    jobTitle: FOUNDER.role,
    image: absoluteUrl(FOUNDER.photo),
    url: absoluteUrl("/founder"),
    telephone: contact.phone,
    worksFor: {
      "@type": "Organization",
      name: "Urbancraft Furniture and Interior Designing",
      url: absoluteUrl("/"),
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address,
      addressLocality: "Kampala",
      addressCountry: "UG",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      <div className="container-page pt-12 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-sand">
            <Image
              src={FOUNDER.photo}
              alt={`${FOUNDER.name}, ${FOUNDER.role.toLowerCase()} at Urbancraft`}
              fill
              priority
              sizes="(min-width:1024px) 36vw, 92vw"
              placeholder="blur"
              blurDataURL={FOUNDER.blur}
              className="object-cover"
            />
          </div>

          <div className="lg:pt-6">
            <h1 className="text-[clamp(2rem,4.6vw,3.2rem)] font-medium leading-[1.05] tracking-[-0.025em]">
              {FOUNDER.name}
            </h1>
            <p className="label-xs mt-3 text-muted">{FOUNDER.role}</p>

            <div className="mt-7 max-w-[58ch] space-y-4 text-[1.02rem] leading-relaxed text-ink-2">
              {FOUNDER.story.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2.5 rounded-[var(--radius-card)] bg-accent px-7 text-[0.92rem] font-medium text-white transition hover:bg-accent-2"
                >
                  <Whatsapp size={19} />
                  Chat with David on WhatsApp
                </a>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-card)] border border-rule px-7 text-[0.92rem] font-medium transition hover:border-ink"
                >
                  <Call size={17} /> {contact.phone}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------- next steps */}
        <section className="mt-16 grid gap-4 border-t border-line pt-12 sm:grid-cols-3 lg:mt-24 lg:pt-16">
          {[
            ["See the work", "Rooms measured, built and fitted by the workshop.", "/projects"],
            ["About Urbancraft", "The company, the trades and how a job runs.", "/about"],
            ["Start a project", "Send the room and we will come and measure it.", "/design/enquire"],
          ].map(([title, body, href]) => (
            <Link
              key={href}
              href={href}
              className="group rounded-[var(--radius-card)] border border-line p-6 transition hover:border-ink"
            >
              <h2 className="flex items-center justify-between gap-3 text-[1rem] font-medium">
                {title}
                <ArrowRight2 size={15} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
              </h2>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-3">{body}</p>
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
