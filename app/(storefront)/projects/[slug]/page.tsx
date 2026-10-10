import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft2 } from "iconsax-reactjs";
import { ProjectGallery } from "@/components/media/ProjectGallery";
import { prisma } from "@/lib/db";
import { DEFAULT_OG_PATH, ogImageMeta } from "@/lib/og";

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
    openGraph: {
      type: "article",
      title: project.title,
      description: project.summary ?? undefined,
      url: `/projects/${project.slug}`,
      images: ogImageMeta(
        project.coverImage ? `/og/project/${project.slug}` : DEFAULT_OG_PATH,
        `${project.title} — installed by UrbanCraft`,
      ),
    },
    twitter: {
      card: "summary_large_image",
      images: [project.coverImage ? `/og/project/${project.slug}` : DEFAULT_OG_PATH],
    },
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
        <h1 className="text-[clamp(1.9rem,4.6vw,2.9rem)] font-medium leading-[1.06] tracking-[-0.025em]">
          {project.title}
        </h1>
        {project.clientType && (
          <p className="label-xs mt-3 text-muted">{project.clientType}</p>
        )}
        {project.summary && (
          <p className="mt-3 max-w-2xl text-[0.98rem] leading-relaxed text-ink-3">{project.summary}</p>
        )}
      </header>

      <ProjectGallery
        title={project.title}
        images={[
          ...(project.coverImage
            ? [{
                url: project.coverImage,
                alt: project.title,
                blurDataUrl: images[0]?.blurDataUrl ?? null,
              }]
            : []),
          ...images.slice(1).map((img) => ({
            url: img.url,
            alt: null,
            width: img.width ?? null,
            height: img.height ?? null,
            blurDataUrl: img.blurDataUrl ?? null,
          })),
        ]}
      />

      {body.length > 0 && (
        <div className="mt-8 max-w-2xl space-y-4 text-[0.96rem] leading-relaxed text-ink-3">
          {body.filter((b) => b.type === "p").map((b, i) => <p key={i}>{b.text}</p>)}
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
