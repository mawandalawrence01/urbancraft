"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { OrderStatus, PaymentStatus } from "@/lib/generated/prisma/enums";

const ORDER_STATUSES = [
  "PENDING", "CONFIRMED", "IN_PRODUCTION", "READY",
  "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED",
] as const;

const PAYMENT_STATUSES = [
  "PENDING", "AWAITING_APPROVAL", "PAID", "PARTIALLY_PAID", "FAILED", "REFUNDED",
] as const;

const label = (s: string) =>
  s.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());

export async function updateOrderStatus(orderId: string, formData: FormData) {
  const session = await requireAdmin();
  const status = String(formData.get("status") ?? "");
  if (!ORDER_STATUSES.includes(status as never)) return;

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as OrderStatus,
      events: {
        create: {
          label: `Status → ${label(status)}`,
          actor: session.name,
        },
      },
    },
    select: { orderNumber: true },
  });

  revalidatePath(`/admin/orders/${order.orderNumber}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function updatePaymentStatus(orderId: string, formData: FormData) {
  const session = await requireAdmin();
  const status = String(formData.get("paymentStatus") ?? "");
  if (!PAYMENT_STATUSES.includes(status as never)) return;

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: status as PaymentStatus,
      events: {
        create: {
          label: `Payment marked ${label(status)}`,
          detail: "Recorded manually",
          actor: session.name,
        },
      },
    },
    select: { orderNumber: true },
  });

  // A manual "paid" should settle the payment record too, so reconciliation
  // and the customer-facing page agree.
  if (status === "PAID") {
    await prisma.payment.updateMany({
      where: { orderId, status: { in: ["PENDING", "AWAITING_APPROVAL"] } },
      data: { status: "PAID", completedAt: new Date(), statusMessage: `Confirmed by ${session.name}` },
    });
  }

  revalidatePath(`/admin/orders/${order.orderNumber}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function addOrderNote(orderId: string, formData: FormData) {
  const session = await requireAdmin();
  const note = String(formData.get("note") ?? "").trim();
  if (!note) return;

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      adminNote: note,
      events: { create: { label: "Note added", detail: note, actor: session.name } },
    },
    select: { orderNumber: true },
  });

  revalidatePath(`/admin/orders/${order.orderNumber}`);
}
