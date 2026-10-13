import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight2, Award, Ruler, ShieldTick, Truck } from "iconsax-reactjs";
import { ButtonLink } from "@/components/ui/Button";
import { prisma } from "@/lib/db";
import { FOUNDER } from "@/lib/founder";
import { DEFAULT_OG_PATH, ogImageMeta } from "@/lib/og";
import { getSetting, type ContactSettings } from "@/lib/settings";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About Urbancraft",
  description:
    "Urbancraft Furniture and Interior Designing is a full-service furniture and interior company in Kansanga, Kitalanga, Kampala — furniture, doors and frames, floor decking and complete interiors.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    title: "About Urbancraft",
    description:
      "A full-service furniture and interior company in Kansanga, Kitalanga, Kampala. Design, carpentry and installation under one roof.",
    url: "/about",
    images: ogImageMeta(DEFAULT_OG_PATH, "Work installed by Urbancraft, Kampala"),
  },
};

export default async function AboutPage() {
  const [contact, shots, counts] = await Promise.all([
    getSetting<ContactSettings>("site.contact"),
    prisma.project.findMany({
      where: { isPublished: true, clientType: "Workshop" },
      orderBy: { position: "asc" }, take: 3,
    }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
  ]);

  return (
    <div className="container-page pt-12 lg:pt-20">
      <header className="max-w-3xl">
        <h1 className="text-[clamp(2.1rem,5.2vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.025em]">
          About Urbancraft
        </h1>
        <p className="mt-5 text-[1.05rem] leading-relaxed text-ink-2">
          Urbancraft Furniture and Interior Designing is a full-service furniture and interior
          company based in Kansanga &mdash; Kitalanga, Kampala.
        </p>
        <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-3">
          From design to carpentry to final installation, we handle everything under one roof,
          using quality timber and modern finishes that are made to last.
        </p>
      </header>

      {/* ------------------------------------------------- what we specialise in */}
      <section className="mt-12 lg:mt-16">
        <h2 className="text-[clamp(1.4rem,3vw,1.9rem)] font-medium tracking-[-0.02em]">
          What we specialise in
        </h2>
        <dl className="mt-7 grid gap-x-10 gap-y-8 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["All furniture", "Sofas, beds, dining, kitchen and office.", "/shop"],
            ["Doors and door frames", "Solid timber doors, hung to an even reveal.", "/design/doors"],
            ["Floor decking", "Indoor and outdoor, finished for the weather it will meet.", "/design/floor-decking"],
            ["Complete interiors", "Designed, built and installed as one job.", "/design"],
          ].map(([term, detail, href]) => (
            <div key={term}>
              <dt className="text-[0.98rem] font-medium">
                <Link href={href} className="transition hover:text-accent">{term}</Link>
              </dt>
              <dd className="mt-1.5 text-[0.88rem] leading-relaxed text-ink-3">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      {shots.length > 0 && (
        <div className="mt-12 grid grid-cols-2 gap-4 lg:mt-16 lg:grid-cols-3 lg:gap-6">
          {shots.map((s, i) => (
            <div
              key={s.id}
              className={`relative overflow-hidden rounded-[var(--radius-card)] bg-sand ${
                i === 0 ? "col-span-2 aspect-[16/10] lg:col-span-1 lg:aspect-[4/5]" : "aspect-[4/5]"
              }`}
            >
              {s.coverImage && (
                <Image src={s.coverImage} alt="" fill sizes="(min-width:1024px) 32vw, 45vw"
                       className="object-cover" priority={i === 0} />
              )}
            </div>
          ))}
        </div>
      )}

      <section className="mt-16 border-t border-line pt-12 lg:mt-24 lg:pt-16">
        <div className="flex flex-wrap items-center gap-8">
          <Link
            href="/founder"
            className="group relative size-24 shrink-0 overflow-hidden rounded-full bg-sand"
            aria-label={`Meet ${FOUNDER.name}, ${FOUNDER.role.toLowerCase()}`}
          >
            <Image
              src={FOUNDER.photo}
              alt=""
              fill
              sizes="96px"
              placeholder="blur"
              blurDataURL={FOUNDER.blur}
              className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
          </Link>
          <div className="min-w-0">
            <p className="text-[1.05rem] leading-relaxed text-ink-2">
              Urbancraft is run by {FOUNDER.name}, who supervises every project himself.
            </p>
            <Link
              href="/founder"
              className="mt-2 inline-flex items-center gap-2 border-b border-ink pb-1 text-[0.95rem] font-medium transition hover:gap-3"
            >
              Meet the founder <ArrowRight2 size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- how we work */}
      <section className="mt-16 grid gap-10 border-t border-line pt-12 lg:mt-24 lg:grid-cols-2 lg:pt-16">
        <div className="max-w-xl space-y-4 text-[0.97rem] leading-relaxed text-ink-2">
          <h2 className="text-[clamp(1.4rem,3vw,1.9rem)] font-medium tracking-[-0.02em] text-ink">
            How we work
          </h2>
          <p>
            Almost everything we make is made to order. You choose the timber, the finish and the
            dimensions; we cut to them. That is why a piece takes one to two weeks rather than
            coming off a shelf.
          </p>
          <p>
            We are honest about grades. The same design can be built three ways, and the difference
            is the timber and the finishing &mdash; not the drawing. We publish all three prices so
            you can pick the one that fits your budget, instead of being sold the cheapest build at
            the best price.
          </p>
          <p>
            When it is done we deliver and install it ourselves. If a joint moves or a finish fails
            inside the warranty, we come and fix it.
          </p>
        </div>

        <div className="space-y-3">
          {[
            [Award, "Three quality classes", "Economy, Standard and Top class — priced openly, not negotiated in the room."],
            [Ruler, "Built to your measurements", "Send the dimensions of the space. We cut the piece to fit it."],
            [ShieldTick, "Warranty in writing", "Six months on joinery and finish, whatever class it is built in."],
            [Truck, "We deliver and install", "Free within Kampala Central, quoted honestly beyond it."],
          ].map(([Icon, title, body]) => {
            const I = Icon as typeof Award;
            return (
              <div key={title as string} className="flex gap-4 rounded-[var(--radius-card)] border border-line bg-paper p-5">
                <I size={22} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <h3 className="font-medium">{title as string}</h3>
                  <p className="mt-1 text-[0.87rem] leading-relaxed text-ink-3">{body as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------------------- foot */}
      <section className="mt-16 rounded-[var(--radius-card)] bg-ink px-6 py-12 text-white lg:mt-24 sm:px-10">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            [`${counts}`, "pieces in the catalogue"],
            ["1–2 weeks", "typical build time"],
            ["6 months", "warranty on every piece"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="figure-num text-3xl font-medium">{value}</p>
              <p className="mt-1 text-[0.85rem] text-white/55">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-9 max-w-xl text-[0.95rem] leading-relaxed text-white/70">
          Find us at {contact.address}. We work by appointment &mdash; call before you set off so we
          can give you proper time.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/design/enquire" variant="tan" size="lg">Book a site survey</ButtonLink>
          <Link
            href="/projects"
            className="inline-flex h-12 items-center rounded-[var(--radius-card)] border border-white/25 px-6 font-medium transition hover:bg-white/10"
          >
            See our work
          </Link>
        </div>
      </section>
    </div>
  );
}
