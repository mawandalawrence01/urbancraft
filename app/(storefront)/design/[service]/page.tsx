import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft2, ArrowRight2 } from "iconsax-reactjs";

import { ButtonLink } from "@/components/ui/Button";
import { prisma } from "@/lib/db";
import { getPublishedServices, getServiceWithImages } from "@/lib/design";

export const revalidate = 3600;

type Params = Promise<{ service: string }>;

export async function generateStaticParams() {
  const services = await prisma.designService.findMany({
    where: { isPublished: true },
    select: { slug: true },
  });
  return services.map((s) => ({ service: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { service: slug } = await params;
  const service = await prisma.designService.findFirst({
    where: { slug, isPublished: true },
  });
  if (!service) return {};

  return {
    title: service.seoTitle ?? service.name,
    description: service.seoDescription ?? service.description ?? undefined,
    alternates: { canonical: `/design/${service.slug}` },
  };
}

export default async function DesignServicePage({ params }: { params: Params }) {
  const { service: slug } = await params;
  const service = await getServiceWithImages(slug);
  if (!service) notFound();

  const siblings = (await getPublishedServices(service.kind)).filter((s) => s.slug !== slug);

  return (
    <div>
      <section className="container-page pt-12 lg:pt-20">
        <Link
          href="/design"
          className="inline-flex items-center gap-1.5 text-[0.9rem] text-ink-2 transition hover:text-ink"
        >
          <ArrowLeft2 size={13} /> Interiors
        </Link>

        <header className="mt-6">
          <h1 className="max-w-[20ch] text-[clamp(2.1rem,5.2vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.025em]">
            {service.name}
          </h1>
          {service.tagline && (
            <p className="mt-4 max-w-[44ch] text-[1.05rem] text-ink-2">
              {service.tagline}
            </p>
          )}
          {service.description && (
            <p className="mt-3 max-w-[60ch] text-[0.96rem] leading-relaxed text-ink-3">
              {service.description}
            </p>
          )}
        </header>

        {service.images.length > 0 && (
          <p className="mt-6 border-t border-line pt-4 text-[0.88rem] text-muted">
            {service.images.length} photograph{service.images.length === 1 ? "" : "s"} &mdash; our own installations
          </p>
        )}
      </section>

      <div className="container-page mt-10">

      {service.images.length > 0 ? (
        <div className="columns-2 gap-3 lg:columns-3 lg:gap-5 [&>*]:mb-3 lg:[&>*]:mb-5">
          {service.images.map((img, i) => (
            <figure
              key={img.id}
              className="break-inside-avoid overflow-hidden rounded-[var(--radius-card)] bg-sand"
            >
              <Image
                src={img.url}
                alt={img.caption ?? `${service.name} — UrbanCraft installation`}
                width={img.width ?? 1200}
                height={img.height ?? 1600}
                sizes="(min-width:1024px) 31vw, 48vw"
                priority={i < 4}
                placeholder={img.blurDataUrl ? "blur" : "empty"}
                blurDataURL={img.blurDataUrl ?? undefined}
                className="h-auto w-full"
              />
              {img.caption && (
                <figcaption className="px-1 pt-2 text-[0.82rem] text-muted">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-dashed border-rule bg-sand px-6 py-16 text-center">
          <h2 className="font-display text-lg font-semibold">Photographs on the way</h2>
          <p className="mx-auto mt-2 max-w-sm text-[0.88rem] leading-relaxed text-muted">
            We are still photographing this work properly. In the meantime, ring the workshop and we
            will walk you through what we have recently installed.
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------- cta */}
      <section className="mt-16 rounded-[var(--radius-card)] bg-sand px-6 py-14 text-center">
        <h2 className="text-2xl font-semibold">
          Want this in your space?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[0.95rem] leading-relaxed text-ink-3">
          We survey, draw, build and install. Send us the room and we will come back with a plan and
          a price.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href={`/design/enquire?service=${service.slug}`} size="lg">
            Start a design brief
          </ButtonLink>
          <ButtonLink href="/contact" size="lg" variant="outline">
            Call the workshop
          </ButtonLink>
        </div>
      </section>

      {siblings.length > 0 && (
        <section className="mt-16">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-xl font-semibold">We also fit out</h2>
            <Link
              href="/design"
              className="flex shrink-0 items-center gap-1 text-[0.86rem] text-tan-2 hover:underline"
            >
              All services <ArrowRight2 size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
            {siblings.slice(0, 4).map((s) => (
              <Link key={s.id} href={`/design/${s.slug}`} className="group">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-sand">
                  {s.images[0] && (
                    <Image
                      src={s.images[0].url}
                      alt={s.name}
                      fill
                      sizes="(min-width:1024px) 24vw, 45vw"
                      placeholder={s.images[0].blurDataUrl ? "blur" : "empty"}
                      blurDataURL={s.images[0].blurDataUrl ?? undefined}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-2 text-[0.88rem] font-medium">{s.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
      </div>
    </div>
  );
}
