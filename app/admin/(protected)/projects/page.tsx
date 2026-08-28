import Image from "next/image";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Eye, ArrowUp2, ArrowDown2 } from "iconsax-reactjs";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function togglePublished(id: string, next: boolean) {
  "use server";
  await requireAdmin();
  await prisma.project.update({ where: { id }, data: { isPublished: next } });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

async function move(id: string, direction: "up" | "down") {
  "use server";
  await requireAdmin();
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return;

  const neighbour = await prisma.project.findFirst({
    where: { position: direction === "up" ? { lt: project.position } : { gt: project.position } },
    orderBy: { position: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbour) return;

  await prisma.$transaction([
    prisma.project.update({ where: { id: project.id }, data: { position: neighbour.position } }),
    prisma.project.update({ where: { id: neighbour.id }, data: { position: project.position } }),
  ]);
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { position: "asc" } });

  return (
    <>
      <PageHeader
        title="Our work"
        subtitle="Installations and commissions shown on the Our Work page."
      />

      {projects.length === 0 ? (
        <EmptyState title="No projects yet" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p, i) => (
            <Card key={p.id} className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-sand">
                {p.coverImage && (
                  <Image src={p.coverImage} alt="" fill sizes="(min-width:1280px) 30vw, 45vw" className="object-cover" />
                )}
                {!p.isPublished && (
                  <span className="absolute left-2 top-2"><Badge tone="neutral">hidden</Badge></span>
                )}
              </div>
              <div className="p-4">
                <p className="text-[0.9rem] font-medium">{p.title}</p>
                <p className="text-[0.76rem] text-muted">{p.clientType}</p>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <form action={togglePublished.bind(null, p.id, !p.isPublished)}>
                    <Button type="submit" size="sm" variant={p.isPublished ? "ghost" : "outline"}>
                      {p.isPublished ? "Hide" : "Publish"}
                    </Button>
                  </form>
                  <Link
                    href={`/projects/${p.slug}`} target="_blank"
                    className="grid size-8 place-items-center rounded-lg text-muted hover:bg-sand"
                    aria-label="View on site"
                  >
                    <Eye size={15} />
                  </Link>
                  <form action={move.bind(null, p.id, "up")}>
                    <button type="submit" disabled={i === 0} aria-label="Move up"
                            className="grid size-8 place-items-center rounded-lg hover:bg-sand disabled:opacity-25">
                      <ArrowUp2 size={14} />
                    </button>
                  </form>
                  <form action={move.bind(null, p.id, "down")}>
                    <button type="submit" disabled={i === projects.length - 1} aria-label="Move down"
                            className="grid size-8 place-items-center rounded-lg hover:bg-sand disabled:opacity-25">
                      <ArrowDown2 size={14} />
                    </button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
