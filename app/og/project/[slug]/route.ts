import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { OG_CACHE_HEADERS, renderOgCard } from "@/lib/og";

export const revalidate = 86400;

/** The preview card for an installed-project link. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const project = await prisma.project.findFirst({
    where: { slug, isPublished: true },
    select: { coverImage: true },
  });

  if (!project?.coverImage) notFound();

  const card = await renderOgCard(project.coverImage);
  if (!card) notFound();

  return new Response(new Uint8Array(card.body), { headers: OG_CACHE_HEADERS });
}
