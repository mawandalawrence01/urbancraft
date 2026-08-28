import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft2, Call, Whatsapp, Printer } from "iconsax-reactjs";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader, inputClass } from "@/components/admin/ui";
import { addOrderNote, updateOrderStatus, updatePaymentStatus } from "@/lib/actions/orders";
import { prisma } from "@/lib/db";
import { formatDate, formatPhone, formatUGX } from "@/lib/utils";

type Params = Promise<{ orderNumber: string }>;

const ORDER_STATUSES = [
  "PENDING", "CONFIRMED", "IN_PRODUCTION", "READY",
  "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED",
] as const;

const PAYMENT_STATUSES = [
  "PENDING", "AWAITING_APPROVAL", "PAID", "PARTIALLY_PAID", "FAILED", "REFUNDED",
] as const;

const PAYMENT_TONE = {
  PAID: "success", PENDING: "warn", AWAITING_APPROVAL: "warn",
  PARTIALLY_PAID: "warn", FAILED: "danger", REFUNDED: "neutral",
} as const;

export default async function AdminOrderPage({ params }: { params: Params }) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      payments: { orderBy: { createdAt: "desc" } },
      events: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) notFound();

  const waText = encodeURIComponent(
    `Hello ${order.contactName}, this is UrbanCraft about your order ${order.orderNumber}.`,
  );

  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-[0.85rem] text-muted hover:text-ink no-print">
        <ArrowLeft2 size={14} /> All orders
      </Link>

      <PageHeader
        title={`Order ${order.orderNumber}`}
        subtitle={`Placed ${formatDate(order.createdAt, "long")}`}
        action={
          <div className="flex flex-wrap gap-2 no-print">
            <a
              href={`tel:${order.contactPhone}`}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-4 text-[0.85rem] font-medium transition hover:border-ink"
            >
              <Call size={15} className="text-tan" /> Call
            </a>
            <a
              href={`https://wa.me/${order.contactPhone}?text=${waText}`}
              target="_blank" rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-4 text-[0.85rem] font-medium transition hover:border-ink"
            >
              <Whatsapp size={15} className="text-success" /> WhatsApp
            </a>
            <Link
              href={`/orders/${order.orderNumber}`} target="_blank"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-4 text-[0.85rem] font-medium transition hover:border-ink"
            >
              <Printer size={15} /> Customer view
            </Link>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <h2 className="border-b border-line px-5 py-3.5 font-display font-semibold">Items</h2>
            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-3 p-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                    {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    {item.slug ? (
                      <Link href={`/product/${item.slug}`} target="_blank" className="text-[0.9rem] font-medium hover:underline">
                        {item.name}
                      </Link>
                    ) : (
                      <p className="text-[0.9rem] font-medium">{item.name}</p>
                    )}
                    {item.variantName && <p className="text-[0.78rem] text-tan-2">{item.variantName}</p>}
                    <p className="tabular text-[0.8rem] text-muted">
                      {item.quantity} × {formatUGX(item.unitPrice)}
                    </p>
                  </div>
                  <span className="tabular shrink-0 font-medium">{formatUGX(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t border-line px-5 py-4 text-[0.88rem]">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular">{formatUGX(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery · {order.deliveryDistrict}</dt>
                <dd className="tabular">{order.deliveryFee === 0 ? "Free" : formatUGX(order.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base">
                <dt className="font-medium">Total</dt>
                <dd className="tabular font-display font-semibold">{formatUGX(order.total)}</dd>
              </div>
            </dl>
          </Card>

          {order.payments.length > 0 && (
            <Card className="overflow-hidden">
              <h2 className="border-b border-line px-5 py-3.5 font-display font-semibold">Payments</h2>
              <ul className="divide-y divide-line">
                {order.payments.map((p) => (
                  <li key={p.id} className="px-5 py-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-[0.88rem] font-medium">
                        {p.method.replace(/_/g, " ").toLowerCase()}
                        <Badge tone={PAYMENT_TONE[p.status]}>{p.status.replace(/_/g, " ").toLowerCase()}</Badge>
                      </span>
                      <span className="tabular font-medium">{formatUGX(p.amount)}</span>
                    </div>
                    <dl className="mt-1.5 space-y-0.5 text-[0.76rem] text-muted">
                      {p.msisdn && <div>Payer: {formatPhone(p.msisdn)}</div>}
                      {p.transactionReference && <div>Yo! ref: {p.transactionReference}</div>}
                      {p.mnoReference && <div>Network ref: {p.mnoReference}</div>}
                      {p.statusMessage && <div>{p.statusMessage}</div>}
                      <div>{formatDate(p.createdAt, "long")}</div>
                    </dl>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="overflow-hidden">
            <h2 className="border-b border-line px-5 py-3.5 font-display font-semibold">History</h2>
            <ol className="divide-y divide-line">
              {order.events.map((e) => (
                <li key={e.id} className="px-5 py-3">
                  <p className="text-[0.86rem] font-medium">{e.label}</p>
                  {e.detail && <p className="text-[0.8rem] text-ink-3">{e.detail}</p>}
                  <p className="text-[0.74rem] text-muted">
                    {formatDate(e.createdAt, "long")}{e.actor ? ` · ${e.actor}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* --------------------------------------------------------- side */}
        <div className="space-y-5 no-print">
          <Card className="space-y-4 p-5">
            <h2 className="font-display font-semibold">Update</h2>

            <form action={updateOrderStatus.bind(null, order.id)} className="space-y-2">
              <label className="block text-[0.82rem] font-medium">Order status</label>
              <select name="status" defaultValue={order.status} className={inputClass}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>
                ))}
              </select>
              <Button type="submit" size="sm" className="w-full">Update status</Button>
            </form>

            <form action={updatePaymentStatus.bind(null, order.id)} className="space-y-2 border-t border-line pt-4">
              <label className="block text-[0.82rem] font-medium">Payment status</label>
              <select name="paymentStatus" defaultValue={order.paymentStatus} className={inputClass}>
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>
                ))}
              </select>
              <Button type="submit" size="sm" variant="outline" className="w-full">
                Record payment status
              </Button>
              <p className="text-[0.74rem] leading-relaxed text-muted">
                Use this for cash and bank deposits. Mobile money settles itself.
              </p>
            </form>
          </Card>

          <Card className="p-5">
            <h2 className="font-display font-semibold">Customer</h2>
            <address className="mt-3 space-y-0.5 text-[0.87rem] not-italic leading-relaxed text-ink-3">
              <p className="font-medium text-ink">{order.contactName}</p>
              <p>{formatPhone(order.contactPhone)}</p>
              {order.contactEmail && <p className="break-all">{order.contactEmail}</p>}
              <p className="pt-2">{order.deliveryLine1}</p>
              {order.deliveryLine2 && <p>{order.deliveryLine2}</p>}
              {order.deliveryLandmark && <p className="text-muted">Near {order.deliveryLandmark}</p>}
              <p>{order.deliveryDistrict}</p>
            </address>
            {order.customerNote && (
              <p className="mt-3 rounded-lg bg-sand p-3 text-[0.83rem] leading-relaxed">
                “{order.customerNote}”
              </p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-display font-semibold">Internal note</h2>
            <form action={addOrderNote.bind(null, order.id)} className="mt-3 space-y-2">
              <textarea
                name="note" rows={4} defaultValue={order.adminNote ?? ""}
                placeholder="Timber choice agreed, deposit taken in cash…"
                className={inputClass}
              />
              <Button type="submit" size="sm" variant="outline" className="w-full">Save note</Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
