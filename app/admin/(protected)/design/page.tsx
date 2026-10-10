import Image from "next/image";
import Link from "next/link";
import { Warning2, ArrowRight2 } from "iconsax-reactjs";

import { Card, PageHeader, Stat } from "@/components/admin/ui";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/db";
import { getReviewCounts } from "@/lib/design";

export const dynamic = "force-dynamic";

const KIND_LABELS: Record<string, string> = {
  FITOUT: "Fit-out services",
  STYLING: "Furniture styling",
  PRODUCT_LINE: "Product lines",
  PROCESS: "Behind the bench",
};

export default async function DesignAdminPage() {
  const [services, counts] = await Promise.all([
    prisma.designService.findMany({
      orderBy: { position: "asc" },
      include: {
        images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
        _count: { select: { images: true } },
      },
    }),
    getReviewCounts(),
  ]);

  // One grouped query beats a per-service count round trip.
  const byOrigin = await prisma.designImage.groupBy({
    by: ["serviceId", "origin"],
    _count: { _all: true },
  });
  const tally = new Map<string, Record<string, number>>();
  for (const row of byOrigin) {
    const entry = tally.get(row.serviceId) ?? {};
    entry[row.origin] = row._count._all;
    tally.set(row.serviceId, entry);
  }

  const groups = services.reduce<Record<string, typeof services>>((acc, s) => {
    (acc[s.kind] ??= []).push(s);
    return acc;
  }, {});

  const total = counts.unset + counts.own + counts.reference;

  return (
    <>
      <PageHeader
        title="Interior design"
        subtitle="Sort the photo library, then publish the galleries."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Unsorted" value={counts.unset} hint="Not public" tone={counts.unset ? "warn" : "neutral"} />
        <Stat label="Our own work" value={counts.own} hint="Live on the site" tone="success" />
        <Stat label="Reference only" value={counts.reference} hint="Never published" />
        <Stat label="Watermarked" value={counts.flagged} hint="Must be replaced" tone={counts.flagged ? "warn" : "neutral"} />
      </div>

      {counts.unset > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-warn/30 bg-warn-soft p-4">
          <Warning2 size={20} className="mt-0.5 shrink-0 text-warn" />
          <div className="text-[0.87rem] leading-relaxed text-ink-3">
            <p className="font-medium text-ink">
              {counts.unset} of {total} photos are still unsorted
            </p>
            <p className="mt-1">
              Imported photos stay invisible to the public site until you say what each one is.
              Mark a photo <strong className="text-ink">Our work</strong> only if UrbanCraft
              actually built and installed it — that gallery is a claim customers will rely on.
              Anything else is a <strong className="text-ink">Reference</strong> and stays private.
            </p>
          </div>
        </div>
      )}

      {Object.entries(groups).map(([kind, items]) => (
        <section key={kind} className="mb-9">
          <h2 className="mb-3 text-[0.78rem] uppercase tracking-[0.1em] text-muted">
            {KIND_LABELS[kind] ?? kind}
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((service) => {
              const t = tally.get(service.id) ?? {};
              const unset = t.UNSET ?? 0;
              const own = t.OWN_WORK ?? 0;
              const reference = t.REFERENCE ?? 0;

              return (
                <Card key={service.id} className="overflow-hidden">
                  <Link href={`/admin/design/${service.slug}`} className="block">
                    <div className="relative aspect-[16/9] bg-sand">
                      {service.images[0] && (
                        <Image
                          src={service.images[0].url}
                          alt=""
                          fill
                          sizes="(min-width:1280px) 30vw, 45vw"
                          className="object-cover"
                        />
                      )}
                      {!service.isPublished && (
                        <span className="absolute left-2 top-2">
                          <Badge tone="danger">Hidden</Badge>
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[0.95rem] font-medium">{service.name}</h3>
                        <ArrowRight2 size={15} className="mt-0.5 shrink-0 text-muted" />
                      </div>
                      <p className="mt-0.5 text-[0.76rem] text-muted">
                        {service._count.images} photo{service._count.images === 1 ? "" : "s"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {own > 0 && <Badge tone="success">{own} ours</Badge>}
                        {unset > 0 && <Badge tone="warn">{unset} unsorted</Badge>}
                        {reference > 0 && <Badge>{reference} reference</Badge>}
                      </div>
                    </div>
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
