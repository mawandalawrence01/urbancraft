import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight2, Ruler, Routing2, Designtools, TickCircle } from "iconsax-reactjs";

import { ButtonLink } from "@/components/ui/Button";
import { getPublishedServices } from "@/lib/design";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Interior Design & Fit-Out",
  description:
    "Kitchens, wardrobes, staircases, ceilings and feature walls designed, built and installed by the UrbanCraft workshop in Kampala. We survey, draw, build and fit.",
  alternates: { canonical: "/design" },
};

const STEPS = [
  [Ruler, "We measure", "We come to the space and take the dimensions ourselves. Nothing is cut from a sketch someone else made."],
  [Routing2, "We draw", "You get a layout and an itemised price before any timber is bought — including what we would change and why."],
  [Designtools, "We build", "The work is made in our own workshop, not subcontracted, so the finish matches across every piece."],
  [TickCircle, "We install", "We fit, scribe and finish on site, then clear up after ourselves."],
] as const;

export default async function DesignPage() {
  const [fitout, styling] = await Promise.all([
    getPublishedServices("FITOUT"),
    getPublishedServices("STYLING"),
  ]);

  const withPhotos = fitout.filter((s) => s.images.length > 0);
  const hero = withPhotos[0]?.images[0];

  return (
    <>
      {/* ------------------------------------------------------------- hero */}
      <section className="container-page pt-8 lg:pt-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="animate-fade-up">
            <p className="text-[0.75rem] uppercase tracking-[0.2em] text-tan-2">
              Interior design &amp; fit-out
            </p>
            <h1 className="mt-4 text-[2.1rem] font-semibold leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
              We do not just furnish rooms. We build them in.
            </h1>
            <p className="mt-5 max-w-md text-[0.98rem] leading-relaxed text-ink-3">
              Kitchens, wardrobes, staircases, ceilings and feature walls — measured in your space,
              made in our workshop and fitted by the people who built them. One team from the first
              survey to the last coat.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/design/enquire" size="lg">
                Book a site survey <ArrowRight2 size={17} />
              </ButtonLink>
              <ButtonLink href="/shop" size="lg" variant="outline">
                Shop furniture instead
              </ButtonLink>
            </div>
          </div>

          {hero && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-sand">
              <Image
                src={hero.url}
                alt=""
                fill
                priority
                sizes="(min-width:1024px) 45vw, 100vw"
                placeholder={hero.blurDataUrl ? "blur" : "empty"}
                blurDataURL={hero.blurDataUrl ?? undefined}
                className="object-cover"
              />
            </div>
          )}
        </div>
      </section>

      {/* --------------------------------------------------------- services */}
      <section className="container-page mt-16 lg:mt-20">
        <h2 className="text-2xl font-semibold sm:text-3xl">What we fit out</h2>
        <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-ink-3">
          Each of these is built to the room rather than bought off a shelf. Most projects combine
          several.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {fitout.map((service) => {
            const cover = service.images[0];
            return (
              <Link
                key={service.id}
                href={`/design/${service.slug}`}
                className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper transition hover:border-ink"
              >
                <div className="relative aspect-[4/3] bg-sand">
                  {cover ? (
                    <Image
                      src={cover.url}
                      alt={service.name}
                      fill
                      sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw"
                      placeholder={cover.blurDataUrl ? "blur" : "empty"}
                      blurDataURL={cover.blurDataUrl ?? undefined}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid size-full place-items-center px-6 text-center text-[0.8rem] text-muted">
                      Photographs of this work are being prepared
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-[1.05rem] font-semibold">{service.name}</h3>
                  {service.tagline && (
                    <p className="mt-1 text-[0.85rem] text-tan-2">{service.tagline}</p>
                  )}
                  {service.description && (
                    <p className="mt-2 line-clamp-3 text-[0.85rem] leading-relaxed text-muted">
                      {service.description}
                    </p>
                  )}
                  {service._count.images > 0 && (
                    <p className="mt-3 flex items-center gap-1 text-[0.8rem] font-medium text-ink">
                      See {service._count.images} photo{service._count.images === 1 ? "" : "s"}
                      <ArrowRight2 size={13} />
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------ steps */}
      <section className="mt-20 bg-ink py-16 text-cream">
        <div className="container-page">
          <p className="text-[0.75rem] uppercase tracking-[0.2em] text-tan">How a fit-out runs</p>
          <h2 className="mt-3 max-w-2xl text-2xl font-semibold sm:text-3xl">
            Four stages, and you know the price before stage three
          </h2>

          <ol className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([Icon, title, body], i) => (
              <li key={title} className="rounded-2xl border border-cream/12 p-5">
                <div className="flex items-center gap-3">
                  <Icon size={22} className="text-tan" />
                  <span className="tabular text-[0.72rem] text-cream/40">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-[0.86rem] leading-relaxed text-cream/60">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------------------------------------------- styling */}
      {styling.some((s) => s.images.length > 0) && (
        <section className="container-page mt-20">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">Rooms we have furnished</h2>
              <p className="mt-1 text-[0.88rem] text-muted">
                Catalogue pieces, photographed where they ended up.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
            {styling
              .filter((s) => s.images.length > 0)
              .map((service) => (
                <Link key={service.id} href={`/design/${service.slug}`} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-sand">
                    <Image
                      src={service.images[0].url}
                      alt={service.name}
                      fill
                      sizes="(min-width:1024px) 24vw, 45vw"
                      placeholder={service.images[0].blurDataUrl ? "blur" : "empty"}
                      blurDataURL={service.images[0].blurDataUrl ?? undefined}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-2.5 text-[0.92rem] font-medium">{service.name}</h3>
                  <p className="text-[0.78rem] text-muted">
                    {service._count.images} photo{service._count.images === 1 ? "" : "s"}
                  </p>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* -------------------------------------------------------------- cta */}
      <section className="container-page mt-20">
        <div className="rounded-[var(--radius-card)] border border-line bg-sand px-6 py-12 text-center sm:px-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">Tell us about the space</h2>
          <p className="mx-auto mt-3 max-w-lg text-[0.95rem] leading-relaxed text-ink-3">
            Send the room, the rough budget and when you need it finished. We will come and measure,
            then come back with a drawing and an itemised price.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/design/enquire" size="lg">
              Start a design brief
            </ButtonLink>
            <ButtonLink href="/projects" size="lg" variant="outline">
              See installed work
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
