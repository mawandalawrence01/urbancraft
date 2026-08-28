"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { checkoutSchema, createOrder, priceCart } from "@/lib/orders";
import { requestDeposit, isConfigured } from "@/lib/yo";
import { detectNetwork, toMsisdn } from "@/lib/utils";

export type CheckoutState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured && !configured.includes("localhost")) return configured.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : (configured ?? "");
}

export async function placeOrder(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  let lines: unknown;
  try {
    lines = JSON.parse(String(formData.get("lines") ?? "[]"));
  } catch {
    return { error: "Your cart could not be read. Please reload and try again." };
  }

  const parsed = checkoutSchema.safeParse({
    contactName: formData.get("contactName"),
    contactPhone: formData.get("contactPhone"),
    contactEmail: formData.get("contactEmail") ?? "",
    deliveryZoneId: formData.get("deliveryZoneId"),
    deliveryLine1: formData.get("deliveryLine1"),
    deliveryLine2: formData.get("deliveryLine2") ?? "",
    deliveryLandmark: formData.get("deliveryLandmark") ?? "",
    paymentMethod: formData.get("paymentMethod"),
    momoPhone: formData.get("momoPhone") ?? "",
    customerNote: formData.get("customerNote") ?? "",
    lines,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { error: "Please check the highlighted fields.", fieldErrors };
  }

  const input = parsed.data;

  if (input.paymentMethod === "MOBILE_MONEY") {
    const momo = toMsisdn(input.momoPhone || input.contactPhone);
    if (!momo) {
      return {
        error: "Please check the highlighted fields.",
        fieldErrors: { momoPhone: "Enter the mobile money number to charge" },
      };
    }
  }

  let order: Awaited<ReturnType<typeof createOrder>>;
  try {
    order = await createOrder(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not place your order." };
  }

  // Kick off the mobile money prompt straight away so the customer's handset
  // buzzes while they are still looking at the confirmation screen.
  if (input.paymentMethod === "MOBILE_MONEY") {
    const msisdn = toMsisdn(input.momoPhone || input.contactPhone)!;
    const base = await siteUrl();

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        method: "MOBILE_MONEY",
        amount: order.total,
        msisdn,
        externalReference: order.orderNumber,
        status: "PENDING",
      },
    });

    if (!isConfigured()) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          statusCode: "NOT_CONFIGURED",
          statusMessage: "Mobile money is not configured on this deployment.",
        },
      });
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PENDING",
          events: {
            create: {
              label: "Mobile money unavailable",
              detail: "Gateway credentials are not configured — collect payment another way.",
            },
          },
        },
      });
    } else {
      const result = await requestDeposit({
        msisdn,
        amount: order.total,
        narrative: `UrbanCraft order ${order.orderNumber}`,
        externalReference: order.orderNumber,
        providerCode: detectNetwork(msisdn) === "AIRTEL" ? "AIRTEL_UGANDA" : "MTN_UGANDA",
        instantNotificationUrl: `${base}/api/payments/yo/ipn`,
        failureNotificationUrl: `${base}/api/payments/yo/failure`,
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          transactionReference: result.transactionReference,
          mnoReference: result.mnoTransactionReferenceId,
          statusCode: result.statusCode,
          statusMessage: result.statusMessage,
          status:
            result.status === "SUCCEEDED" ? "PAID"
            : result.status === "FAILED" || result.status === "ERROR" ? "FAILED"
            : "PENDING",
          raw: result.raw,
          completedAt: result.status === "SUCCEEDED" ? new Date() : null,
        },
      });

      if (result.status === "SUCCEEDED") {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            events: { create: { label: "Payment received", detail: `Mobile money · ${msisdn}` } },
          },
        });
      } else {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            events: {
              create: {
                label: result.ok ? "Payment prompt sent" : "Payment could not be started",
                detail: result.statusMessage ?? `Awaiting approval on ${msisdn}`,
              },
            },
          },
        });
      }
    }
  }

  if (input.paymentMethod === "BANK_DEPOSIT") {
    await prisma.payment.create({
      data: {
        orderId: order.id, method: "BANK_DEPOSIT", amount: order.total,
        externalReference: order.orderNumber, status: "AWAITING_APPROVAL",
      },
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "AWAITING_APPROVAL" },
    });
  }

  redirect(`/orders/${order.orderNumber}?new=1`);
}

/** Re-prices the cart so the checkout summary can never disagree with the charge. */
export async function repriceCart(lines: { productId: string; variantId?: string | null; quantity: number }[]) {
  return priceCart(lines);
}
