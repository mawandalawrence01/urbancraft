import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { orderNumber, toMsisdn } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/generated/prisma/enums";

export const cartLineSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullish(),
  quantity: z.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  contactName: z.string().trim().min(2, "Enter the name we should deliver to").max(120),
  contactPhone: z
    .string()
    .trim()
    .refine((v) => toMsisdn(v) !== null, "Enter a valid Ugandan number, e.g. 0772 123 456"),
  contactEmail: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  deliveryZoneId: z.string().min(1, "Choose where we are delivering"),
  deliveryLine1: z.string().trim().min(3, "Enter the delivery address").max(200),
  deliveryLine2: z.string().trim().max(200).optional().or(z.literal("")),
  deliveryLandmark: z.string().trim().max(200).optional().or(z.literal("")),
  paymentMethod: z.enum(["MOBILE_MONEY", "CASH_ON_DELIVERY", "BANK_DEPOSIT"]),
  momoPhone: z.string().trim().optional().or(z.literal("")),
  customerNote: z.string().trim().max(1000).optional().or(z.literal("")),
  lines: z.array(cartLineSchema).min(1, "Your cart is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type PricedLine = {
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  slug: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

/**
 * Re-prices the cart from the database. The browser sends product ids and
 * quantities only — never prices — so a tampered cart cannot change what is
 * charged.
 */
export async function priceCart(lines: z.infer<typeof cartLineSchema>[]) {
  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) }, status: "ACTIVE" },
    select: {
      id: true, slug: true, name: true, price: true,
      images: {
        select: { url: true },
        orderBy: [{ needsReview: "asc" }, { position: "asc" }],
        take: 1,
      },
      variants: { select: { id: true, name: true, price: true } },
    },
  });

  const byId = new Map(products.map((p) => [p.id, p]));
  const priced: PricedLine[] = [];
  const removed: string[] = [];

  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product) {
      removed.push(line.productId);
      continue;
    }
    const variant = line.variantId
      ? (product.variants.find((v) => v.id === line.variantId) ?? null)
      : null;
    const unitPrice = variant?.price ?? product.price;

    priced.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      name: product.name,
      variantName: variant?.name ?? null,
      slug: product.slug,
      imageUrl: product.images[0]?.url ?? null,
      unitPrice,
      quantity: line.quantity,
      lineTotal: unitPrice * line.quantity,
    });
  }

  const subtotal = priced.reduce((n, l) => n + l.lineTotal, 0);
  return { lines: priced, subtotal, removed };
}

export async function getDeliveryZones() {
  return prisma.deliveryZone.findMany({
    where: { isActive: true },
    orderBy: { position: "asc" },
  });
}

export async function createOrder(input: CheckoutInput) {
  const { lines: priced, subtotal, removed } = await priceCart(input.lines);
  if (priced.length === 0) throw new Error("None of the items in your cart are still available.");

  const zone = await prisma.deliveryZone.findFirst({
    where: { id: input.deliveryZoneId, isActive: true },
  });
  if (!zone) throw new Error("Choose a delivery area.");

  const deliveryFee = zone.fee;
  const total = subtotal + deliveryFee;
  const msisdn = toMsisdn(input.contactPhone)!;

  // Retry on the (vanishingly rare) chance two orders draw the same code
  let order: { id: string; orderNumber: string } | null = null;
  for (let attempt = 0; attempt < 5 && !order; attempt++) {
    const candidate = orderNumber();
    try {
      order = await prisma.order.create({
        data: {
          orderNumber: candidate,
          contactName: input.contactName,
          contactPhone: msisdn,
          contactEmail: input.contactEmail || null,
          deliveryLine1: input.deliveryLine1,
          deliveryLine2: input.deliveryLine2 || null,
          deliveryDistrict: zone.name,
          deliveryLandmark: input.deliveryLandmark || null,
          subtotal,
          deliveryFee,
          total,
          paymentMethod: input.paymentMethod as PaymentMethod,
          customerNote: input.customerNote || null,
          items: {
            create: priced.map((l) => ({
              productId: l.productId,
              variantId: l.variantId,
              name: l.name,
              variantName: l.variantName,
              slug: l.slug,
              imageUrl: l.imageUrl,
              unitPrice: l.unitPrice,
              quantity: l.quantity,
              lineTotal: l.lineTotal,
            })),
          },
          events: {
            create: { label: "Order placed", detail: `${priced.length} item(s) · ${zone.name}` },
          },
        },
        select: { id: true, orderNumber: true },
      });
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== "P2002") throw error; // not a unique-constraint clash
    }
  }
  if (!order) throw new Error("Could not create your order. Please try again.");

  return { ...order, subtotal, deliveryFee, total, removed, zone };
}

export async function getOrderByNumber(number: string, phone?: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: number.trim().toUpperCase() },
    include: {
      items: true,
      payments: { orderBy: { createdAt: "desc" } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) return null;

  // Order numbers are short, so the phone number is what actually authorises
  // access when the link is not opened straight after checkout.
  if (phone) {
    const msisdn = toMsisdn(phone);
    if (!msisdn || msisdn !== order.contactPhone) return null;
  }
  return order;
}
