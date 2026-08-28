import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft2 } from "iconsax-reactjs";
import { prisma } from "@/lib/db";

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const projects = await prisma.project.findMany({
    where: { isPublished: true }, select: { slug: true },
  });
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary ?? undefined,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: project.coverImage ? { images: [{ url: project.coverImage }] } : undefined,
  };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = await prisma.project.findFirst({ where: { slug, isPublished: true } });
  if (!project) notFound();

  const body = (project.body ?? []) as { type: string; text: string }[];
  const images = (project.images ?? []) as { url: string; width?: number; height?: number; blurDataUrl?: string }[];

  const more = await prisma.project.findMany({
    where: { isPublished: true, id: { not: project.id }, clientType: project.clientType },
    orderBy: { position: "asc" }, take: 4,
  });

  return (
    <div className="container-page max-w-4xl pt-6">
      <Link href="/projects" className="mb-5 inline-flex items-center gap-1.5 text-[0.85rem] text-muted hover:text-ink">
        <ArrowLeft2 size={14} /> All work
      </Link>

      <header>
        {project.clientType && (
          <p className="text-[0.75rem] uppercase tracking-[0.2em] text-tan-2">{project.clientType}</p>
        )}
        <h1 className="mt-2.5 text-3xl font-semibold sm:text-4xl">{project.title}</h1>
        {project.summary && (
          <p className="mt-3 max-w-2xl text-[0.98rem] leading-relaxed text-ink-3">{project.summary}</p>
        )}
      </header>

      {project.coverImage && (
        <div className="relative mt-7 aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-sand">
          <Image
            src={project.coverImage} alt={project.title} fill priority
            sizes="(min-width:1024px) 60vw, 100vw" className="object-cover"
            placeholder={images[0]?.blurDataUrl ? "blur" : "empty"}
            blurDataURL={images[0]?.blurDataUrl}
          />
        </div>
      )}

      {body.length > 0 && (
        <div className="mt-8 max-w-2xl space-y-4 text-[0.96rem] leading-relaxed text-ink-3">
          {body.filter((b) => b.type === "p").map((b, i) => <p key={i}>{b.text}</p>)}
        </div>
      )}

      {images.length > 1 && (
        <div className="mt-8 grid grid-cols-2 gap-3">
          {images.slice(1).map((img) => (
            <div key={img.url} className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-sand">
              <Image src={img.url} alt="" fill sizes="(min-width:1024px) 30vw, 45vw" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {more.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 text-xl font-semibold">More {project.clientType?.toLowerCase()} work</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {more.map((p) => (
              <Link key={p.id} href={`/projects/${p.slug}`} className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-sand">
                  {p.coverImage && (
                    <Image src={p.coverImage} alt={p.title} fill sizes="(min-width:1024px) 24vw, 45vw"
                           className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  )}
                </div>
                <p className="mt-2 text-[0.88rem] font-medium">{p.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
