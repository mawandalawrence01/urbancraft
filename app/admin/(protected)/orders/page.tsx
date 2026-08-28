import Link from "next/link";
import { SearchNormal1 } from "iconsax-reactjs";

import { Badge } from "@/components/ui/Badge";
import { Card, EmptyState, PageHeader, inputClass } from "@/components/admin/ui";
import { Pagination } from "@/components/shop/Pagination";
import { prisma } from "@/lib/db";
import { formatDate, formatPhone, formatUGX } from "@/lib/utils";
import type { Prisma } from "@/lib/generated/prisma/client";

const PER_PAGE = 30;

const STATUS_TONE = {
  PENDING: "warn", CONFIRMED: "tan", IN_PRODUCTION: "tan", READY: "tan",
  OUT_FOR_DELIVERY: "tan", DELIVERED: "success", CANCELLED: "danger",
} as const;

const PAYMENT_TONE = {
  PAID: "success", PENDING: "warn", AWAITING_APPROVAL: "warn",
  PARTIALLY_PAID: "warn", FAILED: "danger", REFUNDED: "neutral",
} as const;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = (one(sp.q) ?? "").trim();
  const status = one(sp.status);
  const page = Number(one(sp.page) ?? 1) || 1;

  const where: Prisma.OrderWhereInput = {};
  if (q) {
    where.OR = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { contactName: { contains: q, mode: "insensitive" } },
      { contactPhone: { contains: q.replace(/\D/g, "") } },
    ];
  }
  if (status && status !== "ALL") where.status = status as Prisma.OrderWhereInput["status"];

  const [orders, total, totals] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true, orderNumber: true, contactName: true, contactPhone: true,
        total: true, status: true, paymentStatus: true, paymentMethod: true,
        deliveryDistrict: true, createdAt: true,
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
    prisma.order.aggregate({ where, _sum: { total: true } }),
  ]);

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={`${total} matching · ${formatUGX(totals._sum.total ?? 0, { compact: true })} in value`}
      />

      <form className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-0 flex-1">
          <SearchNormal1 size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="Order number, name or phone…" className={`${inputClass} pl-10`} />
        </div>
        <select name="status" defaultValue={status ?? "ALL"} className={`${inputClass} w-auto`}>
          <option value="ALL">All statuses</option>
          {Object.keys(STATUS_TONE).map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>
          ))}
        </select>
        <button type="submit" className="rounded-xl bg-ink px-5 text-[0.88rem] font-medium text-cream">
          Filter
        </button>
      </form>

      {orders.length === 0 ? (
        <EmptyState title="No orders match" body="Try clearing the filters." />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-line">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.orderNumber}`} className="block p-4 transition hover:bg-sand">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="font-display font-semibold">{o.orderNumber}</span>
                        <Badge tone={STATUS_TONE[o.status]}>{o.status.replace(/_/g, " ").toLowerCase()}</Badge>
                        <Badge tone={PAYMENT_TONE[o.paymentStatus]}>
                          {o.paymentStatus.replace(/_/g, " ").toLowerCase()}
                        </Badge>
                      </p>
                      <p className="mt-1 truncate text-[0.85rem] text-ink-3">
                        {o.contactName} · {formatPhone(o.contactPhone)}
                      </p>
                      <p className="mt-0.5 truncate text-[0.78rem] text-muted">
                        {o._count.items} item{o._count.items === 1 ? "" : "s"} · {o.deliveryDistrict} ·{" "}
                        {o.paymentMethod.replace(/_/g, " ").toLowerCase()} · {formatDate(o.createdAt)}
                      </p>
                    </div>
                    <span className="tabular shrink-0 font-display font-semibold">{formatUGX(o.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Pagination
        page={page} pageCount={Math.max(1, Math.ceil(total / PER_PAGE))}
        basePath="/admin/orders" params={{ q, status }}
      />
    </>
  );
}
