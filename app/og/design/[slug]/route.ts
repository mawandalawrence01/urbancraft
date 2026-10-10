import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { OG_CACHE_HEADERS, renderOgCard } from "@/lib/og";

export const revalidate = 86400;

/** The preview card for an interiors gallery link. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const service = await prisma.designService.findFirst({
    where: { slug, isPublished: true },
    select: {
      images: {
        // The provenance gate holds here too: a share is a public surface.
        where: { origin: "OWN_WORK", needsReview: false },
        orderBy: { position: "asc" },
        take: 1,
        select: { url: true },
      },
    },
  });

  const source = service?.images[0]?.url;
  if (!source) notFound();

  const card = await renderOgCard(source);
  if (!card) notFound();

  return new Response(new Uint8Array(card.body), { headers: OG_CACHE_HEADERS });
}
