import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyIpnSignature } from "@/lib/yo";

/**
 * Yo! Instant Payment Notification.
 *
 * Yo! retries until it receives a 200, so this must be idempotent and must
 * answer 200 even for notifications we choose to ignore — anything else causes
 * an endless retry loop. Duplicates are identified by (network_ref, msisdn),
 * exactly as the spec prescribes.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const get = (k: string) => String(form.get(k) ?? "");

  const params = {
    date_time: get("date_time"),
    amount: get("amount"),
    narrative: get("narrative"),
    network_ref: get("network_ref"),
    external_ref: get("external_ref"),
    msisdn: get("msisdn"),
    signature: get("signature"),
  };

  const verified = verifyIpnSignature(params);
  if (!verified) {
    // Record it, but never act on an unverified notification.
    await prisma.payment.updateMany({
      where: { externalReference: params.external_ref },
      data: { statusMessage: "Received an IPN whose signature did not verify — ignored." },
    });
    return new NextResponse("OK", { status: 200 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber: params.external_ref },
    include: { payments: true },
  });
  if (!order) return new NextResponse("OK", { status: 200 });

  // Idempotency: the same network reference for the same payer is one payment.
  const alreadySeen = order.payments.some(
    (p) => p.mnoReference === params.network_ref && p.msisdn === params.msisdn,
  );
  if (alreadySeen) return new NextResponse("OK", { status: 200 });

  const amount = Math.round(Number(params.amount) || 0);

  await prisma.$transaction(async (tx) => {
    const pending = order.payments.find((p) => p.status === "PENDING" && p.method === "MOBILE_MONEY");

    if (pending) {
      await tx.payment.update({
        where: { id: pending.id },
        data: {
          status: "PAID", amount, mnoReference: params.network_ref,
          msisdn: params.msisdn, completedAt: new Date(),
          statusMessage: "Confirmed by Yo! instant payment notification",
          raw: params,
        },
      });
    } else {
      await tx.payment.create({
        data: {
          orderId: order.id, method: "MOBILE_MONEY", status: "PAID", amount,
          msisdn: params.msisdn, mnoReference: params.network_ref,
          externalReference: `${params.external_ref}-${params.network_ref}`,
          completedAt: new Date(), raw: params,
        },
      });
    }

    const paid = await tx.payment.aggregate({
      where: { orderId: order.id, status: "PAID" },
      _sum: { amount: true },
    });
    const totalPaid = (paid._sum.amount ?? 0) + (pending ? 0 : amount);

    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: totalPaid >= order.total ? "PAID" : "PARTIALLY_PAID",
        status: order.status === "PENDING" ? "CONFIRMED" : order.status,
        events: {
          create: {
            label: "Payment received",
            detail: `UGX ${amount.toLocaleString()} from ${params.msisdn} · ref ${params.network_ref}`,
            actor: "Yo! Payments",
          },
        },
      },
    });
  });

  // Responding with a narrative asks Yo! to text the payer a receipt.
  const body = `narrative=${encodeURIComponent(
    `Thank you. We have received your payment for UrbanCraft order ${order.orderNumber}. We will call you to confirm delivery.`,
  )}`;
  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}
