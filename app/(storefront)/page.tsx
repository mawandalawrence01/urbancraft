import Image from "next/image";
import Link from "next/link";
import { ArrowRight2, Ruler, ShieldTick, Truck, Award } from "iconsax-reactjs";

import { ButtonLink } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { prisma } from "@/lib/db";
import {
  getCategoryTree, getFeaturedProducts, getHeroProducts, getNewestProducts, getRoomCovers,
} from "@/lib/catalog";
import { getSetting, type HeroSettings } from "@/lib/settings";
import { formatUGX } from "@/lib/utils";

export const revalidate = 300;

export default async function HomePage() {
  const [hero, tree, heroPicks, featured, newest, projects, total] = await Promise.all([
    getSetting<HeroSettings>("site.hero"),
    getCategoryTree(),
    getHeroProducts(3),
    getFeaturedProducts(8),
    getNewestProducts(8),
    prisma.project.findMany({
      where: { isPublished: true }, orderBy: { position: "asc" }, take: 4,
    }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
  ]);

  const heroImages = heroPicks.flatMap((p) => p.images.slice(0, 1)).slice(0, 3);
  const rooms = tree.slice(0, 10);
  const covers = await getRoomCovers(rooms.map((r) => r.slug));

  return (
    <>
      {/* ------------------------------------------------------------- hero */}
      <section className="container-page pt-8 lg:pt-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="animate-fade-up">
            <p className="text-[0.75rem] uppercase tracking-[0.2em] text-tan-2">{hero.eyebrow}</p>
            <h1 className="mt-4 text-[2.1rem] font-semibold leading-[1.08] sm:text-5xl lg:text-[3.6rem]">
              {hero.title}
            </h1>
            <p className="mt-5 max-w-md text-[0.98rem] leading-relaxed text-ink-3">{hero.body}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href={hero.ctaHref} size="lg">
                {hero.ctaLabel} <ArrowRight2 size={17} />
              </ButtonLink>
              <ButtonLink href="/contact" size="lg" variant="outline">
                Commission a piece
              </ButtonLink>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-6">
              {[
                [`${total}`, "pieces in stock"],
                ["1–2 wks", "build time"],
                ["5 yrs", "top-class warranty"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="tabular font-display text-xl font-semibold">{value}</dt>
                  <dd className="mt-0.5 text-[0.78rem] leading-tight text-muted">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {heroImages.length >= 3 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] bg-sand">
                <Image
                  src={heroImages[0].url} alt={heroImages[0].alt ?? ""} fill priority
                  sizes="(min-width:1024px) 45vw, 100vw"
                  placeholder={heroImages[0].blurDataUrl ? "blur" : "empty"}
                  blurDataURL={heroImages[0].blurDataUrl ?? undefined}
                  className="object-cover"
                />
              </div>
              {heroImages.slice(1, 3).map((img) => (
                <div key={img.url} className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-sand">
                  <Image
                    src={img.url} alt={img.alt ?? ""} fill sizes="(min-width:1024px) 22vw, 45vw"
                    placeholder={img.blurDataUrl ? "blur" : "empty"}
                    blurDataURL={img.blurDataUrl ?? undefined}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --------------------------------------------------------- promises */}
      <section className="container-page mt-16">
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Ruler, "Built to your dimensions", "Send us the measurements — we cut to them."],
            [Award, "Three quality classes", "Economy, Standard and Top class, priced openly."],
            [ShieldTick, "Up to 5 years warranty", "On joinery and finish, in writing."],
            [Truck, "Delivered and installed", "Free within Kampala Central."],
          ].map(([Icon, title, body]) => {
            const I = Icon as typeof Ruler;
            return (
              <li key={title as string} className="bg-cream p-5">
                <I size={22} className="text-tan" />
                <h3 className="mt-3 text-[0.92rem] font-semibold">{title as string}</h3>
                <p className="mt-1 text-[0.83rem] leading-relaxed text-muted">{body as string}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* --------------------------------------------------------- rooms */}
      <section className="mt-20">
        <div className="container-page mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold sm:text-3xl">Shop by room</h2>
          <Link href="/shop" className="flex shrink-0 items-center gap-1 text-[0.88rem] text-tan-2 hover:underline">
            All furniture <ArrowRight2 size={15} />
          </Link>
        </div>

        <div className="snap-rail container-page gap-3 pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible">
          {rooms.map((room) => (
            <Link
              key={room.slug}
              href={`/c/${room.slug}`}
              className="group w-[44%] min-w-[9.5rem] sm:w-[30%] lg:w-auto"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-sand">
                {covers[room.slug] ? (
                  <Image
                    src={covers[room.slug].url} alt={room.name} fill
                    sizes="(min-width:1024px) 18vw, 45vw"
                    placeholder={covers[room.slug].blurDataUrl ? "blur" : "empty"}
                    blurDataURL={covers[room.slug].blurDataUrl ?? undefined}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-xs text-muted">
                    {room.name}
                  </div>
                )}
              </div>
              <p className="mt-2 text-[0.9rem] font-medium">{room.name}</p>
              <p className="text-[0.78rem] text-muted">{room._count.productLinks} pieces</p>
            </Link>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- featured */}
      {featured.length > 0 && (
        <section className="container-page mt-20">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">Bestsellers</h2>
              <p className="mt-1 text-[0.88rem] text-muted">The pieces our workshop repeats most often.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* --------------------------------------------------- quality classes */}
      <section className="mt-20 bg-ink py-16 text-cream">
        <div className="container-page">
          <p className="text-[0.75rem] uppercase tracking-[0.2em] text-tan">How we price</p>
          <h2 className="mt-3 max-w-2xl text-2xl font-semibold sm:text-3xl">
            The same design, in three quality classes
          </h2>
          <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-cream/60">
            Timber and finishing decide what a piece costs and how long it lasts. We publish all
            three so you can choose deliberately instead of guessing.
          </p>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              ["Economy", "No warranty", "Affordable construction with hand-applied finishing. Best for light or short-term use."],
              ["Standard", "2 year warranty", "Musambya, muvule and comparable hardwoods. The joinery and finish we build by default."],
              ["Top Class", "5 year warranty", "Mahogany, Elgon teak or mugavu, machine-sprayed for an imported finish."],
            ].map(([name, warranty, body], i) => (
              <div
                key={name}
                className={`rounded-2xl border p-5 ${
                  i === 1 ? "border-tan bg-tan/10" : "border-cream/12"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold">{name}</h3>
                  <span className="rounded-full bg-cream/10 px-2.5 py-1 text-[0.68rem]">{warranty}</span>
                </div>
                <p className="mt-3 text-[0.86rem] leading-relaxed text-cream/60">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- newest */}
      {newest.length > 0 && (
        <section className="container-page mt-20">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold sm:text-3xl">Latest from the workshop</h2>
            <Link href="/shop?sort=newest" className="flex shrink-0 items-center gap-1 text-[0.88rem] text-tan-2 hover:underline">
              See all <ArrowRight2 size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
            {newest.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* --------------------------------------------------------- projects */}
      {projects.length > 0 && (
        <section className="container-page mt-20">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">Work we have installed</h2>
              <p className="mt-1 text-[0.88rem] text-muted">
                Fit-outs and commissions, photographed on site.
              </p>
            </div>
            <Link href="/projects" className="flex shrink-0 items-center gap-1 text-[0.88rem] text-tan-2 hover:underline">
              Our work <ArrowRight2 size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.slug}`} className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-sand">
                  {p.coverImage && (
                    <Image
                      src={p.coverImage} alt={p.title} fill
                      sizes="(min-width:1024px) 24vw, 45vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-2 text-[0.88rem] font-medium">{p.title}</p>
                <p className="text-[0.76rem] text-muted">{p.clientType}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* --------------------------------------------------------- cta */}
      <section className="container-page mt-20">
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-sand px-6 py-12 text-center sm:px-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">Have something specific in mind?</h2>
          <p className="mx-auto mt-3 max-w-lg text-[0.95rem] leading-relaxed text-ink-3">
            Send us a photo, a sketch or just the measurements. We will quote the piece in all three
            quality classes so you can decide.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/contact" size="lg">Start a commission</ButtonLink>
            <ButtonLink href="/shop" size="lg" variant="outline">Browse the catalogue</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
