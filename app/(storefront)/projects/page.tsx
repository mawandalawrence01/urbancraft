import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "Fit-outs, built-ins and commissions installed by the UrbanCraft workshop across Kampala — retail, office, hospitality and residential.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { isPublished: true },
    orderBy: { position: "asc" },
  });

  const groups = projects.reduce<Record<string, typeof projects>>((acc, p) => {
    const key = p.clientType ?? "Other";
    (acc[key] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div className="container-page pt-8">
      <header className="max-w-2xl">
        <p className="text-[0.75rem] uppercase tracking-[0.2em] text-tan-2">Our work</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
          Rooms we have measured, built and fitted
        </h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-3">
          Beyond the catalogue, most of what leaves our workshop is built for one specific space.
          These are installations photographed on site.
        </p>
      </header>

      {Object.entries(groups).map(([group, items]) => (
        <section key={group} className="mt-14">
          <h2 className="mb-5 text-xl font-semibold">{group}</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
            {items.map((p) => (
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
                <h3 className="mt-2.5 text-[0.92rem] font-medium">{p.title}</h3>
                {p.summary && (
                  <p className="mt-0.5 line-clamp-2 text-[0.8rem] leading-relaxed text-muted">
                    {p.summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-16 rounded-[var(--radius-card)] border border-line bg-sand px-6 py-12 text-center">
        <h2 className="text-2xl font-semibold">Have a space that needs fitting out?</h2>
        <p className="mx-auto mt-3 max-w-lg text-[0.95rem] leading-relaxed text-ink-3">
          We survey, draw, build and install. Send us the room and we will come back with a plan
          and a price.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-7 font-medium text-cream transition hover:bg-ink-2"
        >
          Start a conversation
        </Link>
      </section>
    </div>
  );
}
