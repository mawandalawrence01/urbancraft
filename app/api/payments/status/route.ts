import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkStatus, isConfigured } from "@/lib/yo";

/**
 * Polled by the order page while a mobile money prompt is outstanding.
 * The IPN is the source of truth; this is the fallback for when it is delayed
 * or the customer's network never delivers it.
 */
export async function GET(request: Request) {
  const number = new URL(request.url).searchParams.get("order");
  if (!number) return NextResponse.json({ error: "order is required" }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { orderNumber: number.trim().toUpperCase() },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });

  const payment = order.payments[0];
  const settled = order.paymentStatus === "PAID" || order.paymentStatus === "FAILED";

  if (!settled && payment?.method === "MOBILE_MONEY" && isConfigured()) {
    const result = await checkStatus({
      transactionReference: payment.transactionReference ?? undefined,
      externalReference: order.orderNumber,
    });

    if (result.status === "SUCCEEDED" || result.status === "FAILED") {
      const paid = result.status === "SUCCEEDED";
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: paid ? "PAID" : "FAILED",
            statusCode: result.statusCode,
            statusMessage: result.statusMessage,
            mnoReference: result.mnoTransactionReferenceId ?? payment.mnoReference,
            completedAt: paid ? new Date() : null,
            raw: result.raw,
          },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: paid ? "PAID" : "FAILED",
            status: paid && order.status === "PENDING" ? "CONFIRMED" : order.status,
            events: {
              create: {
                label: paid ? "Payment received" : "Payment failed",
                detail: result.statusMessage ?? undefined,
                actor: "Yo! status check",
              },
            },
          },
        }),
      ]);

      return NextResponse.json({ paymentStatus: paid ? "PAID" : "FAILED", settled: true });
    }
  }

  return NextResponse.json({
    paymentStatus: order.paymentStatus,
    orderStatus: order.status,
    settled,
  });
}
