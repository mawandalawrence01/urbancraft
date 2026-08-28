import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyIpnSignature } from "@/lib/yo";

/** Yo! transaction failure notification. Must always answer 200. */
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

  if (!verifyIpnSignature(params)) return new NextResponse("OK", { status: 200 });

  const order = await prisma.order.findUnique({ where: { orderNumber: params.external_ref } });
  if (!order) return new NextResponse("OK", { status: 200 });

  await prisma.payment.updateMany({
    where: { orderId: order.id, status: "PENDING", method: "MOBILE_MONEY" },
    data: {
      status: "FAILED",
      statusMessage: params.narrative || "The mobile money payment failed.",
      raw: params,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "FAILED",
      events: {
        create: {
          label: "Payment failed",
          detail: params.narrative || `No approval received from ${params.msisdn}`,
          actor: "Yo! Payments",
        },
      },
    },
  });

  return new NextResponse("OK", { status: 200 });
}
