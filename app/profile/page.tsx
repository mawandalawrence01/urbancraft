import type { Metadata } from "next";
import Image from "next/image";
import { Whatsapp, Call, Location, ArrowRight2 } from "iconsax-reactjs";

import { prisma } from "@/lib/db";
import { FOUNDER } from "@/lib/founder";
import { getSetting, type ContactSettings } from "@/lib/settings";

export const revalidate = 3600;

/** His own site, so it names itself rather than the company. */
const PROFILE_URL = "https://david.urbancraft.co.ug";
const COMPANY_URL = "https://www.urbancraft.co.ug";

export const metadata: Metadata = {
  title: "David Collins Kibirige — Furniture Maker & Interior Designer, Kampala",
  description:
    "Founder of Urbancraft Furniture & Interior Design in Kitalanga, Kansanga, Kampala. Custom furniture, TV walls and gypsum, wardrobes, kitchens and staircases — designed, built and installed.",
  alternates: { canonical: PROFILE_URL },
  openGraph: {
    type: "profile",
    title: "David Collins Kibirige — Furniture Maker & Interior Designer",
    description:
      "Custom furniture built for your space, not showroom sizes. Free site measurement in Kampala, 3D design before production.",
    url: PROFILE_URL,
    images: [{ url: `${COMPANY_URL}/og/founder.jpg`, width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: [`${COMPANY_URL}/og/founder.jpg`] },
};

const WHAT_WE_DO = [
  "Sofas, beds, dining sets and office furniture",
  "TV stands with LED and fluted wall panels",
  "Gypsum ceiling design and installation",
  "Modern wardrobes, kitchens and staircases",
  "Wooden staircases and floor decking",
  "Full interior styling",
];

const TRUST = [
  ["Free site measurement", "Anywhere in Kampala, before anything is quoted."],
  ["3D design before production", "You see the room before a board is cut."],
  ["7–14 days", "Typical turnaround from approved drawing to installed."],
  ["6 months warranty", "On joinery and finish, in writing."],
  ["50% / 50%", "Half on order, half on delivery."],
  ["Direct from the workshop", "No middlemen, no showroom mark-up."],
];

const SKILLS = [
  "Furniture design", "Interior design", "Gypsum installation", "TV unit fabrication",
  "Woodworking", "Project management", "Entrepreneurship",
];

export default async function ProfilePage() {
  const [contact, work] = await Promise.all([
    getSetting<ContactSettings>("site.contact"),
    prisma.designImage.findMany({
      where: { origin: "OWN_WORK", needsReview: false, service: { kind: "FITOUT" } },
      orderBy: [{ serviceId: "asc" }, { position: "asc" }],
      distinct: ["serviceId"],
      take: 8,
      select: {
        url: true, blurDataUrl: true, width: true, height: true,
        service: { select: { name: true } },
      },
    }),
  ]);

  const whatsapp = contact.whatsapp?.replace(/\D/g, "");
  const tel = contact.phone?.replace(/\s/g, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: FOUNDER.name,
    jobTitle: "Founder & Lead Craftsman",
    description:
      "Ugandan furniture maker, interior designer and entrepreneur; founder of Urbancraft Furniture & Interior Design, Kampala.",
    image: `${COMPANY_URL}${FOUNDER.photo}`,
    url: PROFILE_URL,
    telephone: contact.phone,
    knowsAbout: SKILLS,
    worksFor: {
      "@type": "Organization",
      name: "Urbancraft Furniture & Interior Design",
      url: COMPANY_URL,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kitalanga, Kansanga — 2nd Boda Boda Stage",
      addressLocality: "Kampala",
      addressCountry: "UG",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="min-h-dvh bg-paper">
        {/* ============================================================ hero */}
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:py-20">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-sand">
              <Image
                src={FOUNDER.photo}
                alt={`${FOUNDER.name}, founder of Urbancraft`}
                fill priority sizes="(min-width:1024px) 36vw, 92vw"
                placeholder="blur" blurDataURL={FOUNDER.blur}
                className="object-cover"
              />
            </div>

            <div className="lg:pt-4">
              <h1 className="text-[clamp(2.1rem,5vw,3.4rem)] font-medium leading-[1.04] tracking-[-0.025em]">
                {FOUNDER.name}
              </h1>
              <p className="mt-4 max-w-[46ch] text-[1.05rem] leading-relaxed text-ink-2">
                Founder &amp; Lead Craftsman at Urbancraft Furniture &amp; Interior Design.
                Custom furniture, TV walls and gypsum, wardrobes and kitchens.
              </p>

              <p className="mt-5 flex items-start gap-2.5 text-[0.95rem] leading-relaxed text-ink-3">
                <Location size={18} className="mt-0.5 shrink-0 text-muted" />
                Kitalanga, Kansanga — 2nd Boda Boda Stage, Kampala
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex h-12 items-center gap-2.5 rounded-[var(--radius-card)] bg-accent px-7 text-[0.92rem] font-medium text-white transition hover:bg-accent-2"
                  >
                    <Whatsapp size={19} /> WhatsApp me
                  </a>
                )}
                {tel && (
                  <a
                    href={`tel:${tel}`}
                    className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-card)] border border-rule px-7 text-[0.92rem] font-medium transition hover:border-ink"
                  >
                    <Call size={17} /> {contact.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================== story */}
        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div className="max-w-[62ch] space-y-5 text-[1.02rem] leading-relaxed text-ink-2">
              <p>
                I am a Ugandan furniture maker, interior designer and entrepreneur, and the founder
                of Urbancraft Furniture &amp; Interior Design — a Kampala workshop specialising in
                modern custom furniture and interior solutions.
              </p>
              <p>
                We help homeowners, offices, schools and hotels get furniture built exactly for
                their space, not to showroom sizes. My team handles the whole job: 3D design,
                production, delivery and installation.
              </p>
              <p>
                I lead a skilled, uniformed team and supervise every project from measurement to
                finishing. Urbancraft also supplies branded workwear — overalls, t-shirts and
                reflector jackets.
              </p>
              <p className="border-l-2 border-accent pl-5 text-ink">
                My goal is to make Urbancraft Uganda&apos;s most trusted furniture brand, and to
                craft durable, modern furniture that tells your story. Built to last.
              </p>
            </div>

            <div>
              <h2 className="label-xs text-muted">What we build</h2>
              <ul className="mt-4 space-y-2.5 border-t border-line pt-4 text-[0.95rem] text-ink-2">
                {WHAT_WE_DO.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ============================================================ work */}
        {work.length > 0 && (
          <section className="border-y border-line bg-sand py-14 lg:py-20">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
              <h2 className="text-[clamp(1.5rem,3.2vw,2.1rem)] font-medium tracking-[-0.02em]">
                Recent work
              </h2>
              <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
                {work.map((img) => (
                  <figure key={img.url}>
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-sand-2">
                      <Image
                        src={img.url} alt={img.service.name} fill
                        sizes="(min-width:1024px) 23vw, 45vw"
                        placeholder={img.blurDataUrl ? "blur" : "empty"}
                        blurDataURL={img.blurDataUrl ?? undefined}
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="mt-2.5 text-[0.84rem] text-ink-3">
                      {img.service.name}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =========================================================== trust */}
        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
          <h2 className="text-[clamp(1.5rem,3.2vw,2.1rem)] font-medium tracking-[-0.02em]">
            Why clients trust us
          </h2>
          <dl className="mt-8 grid gap-x-10 gap-y-8 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-3">
            {TRUST.map(([term, detail]) => (
              <div key={term}>
                <dt className="text-[0.98rem] font-medium">{term}</dt>
                <dd className="mt-1.5 text-[0.89rem] leading-relaxed text-ink-3">{detail}</dd>
              </div>
            ))}
          </dl>

          <h2 className="label-xs mt-14 text-muted">Skills</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {SKILLS.map((s) => (
              <li
                key={s}
                className="rounded-[var(--radius-card)] border border-line px-3.5 py-2 text-[0.86rem] text-ink-2"
              >
                {s}
              </li>
            ))}
          </ul>
        </section>

        {/* ============================================================ foot */}
        <section className="border-t border-line bg-ink py-14 text-white lg:py-20">
          <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
            <h2 className="mx-auto max-w-[20ch] text-[clamp(1.6rem,3.6vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.02em]">
              Let&apos;s build your dream space
            </h2>
            <p className="mx-auto mt-4 max-w-[48ch] text-[0.98rem] leading-relaxed text-white/70">
              Send me the room and I will come and measure it myself. The site visit and the
              drawing cost nothing.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2.5 rounded-[var(--radius-card)] bg-accent px-7 text-[0.92rem] font-medium text-white transition hover:bg-accent-2"
                >
                  <Whatsapp size={19} /> {contact.phone}
                </a>
              )}
              <a
                href={COMPANY_URL}
                className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-card)] border border-white/25 px-7 text-[0.92rem] font-medium transition hover:bg-white/10"
              >
                Visit Urbancraft <ArrowRight2 size={15} />
              </a>
            </div>
            <p className="mt-10 text-[0.82rem] text-white/45">
              Urbancraft Furniture &amp; Interior Design · Kitalanga, Kansanga, Kampala
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
