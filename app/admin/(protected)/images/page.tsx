import Image from "next/image";
import Link from "next/link";
import { Warning2, TickCircle, ExportSquare } from "iconsax-reactjs";

import { Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { clearImageFlag, deleteProductImage } from "@/lib/actions/products";
import { prisma } from "@/lib/db";

export default async function ImageReviewPage() {
  const flagged = await prisma.productImage.findMany({
    where: { needsReview: true },
    orderBy: [{ productId: "asc" }, { position: "asc" }],
    include: {
      product: {
        select: {
          id: true, name: true, slug: true,
          _count: { select: { images: true } },
          images: { where: { needsReview: false }, select: { id: true }, take: 1 },
        },
      },
    },
  });

  if (flagged.length === 0) {
    return (
      <>
        <PageHeader title="Image review" subtitle="Photos that need replacing with your own." />
        <EmptyState
          title="Nothing to review"
          body="Every product photo has been checked. New uploads are never flagged automatically."
        />
      </>
    );
  }

  // Products where every photo is flagged — deleting would leave them blank.
  const strandedProducts = new Set(
    flagged.filter((f) => f.product.images.length === 0).map((f) => f.product.id),
  );

  return (
    <>
      <PageHeader
        title="Image review"
        subtitle={`${flagged.length} photos carry another company's watermark or a burnt-in price.`}
      />

      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-warn/30 bg-warn-soft p-4">
        <Warning2 size={20} className="mt-0.5 shrink-0 text-warn" />
        <div className="text-[0.87rem] leading-relaxed text-ink-3">
          <p className="font-medium text-ink">Why these are flagged</p>
          <p className="mt-1">
            These photos were imported from an existing furniture catalogue and visibly show another
            business&apos;s branding. Replace them with photographs of your own pieces — a phone
            camera in good daylight is enough. For{" "}
            <strong className="text-ink">{strandedProducts.size}</strong> products every photo is
            flagged, so there is nothing clean to fall back on until you upload a replacement.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {flagged.map((img) => {
          const stranded = img.product.images.length === 0;
          return (
            <Card key={img.id} className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-sand">
                <Image src={img.url} alt="" fill sizes="(min-width:1280px) 30vw, 45vw" className="object-cover" />
                {stranded && (
                  <span className="absolute left-2 top-2">
                    <Badge tone="danger">No clean photo</Badge>
                  </span>
                )}
              </div>
              <div className="p-4">
                <Link
                  href={`/admin/products/${img.product.id}`}
                  className="line-clamp-2 text-[0.88rem] font-medium hover:underline"
                >
                  {img.product.name}
                </Link>
                <p className="mt-0.5 text-[0.76rem] text-muted">
                  {img.product._count.images} photo{img.product._count.images === 1 ? "" : "s"} total
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/products/${img.product.id}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[0.8rem] font-medium text-cream"
                  >
                    Replace <ExportSquare size={13} />
                  </Link>
                  <form action={clearImageFlag.bind(null, img.id)}>
                    <Button type="submit" size="sm" variant="outline">
                      <TickCircle size={14} /> It&apos;s fine
                    </Button>
                  </form>
                  {!stranded && (
                    <form action={deleteProductImage.bind(null, img.id)}>
                      <Button type="submit" size="sm" variant="ghost" className="text-danger">
                        Delete
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
