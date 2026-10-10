import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { OG_CACHE_HEADERS, renderOgCard } from "@/lib/og";

export const revalidate = 86400;

/** The preview card WhatsApp, Facebook and Google show for a product link. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    select: {
      images: {
        // Never lead a share with a photo flagged for replacement.
        where: { needsReview: false },
        orderBy: { position: "asc" },
        take: 1,
        select: { url: true },
      },
    },
  });

  const source = product?.images[0]?.url;
  if (!source) notFound();

  const card = await renderOgCard(source);
  if (!card) notFound();

  return new Response(new Uint8Array(card.body), { headers: OG_CACHE_HEADERS });
}
