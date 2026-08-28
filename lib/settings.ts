import { prisma } from "@/lib/db";
import { cache } from "react";

export type ContactSettings = {
  phone: string; whatsapp: string; altPhone?: string; email: string;
  address: string; mapUrl?: string; hours: string[];
};
export type HeroSettings = {
  eyebrow: string; title: string; body: string; ctaLabel: string; ctaHref: string;
};
export type BankSettings = {
  bankName: string; accountName: string; accountNumber: string;
  branch?: string; instructions?: string;
};
export type AnnouncementSettings = { enabled: boolean; text: string };
export type DepositSettings = { percent: number; note: string };

const FALLBACKS = {
  "site.contact": {
    phone: "+256 784 201 141", whatsapp: "+256784201141",
    email: "hello@urbancraft.co.ug", address: "Kawempe Division, Kampala, Uganda",
    hours: ["Monday – Friday · 8:00am – 6:30pm", "Saturday · 9:30am – 6:30pm"],
  } satisfies ContactSettings,
  "site.hero": {
    eyebrow: "Made to order in Kampala",
    title: "Furniture built to outlast the room it is bought for",
    body: "Choose the timber, the finish and the dimensions.",
    ctaLabel: "Shop the catalogue", ctaHref: "/shop",
  } satisfies HeroSettings,
  "site.announcement": { enabled: false, text: "" } satisfies AnnouncementSettings,
  "payments.bank": {
    bankName: "", accountName: "", accountNumber: "",
  } satisfies BankSettings,
  "checkout.deposit": { percent: 50, note: "" } satisfies DepositSettings,
} as const;

type Keys = keyof typeof FALLBACKS;

/** Cached per request so a page rendering several sections hits the DB once. */
export const getSettings = cache(async (): Promise<Record<Keys, unknown>> => {
  try {
    const rows = await prisma.setting.findMany();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...FALLBACKS, ...map } as Record<Keys, unknown>;
  } catch {
    return { ...FALLBACKS } as Record<Keys, unknown>;
  }
});

export async function getSetting<T>(key: Keys): Promise<T> {
  const all = await getSettings();
  return (all[key] ?? FALLBACKS[key]) as T;
}
