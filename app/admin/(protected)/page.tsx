import Link from "next/link";
import Image from "next/image";
import { ArrowRight2, Warning2 } from "iconsax-reactjs";

import { Badge } from "@/components/ui/Badge";
import { Card, PageHeader, Stat } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { formatDate, formatUGX } from "@/lib/utils";

export default async function AdminDashboard() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    orderCount, pendingOrders, revenue, productCount, draftCount,
    flagged, enquiries, recentOrders, topProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: since } },
      _sum: { total: true },
    }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.product.count({ where: { status: "DRAFT" } }),
    prisma.productImage.count({ where: { needsReview: true } }),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" }, take: 8,
      select: {
        id: true, orderNumber: true, contactName: true, total: true,
        status: true, paymentStatus: true, createdAt: true,
        _count: { select: { items: true } },
      },
    }),
    prisma.orderItem.groupBy({
      by: ["name", "slug"],
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Everything that needs your attention, in one place."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Orders" value={orderCount} hint="all time" href="/admin/orders" />
        <Stat
          label="Awaiting action" value={pendingOrders} tone={pendingOrders ? "warn" : "neutral"}
          hint="not yet confirmed" href="/admin/orders?status=PENDING"
        />
        <Stat
          label="Paid · 30 days" value={formatUGX(revenue._sum.total ?? 0, { compact: true })}
          tone="success" hint="confirmed payments"
        />
        <Stat
          label="Live products" value={productCount}
          hint={draftCount ? `${draftCount} in draft` : "all published"} href="/admin/products"
        />
      </div>

      {(flagged > 0 || enquiries > 0) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {flagged > 0 && (
            <Link
              href="/admin/images"
              className="flex items-start gap-3 rounded-2xl border border-warn/30 bg-warn-soft p-4 transition hover:border-warn"
            >
              <Warning2 size={20} className="mt-0.5 shrink-0 text-warn" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{flagged} photos need replacing</span>
                <span className="mt-0.5 block text-[0.83rem] leading-relaxed text-ink-3">
                  Imported images carrying another company&apos;s watermark. Replace them with your
                  own photographs.
                </span>
              </span>
              <ArrowRight2 size={16} className="mt-1 shrink-0 text-warn" />
            </Link>
          )}
          {enquiries > 0 && (
            <Link
              href="/admin/enquiries"
              className="flex items-start gap-3 rounded-2xl border border-line bg-paper p-4 transition hover:border-ink"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{enquiries} new enquiries</span>
                <span className="mt-0.5 block text-[0.83rem] text-muted">Waiting for a reply.</span>
              </span>
              <ArrowRight2 size={16} className="mt-1 shrink-0" />
            </Link>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-[0.83rem] text-tan-2 hover:underline">
              All orders <ArrowRight2 size={13} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-[0.88rem] text-muted">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.orderNumber}`} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-sand">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-[0.88rem] font-medium">
                        {o.orderNumber}
                        <Badge tone={o.paymentStatus === "PAID" ? "success" : o.paymentStatus === "FAILED" ? "danger" : "warn"}>
                          {o.paymentStatus.replace(/_/g, " ").toLowerCase()}
                        </Badge>
                      </p>
                      <p className="truncate text-[0.8rem] text-muted">
                        {o.contactName} · {o._count.items} item{o._count.items === 1 ? "" : "s"} · {formatDate(o.createdAt)}
                      </p>
                    </div>
                    <span className="tabular shrink-0 text-[0.88rem] font-medium">{formatUGX(o.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display font-semibold">Best sellers</h2>
          </div>
          {topProducts.length === 0 ? (
            <p className="px-5 py-10 text-center text-[0.88rem] text-muted">
              Nothing sold yet.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {topProducts.map((p) => (
                <li key={p.name} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-[0.86rem] font-medium">{p.name}</p>
                    <p className="tabular text-[0.78rem] text-muted">
                      {p._sum.quantity} sold · {formatUGX(p._sum.lineTotal ?? 0, { compact: true })}
                    </p>
                  </div>
                  {p.slug && (
                    <Link href={`/product/${p.slug}`} className="shrink-0 text-[0.78rem] text-tan-2 hover:underline">
                      View
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
