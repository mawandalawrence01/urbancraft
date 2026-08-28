import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TickCircle, Bank, Truck, Wallet3, Call, Copy } from "iconsax-reactjs";

import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { PaymentWatcher } from "@/components/cart/PaymentWatcher";
import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";
import { getOrderByNumber } from "@/lib/orders";
import { getSetting, type BankSettings, type ContactSettings } from "@/lib/settings";
import { formatDate, formatPhone, formatUGX } from "@/lib/utils";

export const metadata: Metadata = { title: "Your Order", robots: { index: false, follow: false } };

const STATUS_STEPS = [
  { key: "PENDING", label: "Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "IN_PRODUCTION", label: "In production" },
  { key: "READY", label: "Ready" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { key: "DELIVERED", label: "Delivered" },
] as const;

const PAYMENT_TONE = {
  PAID: "success", PENDING: "warn", AWAITING_APPROVAL: "warn",
  PARTIALLY_PAID: "warn", FAILED: "danger", REFUNDED: "neutral",
} as const;

type Params = Promise<{ orderNumber: string }>;
type SearchParams = Promise<{ new?: string; phone?: string }>;

export default async function OrderPage({
  params, searchParams,
}: { params: Params; searchParams: SearchParams }) {
  const { orderNumber } = await params;
  const { new: isNew, phone } = await searchParams;

  const order = await getOrderByNumber(orderNumber, phone);
  if (!order) notFound();

  const [bank, contact] = await Promise.all([
    getSetting<BankSettings>("payments.bank"),
    getSetting<ContactSettings>("site.contact"),
  ]);

  const stepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const cancelled = order.status === "CANCELLED";
  const awaitingMomo =
    order.paymentMethod === "MOBILE_MONEY" &&
    (order.paymentStatus === "PENDING" || order.paymentStatus === "AWAITING_APPROVAL");

  return (
    <div className="container-page max-w-3xl pt-8">
      {isNew && <ClearCartOnMount />}

      <div className="rounded-2xl border border-line bg-paper p-6 sm:p-8">
        {isNew && (
          <p className="mb-4 flex items-center gap-2 text-[0.88rem] font-medium text-success">
            <TickCircle size={18} variant="Bold" /> Order received
          </p>
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold">Order {order.orderNumber}</h1>
            <p className="mt-1 text-[0.86rem] text-muted">
              Placed {formatDate(order.createdAt, "long")}
            </p>
          </div>
          <Badge tone={PAYMENT_TONE[order.paymentStatus]}>
            {order.paymentStatus.replace(/_/g, " ").toLowerCase()}
          </Badge>
        </div>

        {awaitingMomo && (
          <div className="mt-5 rounded-xl border border-warn/30 bg-warn-soft p-4">
            <p className="flex items-center gap-2 font-medium text-warn">
              <Wallet3 size={18} /> Check your phone
            </p>
            <p className="mt-1.5 text-[0.88rem] leading-relaxed text-ink-3">
              We sent a payment request for {formatUGX(order.total)}. Approve it with your mobile
              money PIN. This page updates itself once payment clears.
            </p>
            <PaymentWatcher orderNumber={order.orderNumber} />
          </div>
        )}

        {order.paymentMethod === "BANK_DEPOSIT" && order.paymentStatus !== "PAID" && bank.accountNumber && (
          <div className="mt-5 rounded-xl border border-line bg-sand p-4">
            <p className="flex items-center gap-2 font-medium"><Bank size={18} className="text-tan" /> Bank deposit</p>
            <dl className="mt-3 space-y-1.5 text-[0.87rem]">
              {[["Bank", bank.bankName], ["Account name", bank.accountName],
                ["Account number", bank.accountNumber], ["Reference", order.orderNumber]]
                .filter(([, v]) => Boolean(v))
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-muted">{k}</dt>
                    <dd className="tabular text-right font-medium">{v}</dd>
                  </div>
                ))}
            </dl>
            <p className="mt-3 flex items-start gap-1.5 text-[0.82rem] leading-relaxed text-muted">
              <Copy size={14} className="mt-0.5 shrink-0" />
              Use <strong className="mx-1 font-semibold text-ink">{order.orderNumber}</strong> as the
              deposit reference so we can match your payment.
            </p>
          </div>
        )}

        {order.paymentMethod === "CASH_ON_DELIVERY" && (
          <p className="mt-5 flex items-start gap-2.5 rounded-xl border border-line bg-sand p-4 text-[0.88rem] leading-relaxed">
            <Truck size={19} className="mt-0.5 shrink-0 text-tan" />
            Pay {formatUGX(order.total)} to our driver on delivery. We will call
            {" "}{formatPhone(order.contactPhone)} to arrange a time.
          </p>
        )}

        {/* ------------------------------------------------------- progress */}
        {!cancelled && (
          <ol className="mt-7 grid grid-cols-3 gap-y-4 sm:grid-cols-6">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= stepIndex;
              return (
                <li key={step.key} className="flex flex-col items-center gap-1.5 text-center">
                  <span
                    className={`grid size-7 place-items-center rounded-full text-[0.7rem] ${
                      done ? "bg-tan text-white" : "bg-sand text-muted"
                    }`}
                  >
                    {done ? <TickCircle size={15} variant="Bold" /> : i + 1}
                  </span>
                  <span className={`text-[0.7rem] leading-tight ${done ? "text-ink" : "text-muted"}`}>
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
        {cancelled && (
          <p className="mt-6 rounded-xl bg-danger-soft px-4 py-3 text-[0.88rem] text-danger">
            This order was cancelled. Call us if that looks wrong.
          </p>
        )}
      </div>

      {/* ------------------------------------------------------------ items */}
      <section className="mt-6 rounded-2xl border border-line bg-paper p-6 sm:p-8">
        <h2 className="font-display text-lg font-semibold">What you ordered</h2>
        <ul className="mt-4 divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-3 py-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                {item.slug ? (
                  <Link href={`/product/${item.slug}`} className="line-clamp-2 text-[0.9rem] font-medium hover:underline">
                    {item.name}
                  </Link>
                ) : (
                  <p className="line-clamp-2 text-[0.9rem] font-medium">{item.name}</p>
                )}
                {item.variantName && <p className="text-[0.78rem] text-tan-2">{item.variantName}</p>}
                <p className="tabular text-[0.82rem] text-muted">
                  {item.quantity} × {formatUGX(item.unitPrice)}
                </p>
              </div>
              <span className="tabular shrink-0 font-medium">{formatUGX(item.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[0.9rem]">
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
      </section>

      {/* --------------------------------------------------------- delivery */}
      <section className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-paper p-6">
          <h2 className="font-display text-base font-semibold">Delivering to</h2>
          <address className="mt-2 space-y-0.5 text-[0.88rem] not-italic leading-relaxed text-ink-3">
            <p className="font-medium text-ink">{order.contactName}</p>
            <p>{formatPhone(order.contactPhone)}</p>
            <p>{order.deliveryLine1}</p>
            {order.deliveryLine2 && <p>{order.deliveryLine2}</p>}
            {order.deliveryLandmark && <p className="text-muted">Near {order.deliveryLandmark}</p>}
            <p>{order.deliveryDistrict}</p>
          </address>
          {order.customerNote && (
            <p className="mt-3 rounded-lg bg-sand p-3 text-[0.83rem] leading-relaxed text-ink-3">
              “{order.customerNote}”
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-paper p-6">
          <h2 className="font-display text-base font-semibold">Progress</h2>
          <ol className="mt-3 space-y-3">
            {order.events.map((event) => (
              <li key={event.id} className="flex gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-tan" />
                <div className="min-w-0">
                  <p className="text-[0.86rem] font-medium">{event.label}</p>
                  {event.detail && <p className="text-[0.8rem] text-muted">{event.detail}</p>}
                  <p className="text-[0.74rem] text-muted">{formatDate(event.createdAt, "long")}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <ButtonLink href="/shop" variant="outline">Continue shopping</ButtonLink>
        <a
          href={`tel:${contact.phone.replace(/\s/g, "")}`}
          className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-[0.9rem] font-medium text-tan-2 hover:underline"
        >
          <Call size={17} /> Call us about this order
        </a>
      </div>

      <p className="mt-6 text-[0.8rem] text-muted">
        Save your order number <strong className="text-ink">{order.orderNumber}</strong> — you can
        look it up any time at <Link href="/orders/track" className="text-tan-2 underline">track an order</Link>.
      </p>
    </div>
  );
}
