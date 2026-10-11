import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft2, TickCircle, Gallery, Warning2, Eye, EyeSlash } from "iconsax-reactjs";

import { SortableShot } from "@/components/admin/SortableShot";
import { Card, PageHeader } from "@/components/admin/ui";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  bulkSetOrigin,
  clearDesignFlag,
  deleteDesignImage,
  setImageOrigin,
  toggleServicePublished,
} from "@/lib/actions/design";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export default async function DesignServiceAdminPage({ params }: { params: Params }) {
  const { slug } = await params;

  const service = await prisma.designService.findUnique({
    where: { slug },
    include: { images: { orderBy: [{ origin: "asc" }, { position: "asc" }] } },
  });
  if (!service) notFound();

  const unset = service.images.filter((i) => i.origin === "UNSET" && !i.needsReview);
  const own = service.images.filter((i) => i.origin === "OWN_WORK");
  const reference = service.images.filter((i) => i.origin === "REFERENCE");

  return (
    <>
      <Link
        href="/admin/design"
        className="mb-4 inline-flex items-center gap-1.5 py-2.5 text-[0.85rem] text-muted transition hover:text-ink"
      >
        <ArrowLeft2 size={15} /> Interior design
      </Link>

      <PageHeader
        title={service.name}
        subtitle={`${service.images.length} photos · ${own.length} live · ${unset.length} unsorted`}
        action={
          <div className="flex flex-wrap gap-2">
            {own.length > 0 && (
              <Link
                href={`/design/${service.slug}`}
                className="inline-flex h-11 items-center sm:h-9 gap-1.5 rounded-full border border-line bg-paper px-4 text-[0.8rem] font-medium"
              >
                <Gallery size={14} /> View gallery
              </Link>
            )}
            <form action={toggleServicePublished.bind(null, service.id)}>
              <Button type="submit" size="sm" variant={service.isPublished ? "outline" : "primary"}>
                {service.isPublished ? (
                  <>
                    <EyeSlash size={14} /> Hide service
                  </>
                ) : (
                  <>
                    <Eye size={14} /> Publish service
                  </>
                )}
              </Button>
            </form>
          </div>
        }
      />

      {unset.length > 0 && (
        <div className="mb-6 rounded-2xl border border-line bg-paper p-4">
          <p className="text-[0.87rem] font-medium">
            {unset.length} photo{unset.length === 1 ? "" : "s"} still unsorted
          </p>
          <p className="mt-1 text-[0.83rem] leading-relaxed text-muted">
            If this whole set is UrbanCraft&apos;s own installed work you can mark it in one go.
            Watermarked photos are skipped and stay for individual review.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <form action={bulkSetOrigin.bind(null, service.id, "OWN_WORK")}>
              <Button type="submit" size="sm">
                <TickCircle size={14} /> All {unset.length} are ours
              </Button>
            </form>
            <form action={bulkSetOrigin.bind(null, service.id, "REFERENCE")}>
              <Button type="submit" size="sm" variant="outline">
                All {unset.length} are reference
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
        {service.images.map((img, i) => (
          <Card key={img.id} className="overflow-hidden">
            <div className="relative aspect-[4/5] bg-sand">
              <SortableShot
                images={service.images.map((im) => ({
                  url: im.url,
                  alt: im.caption ?? service.name,
                  width: im.width,
                  height: im.height,
                  blurDataUrl: im.blurDataUrl,
                  caption: im.reviewNote ?? im.caption,
                }))}
                index={i}
                alt={img.caption ?? service.name}
                label={service.name}
              />
              <span className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1">
                {img.needsReview && <Badge tone="danger">Watermark</Badge>}
                {img.origin === "OWN_WORK" && <Badge tone="success">Live</Badge>}
                {img.origin === "REFERENCE" && <Badge>Reference</Badge>}
              </span>
            </div>

            <div className="p-3">
              {img.needsReview ? (
                <>
                  <p className="flex items-start gap-1.5 text-[0.78rem] leading-relaxed text-warn">
                    <Warning2 size={13} className="mt-0.5 shrink-0" />
                    {img.reviewNote ?? "Carries third-party branding"}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <form action={clearDesignFlag.bind(null, img.id)}>
                      <Button type="submit" size="sm" variant="outline">
                        Cleared
                      </Button>
                    </form>
                    <form action={deleteDesignImage.bind(null, img.id)}>
                      <Button type="submit" size="sm" variant="ghost" className="text-danger">
                        Delete
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {img.origin !== "OWN_WORK" && (
                    <form action={setImageOrigin.bind(null, img.id, "OWN_WORK")}>
                      <Button type="submit" size="sm">
                        <TickCircle size={13} /> Ours
                      </Button>
                    </form>
                  )}
                  {img.origin !== "REFERENCE" && (
                    <form action={setImageOrigin.bind(null, img.id, "REFERENCE")}>
                      <Button type="submit" size="sm" variant="outline">
                        Reference
                      </Button>
                    </form>
                  )}
                  {img.origin !== "UNSET" && (
                    <form action={setImageOrigin.bind(null, img.id, "UNSET")}>
                      <Button type="submit" size="sm" variant="ghost" className="text-muted">
                        Undo
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {reference.length > 0 && (
        <p className="mt-6 text-[0.82rem] text-muted">
          {reference.length} photo{reference.length === 1 ? " is" : "s are"} marked reference and
          will never appear on the public site.
        </p>
      )}
    </>
  );
}
