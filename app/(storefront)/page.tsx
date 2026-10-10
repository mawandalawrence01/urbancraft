import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight2 } from "iconsax-reactjs";

import { ProductCard } from "@/components/product/ProductCard";
import { prisma } from "@/lib/db";
import {
  getCategoryTree, getFeaturedProducts, getNewestProducts, getRoomCovers,
} from "@/lib/catalog";
import { getDesignHighlights, getPublishedServices } from "@/lib/design";
import { getSetting, type ContactSettings } from "@/lib/settings";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** The four stages of a fit-out. Numbered because the sequence is the product. */
const STAGES = [
  ["We measure", "On site, free, anywhere in Kampala. We take the dimensions ourselves."],
  ["We draw", "A layout and an itemised price before any timber is bought."],
  ["We build", "In our own workshop. Nothing is subcontracted, so the finish matches."],
  ["We fit", "Scribed and finished on site, and we clear up after ourselves."],
] as const;

export default async function HomePage() {
  const [tree, featured, newest, projects, design, fitout, contact, total] = await Promise.all([
    getCategoryTree(),
    getFeaturedProducts(8),
    getNewestProducts(8),
    prisma.project.findMany({
      where: { isPublished: true }, orderBy: { position: "asc" }, take: 3,
    }),
    getDesignHighlights(6),
    getPublishedServices("FITOUT"),
    getSetting<ContactSettings>("site.contact"),
    prisma.product.count({ where: { status: "ACTIVE" } }),
  ]);

  const rooms = tree.slice(0, 10);
  const covers = await getRoomCovers(rooms.map((r) => r.slug));
  const designCount = fitout.reduce((n, s) => n + s._count.images, 0);

  // Only the design library carries a provenance gate (an admin marked each
  // image OWN_WORK). heroRank ranks composition, not ownership, and several
  // hero-ranked products are supplier catalogue renders — so the catalogue
  // speaks in the product grids below, never in a slot that says "our work".
  const lead = design[0];
  const firstRoom = rooms[0]?.slug;

  return (
    <>
      {/* ===================================================== the two paths */}
      <section className="container-page pt-12 lg:pt-20">
        <h1 className="max-w-[22ch] text-[clamp(2.1rem,5.2vw,3.9rem)] font-medium leading-[1.04] tracking-[-0.025em]">
          We build the piece, and we build the room.
        </h1>
        <p className="mt-5 max-w-[56ch] text-[1.02rem] leading-relaxed text-ink-2">
          A workshop in Kawempe, Kampala. Buy a finished piece from the catalogue, or have us
          measure, draw, build and fit an entire space.
        </p>
      </section>

      {/* Two doors of equal size. Neither outranks the other. */}
      <section className="container-page mt-10 grid gap-5 lg:mt-14 lg:grid-cols-2 lg:gap-6">
        <PathCard
          href="/shop"
          title="Furniture"
          body="Sofas, beds, dining sets, wardrobes and office pieces — delivered and installed across Kampala."
          figure={`${total}`}
          figureLabel="pieces in the catalogue"
          action="Browse the catalogue"
          image={firstRoom ? covers[firstRoom]?.url : undefined}
          blur={firstRoom ? covers[firstRoom]?.blurDataUrl : undefined}
          priority
        />
        <PathCard
          href="/design"
          title="Interiors"
          body="Kitchens, wardrobes, staircases, ceilings and feature walls, measured in your own space."
          figure={designCount > 0 ? `${designCount}` : "14"}
          figureLabel={designCount > 0 ? "photographs of our work" : "trades we fit"}
          action="Book a site survey"
          image={lead?.cover.url}
          blur={lead?.cover.blurDataUrl}
          accent
        />
      </section>

      {/* ========================================================= the terms */}
      <section className="container-page mt-16 lg:mt-24">
        <dl className="grid gap-x-10 gap-y-8 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Built to your dimensions", "Send the measurements. We cut to them."],
            ["Three quality classes", "Economy, Standard and Top Class, priced openly."],
            ["Up to 5 years warranty", "On joinery and finish, in writing."],
            ["Delivered and installed", "Free within Kampala Central."],
          ].map(([term, detail]) => (
            <div key={term}>
              <dt className="text-[0.95rem] font-medium">{term}</dt>
              <dd className="mt-1.5 text-[0.88rem] leading-relaxed text-ink-3">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ============================================================ rooms */}
      <section className="mt-20 lg:mt-28">
        <div className="container-page mb-7 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[clamp(1.45rem,3vw,2rem)] font-medium tracking-[-0.02em]">
            Shop by room
          </h2>
          <Link href="/shop" className="group flex items-center gap-1.5 text-[0.9rem] text-ink-2 transition hover:text-ink">
            All {total} pieces
            <ArrowRight2 size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="snap-rail container-page gap-4 pb-2 lg:grid lg:grid-cols-5 lg:gap-6 lg:overflow-visible">
          {rooms.map((room) => (
            <Link
              key={room.slug}
              href={`/c/${room.slug}`}
              className="group w-[46%] min-w-[10rem] sm:w-[31%] lg:w-auto"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-sand">
                {covers[room.slug] ? (
                  <Image
                    src={covers[room.slug].url} alt="" fill
                    sizes="(min-width:1024px) 18vw, 45vw"
                    placeholder={covers[room.slug].blurDataUrl ? "blur" : "empty"}
                    blurDataURL={covers[room.slug].blurDataUrl ?? undefined}
                    className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="label-xs grid size-full place-items-center text-muted">
                    No photograph
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-2">
                <span className="text-[0.92rem] font-medium">{room.name}</span>
                <span className="figure-num text-[0.78rem] text-muted">
                  {room._count.productLinks}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="container-page mt-20 lg:mt-28">
          <h2 className="mb-7 text-[clamp(1.45rem,3vw,2rem)] font-medium tracking-[-0.02em]">
            The ones we repeat most
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ========================================================= interiors */}
      <section className="mt-20 bg-sand py-16 lg:mt-28 lg:py-24">
        <div className="container-page">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-[46ch]">
              <h2 className="text-[clamp(1.6rem,3.4vw,2.4rem)] font-medium leading-[1.1] tracking-[-0.02em]">
                We also build the room itself
              </h2>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-2">
                Measured in your space, made in our workshop and fitted by the people who made
                them. The survey and the drawing cost nothing.
              </p>
            </div>
            <Link href="/design" className="group flex items-center gap-1.5 text-[0.9rem] text-ink-2 transition hover:text-ink">
              All trades
              <ArrowRight2 size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {design.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-5">
              {design.map((service) => (
                <Link key={service.slug} href={`/design/${service.slug}`} className="group">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-sand-2">
                    <Image
                      src={service.cover.url} alt="" fill
                      sizes="(min-width:1024px) 16vw, 45vw"
                      placeholder={service.cover.blurDataUrl ? "blur" : "empty"}
                      blurDataURL={service.cover.blurDataUrl ?? undefined}
                      className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                    />
                  </div>
                  <p className="mt-2.5 text-[0.88rem] font-medium leading-snug">{service.name}</p>
                  <p className="figure-num text-[0.76rem] text-muted">{service.count} photos</p>
                </Link>
              ))}
            </div>
          )}

          {/* The one place numbers belong: the sequence is the information. */}
          <ol className="mt-14 grid gap-x-10 gap-y-8 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {STAGES.map(([title, body], i) => (
              <li key={title}>
                <span className="figure-num text-[0.78rem] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-[1rem] font-medium">{title}</h3>
                <p className="mt-1.5 text-[0.88rem] leading-relaxed text-ink-3">{body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/design/enquire"
              className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-card)] bg-accent px-7 text-[0.92rem] font-medium text-white transition hover:bg-accent-2"
            >
              Book a site survey <ArrowRight2 size={15} />
            </Link>
            <Link
              href="/projects"
              className="inline-flex h-12 items-center rounded-[var(--radius-card)] border border-rule px-7 text-[0.92rem] font-medium transition hover:border-ink"
            >
              See installed work
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================== quality classes */}
      <section className="container-page mt-20 lg:mt-28">
        <h2 className="max-w-[24ch] text-[clamp(1.45rem,3vw,2rem)] font-medium leading-[1.12] tracking-[-0.02em]">
          The same design, in three quality classes
        </h2>
        <p className="mt-3 max-w-[58ch] text-[0.98rem] leading-relaxed text-ink-2">
          Timber and finishing decide what a piece costs and how long it lasts. All three are
          published, so you choose the class instead of negotiating the price.
        </p>

        <table className="mt-8 w-full text-left">
          <caption className="sr-only">Quality classes, their timbers and warranties</caption>
          <thead>
            <tr className="label-xs border-b border-line text-muted">
              <th scope="col" className="py-3 pr-4">Class</th>
              <th scope="col" className="py-3 pr-4">Timber &amp; finish</th>
              <th scope="col" className="py-3 text-right">Warranty</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Economy", "Affordable construction, hand-applied finishing. Light or short-term use.", "None"],
              ["Standard", "Musambya, muvule and comparable hardwoods. Our default joinery and finish.", "2 years"],
              ["Top Class", "Mahogany, Elgon teak or mugavu, machine-sprayed for an imported finish.", "5 years"],
            ].map(([name, body, warranty]) => (
              <tr key={name} className="border-b border-line">
                <th scope="row" className="py-5 pr-4 align-top text-[0.98rem] font-medium">
                  {name}
                </th>
                <td className="max-w-prose py-5 pr-4 align-top text-[0.9rem] leading-relaxed text-ink-3">
                  {body}
                </td>
                <td className="figure-num whitespace-nowrap py-5 text-right align-top text-[0.88rem]">
                  {warranty}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {newest.length > 0 && (
        <section className="container-page mt-20 lg:mt-28">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[clamp(1.45rem,3vw,2rem)] font-medium tracking-[-0.02em]">
              Latest from the bench
            </h2>
            <Link href="/shop?sort=newest" className="group flex items-center gap-1.5 text-[0.9rem] text-ink-2 transition hover:text-ink">
              See all
              <ArrowRight2 size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {newest.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="container-page mt-20 lg:mt-28">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[clamp(1.45rem,3vw,2rem)] font-medium tracking-[-0.02em]">
              Rooms we have fitted
            </h2>
            <Link href="/projects" className="group flex items-center gap-1.5 text-[0.9rem] text-ink-2 transition hover:text-ink">
              All projects
              <ArrowRight2 size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-3 lg:gap-6">
            {projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.slug}`} className="group">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-sand">
                  {p.coverImage && (
                    <Image
                      src={p.coverImage} alt="" fill
                      sizes="(min-width:640px) 31vw, 92vw"
                      className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                    />
                  )}
                </div>
                <p className="mt-3 text-[0.95rem] font-medium">{p.title}</p>
                {p.summary && (
                  <p className="mt-1 line-clamp-2 text-[0.86rem] leading-relaxed text-ink-3">
                    {p.summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================= foot */}
      <section className="container-page mt-20 lg:mt-28">
        <div className="border-t border-line py-16 text-center lg:py-20">
          <h2 className="mx-auto max-w-[22ch] text-[clamp(1.6rem,3.6vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.02em]">
            Tell us what you need built
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-[0.98rem] leading-relaxed text-ink-2">
            A photo, a sketch or just the measurements is enough to start. For a whole room, the
            survey and the drawing cost nothing.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/design/enquire"
              className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-card)] bg-ink px-7 text-[0.92rem] font-medium text-white transition hover:bg-ink-2"
            >
              Brief a fit-out <ArrowRight2 size={15} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center rounded-[var(--radius-card)] border border-rule px-7 text-[0.92rem] font-medium transition hover:border-ink"
            >
              Commission a piece
            </Link>
          </div>
          {contact?.phone && (
            <a
              href={`tel:${contact.phone.replace(/\s/g, "")}`}
              className="mt-8 inline-block text-[1.05rem] text-ink-2 transition hover:text-ink"
            >
              or call {contact.phone}
            </a>
          )}
        </div>
      </section>
    </>
  );
}

/**
 * One of the two doors. Same size, same shape, same weight — the only
 * difference is which action is tinted, because only one of them is free.
 */
function PathCard({
  href, title, body, figure, figureLabel, action, image, blur, accent = false, priority = false,
}: {
  href: string;
  title: string;
  body: string;
  figure: string;
  figureLabel: string;
  action: string;
  image?: string;
  blur?: string | null;
  accent?: boolean;
  priority?: boolean;
}) {
  return (
    <Link href={href} className="group flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] bg-sand lg:aspect-[4/3]">
        {image && (
          <Image
            src={image}
            alt=""
            fill
            priority={priority}
            sizes="(min-width:1024px) 46vw, 92vw"
            placeholder={blur ? "blur" : "empty"}
            blurDataURL={blur ?? undefined}
            className="animate-settle object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
          />
        )}
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-[1.5rem] font-medium tracking-[-0.02em]">{title}</h2>
          <p className="shrink-0 text-right">
            <span className="figure-num text-[1.05rem] font-medium">{figure}</span>
            <span className="ml-1.5 text-[0.8rem] text-muted">{figureLabel}</span>
          </p>
        </div>

        <p className="mt-2.5 max-w-[48ch] text-[0.94rem] leading-relaxed text-ink-2">{body}</p>

        <span
          className={
            accent
              ? "mt-5 inline-flex w-fit items-center gap-2 border-b border-accent pb-1 text-[0.92rem] font-medium text-accent transition group-hover:gap-3"
              : "mt-5 inline-flex w-fit items-center gap-2 border-b border-ink pb-1 text-[0.92rem] font-medium transition group-hover:gap-3"
          }
        >
          {action} <ArrowRight2 size={14} />
        </span>
      </div>
    </Link>
  );
}
