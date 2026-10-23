import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight2 } from "iconsax-reactjs";

import { getPublishedServices } from "@/lib/design";
import { DEFAULT_OG_PATH, ogImageMeta } from "@/lib/og";
import { getSetting, type ContactSettings } from "@/lib/settings";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Interior Design & Fit-Out",
  description:
    "Kitchens, wardrobes, staircases, ceilings and feature walls designed, built and installed by the UrbanCraft workshop in Kampala. We survey, draw, build and fit.",
  alternates: { canonical: "/design" },
  openGraph: {
    type: "website",
    title: "Interior Design & Fit-Out — UrbanCraft Kampala",
    description:
      "Kitchens, wardrobes, staircases, ceilings and feature walls, measured in your space and fitted by the workshop that built them.",
    url: "/design",
    images: ogImageMeta(DEFAULT_OG_PATH, "A fitted kitchen built and installed by UrbanCraft, Kampala"),
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_PATH] },
};

/** Numbered because the sequence is the product: each stage gates the next. */
const STAGES = [
  ["We measure", "We come to the space and take the dimensions ourselves. Nothing is cut from a sketch someone else made."],
  ["We draw", "A layout and an itemised price before any timber is bought — including what we would change, and why."],
  ["We build", "In our own workshop, not subcontracted, so the finish matches across every piece."],
  ["We fit", "Fitted, scribed and finished on site. Then we clear up after ourselves."],
] as const;

export default async function DesignPage() {
  const [fitout, styling, contact] = await Promise.all([
    getPublishedServices("FITOUT"),
    getPublishedServices("STYLING"),
    getSetting<ContactSettings>("site.contact"),
  ]);

  const photographed = fitout.filter((s) => s.images.length > 0);
  const totalPhotos = fitout.reduce((n, s) => n + s._count.images, 0);

  return (
    <>
      {/* ===================================================== the job sheet */}
      <section className="container-page pt-12 lg:pt-20">
        <div>
          <h1 className="max-w-[20ch] text-[clamp(2.1rem,5.2vw,3.9rem)] font-medium leading-[1.04] tracking-[-0.025em]">
            We do not furnish rooms. We build them in.
          </h1>
          <p className="mt-5 max-w-[58ch] text-[1.02rem] leading-relaxed text-ink-2">
            Kitchens, wardrobes, staircases, ceilings and feature walls &mdash; measured in your
            space, made in our workshop, fitted by the people who made them. One team from the
            first survey to the last coat.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/design/enquire"
            className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-card)] bg-accent px-7 text-[0.92rem] font-medium text-white transition hover:bg-accent-2"
          >
            Book a site survey <ArrowRight2 size={15} />
          </Link>
          {contact?.phone && (
            <a
              href={`tel:${contact.phone.replace(/\s/g, "")}`}
              className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-card)] border border-rule px-7 text-[0.92rem] font-medium transition hover:border-ink"
            >
              {contact.phone} <ArrowRight2 size={15} />
            </a>
          )}
        </div>
      </section>

      {/* ======================================================== the trades */}
      <section className="container-page mt-20 lg:mt-28">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[clamp(1.45rem,3vw,2rem)] font-medium tracking-[-0.02em]">
            What we fit out
          </h2>
          {totalPhotos > 0 && (
            <p className="text-[0.88rem] text-muted">
              {totalPhotos} photographs of our own installations
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {fitout.map((service) => {
            const cover = service.images[0];
            return (
              <Link key={service.id} href={`/design/${service.slug}`} className="group flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-sand">
                  {cover ? (
                    <Image
                      src={cover.url}
                      alt=""
                      fill
                      sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                      placeholder={cover.blurDataUrl ? "blur" : "empty"}
                      blurDataURL={cover.blurDataUrl ?? undefined}
                      className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                    />
                  ) : (
                    /* Absence drawn deliberately, not hidden. */
                    <div className="label-xs grid size-full place-items-center px-5 text-center text-muted">
                      Not yet photographed
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-1 flex-col">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[1rem] font-medium leading-tight">
                      {service.name}
                    </h3>
                    <span className="figure-num shrink-0 text-[0.78rem] text-muted">
                      {service._count.images || "—"}
                    </span>
                  </div>
                  {service.tagline && (
                    <p className="mt-1.5 text-[0.86rem] leading-relaxed text-ink-3">{service.tagline}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ========================================================= the stages */}
      <section className="mt-20 bg-sand py-16 lg:mt-28 lg:py-24">
        {/* One container for the whole band. The heading had its own and the
            list had none, so the steps and the closing line ran edge to edge
            on a phone while the heading above them sat in its gutter. */}
        <div className="container-page">
          <h2 className="max-w-[24ch] text-[clamp(1.6rem,3.4vw,2.4rem)] font-medium leading-[1.1] tracking-[-0.02em]">
            Four stages, and you see the price before the third
          </h2>

          <ol className="mt-10 grid gap-x-10 gap-y-8 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
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

          <p className="mt-8 text-[0.88rem] text-ink-3">
            No deposit is taken until you have approved a drawing and a price
          </p>
        </div>
      </section>

      {/* ======================================================== the styling */}
      {styling.some((s) => s.images.length > 0) && (
        <section className="container-page mt-20 lg:mt-28">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[clamp(1.45rem,3vw,2rem)] font-medium tracking-[-0.02em]">
              Rooms we have furnished
            </h2>
            <Link href="/shop" className="group flex items-center gap-1.5 text-[0.9rem] text-ink-2 transition hover:text-ink">
              Shop the catalogue <ArrowRight2 size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {styling
              .filter((s) => s.images.length > 0)
              .map((service) => (
                <Link key={service.id} href={`/design/${service.slug}`} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-sand">
                    <Image
                      src={service.images[0].url}
                      alt=""
                      fill
                      sizes="(min-width:1024px) 24vw, 45vw"
                      placeholder={service.images[0].blurDataUrl ? "blur" : "empty"}
                      blurDataURL={service.images[0].blurDataUrl ?? undefined}
                      className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-2">
                    <span className="text-[0.9rem] font-medium">{service.name}</span>
                    <span className="figure-num text-[0.78rem] text-muted">
                      {service._count.images}
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* ============================================================== foot */}
      <section className="container-page mt-20 lg:mt-28">
        <div className="border-t border-line py-16 text-center lg:py-20">
          <h2 className="mx-auto max-w-[22ch] text-[clamp(1.6rem,3.6vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.02em]">
            Send us the room
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-[0.98rem] leading-relaxed text-ink-2">
            Tell us the space, the rough budget and when you need it finished. We will come and
            measure, then come back with a drawing and an itemised price.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/design/enquire"
              className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-card)] bg-ink px-7 text-[0.92rem] font-medium text-white transition hover:bg-ink-2"
            >
              Start a design brief <ArrowRight2 size={14} />
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

      {photographed.length === 0 && (
        <p className="sr-only">Service galleries are awaiting photography.</p>
      )}
    </>
  );
}
