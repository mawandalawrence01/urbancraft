import { revalidatePath } from "next/cache";
import { TickCircle } from "iconsax-reactjs";

import { Button } from "@/components/ui/Button";
import { Card, Field, PageHeader, inputClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getSetting, type AnnouncementSettings, type BankSettings,
  type ContactSettings, type DepositSettings, type HeroSettings,
} from "@/lib/settings";
import { isConfigured } from "@/lib/yo";
import { uploadsConfigured } from "@/lib/uploads";

type SearchParams = Promise<{ saved?: string }>;

async function save(formData: FormData) {
  "use server";
  await requireAdmin();

  const str = (k: string) => String(formData.get(k) ?? "").trim();
  const lines = (k: string) =>
    String(formData.get(k) ?? "").split("\n").map((l) => l.trim()).filter(Boolean);

  const values: Record<string, unknown> = {
    "site.contact": {
      phone: str("phone"), whatsapp: str("whatsapp"), altPhone: str("altPhone"),
      email: str("email"), address: str("address"), mapUrl: str("mapUrl"),
      hours: lines("hours"),
    },
    "site.hero": {
      eyebrow: str("heroEyebrow"), title: str("heroTitle"), body: str("heroBody"),
      ctaLabel: str("heroCtaLabel") || "Shop the catalogue",
      ctaHref: str("heroCtaHref") || "/shop",
    },
    "site.announcement": {
      enabled: formData.get("announcementEnabled") === "on",
      text: str("announcementText"),
    },
    "payments.bank": {
      bankName: str("bankName"), accountName: str("accountName"),
      accountNumber: str("accountNumber"), branch: str("branch"),
      instructions: str("bankInstructions"),
    },
    "checkout.deposit": {
      percent: Number(formData.get("depositPercent") ?? 50) || 50,
      note: str("depositNote"),
    },
  };

  for (const [key, value] of Object.entries(values)) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value: value as never },
      update: { value: value as never },
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

export default async function SettingsPage({ searchParams }: { searchParams: SearchParams }) {
  const { saved } = await searchParams;
  const [contact, hero, announcement, bank, deposit] = await Promise.all([
    getSetting<ContactSettings>("site.contact"),
    getSetting<HeroSettings>("site.hero"),
    getSetting<AnnouncementSettings>("site.announcement"),
    getSetting<BankSettings>("payments.bank"),
    getSetting<DepositSettings>("checkout.deposit"),
  ]);

  return (
    <>
      <PageHeader title="Settings" subtitle="Content and configuration used across the site." />

      {saved && (
        <p className="mb-5 flex items-center gap-2 rounded-xl bg-success-soft px-4 py-3 text-[0.88rem] text-success">
          <TickCircle size={17} variant="Bold" /> Settings saved.
        </p>
      )}

      <form action={save} className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <Card className="space-y-4 p-5">
          <h2 className="font-display font-semibold">Contact details</h2>
          <Field label="Main phone"><input name="phone" defaultValue={contact.phone} className={inputClass} /></Field>
          <Field label="Second phone"><input name="altPhone" defaultValue={contact.altPhone ?? ""} className={inputClass} /></Field>
          <Field label="WhatsApp number" hint="Digits only, with country code — 256784201141">
            <input name="whatsapp" defaultValue={contact.whatsapp} className={inputClass} />
          </Field>
          <Field label="Email"><input name="email" type="email" defaultValue={contact.email} className={inputClass} /></Field>
          <Field label="Address"><input name="address" defaultValue={contact.address} className={inputClass} /></Field>
          <Field label="Google Maps link"><input name="mapUrl" defaultValue={contact.mapUrl ?? ""} className={inputClass} /></Field>
          <Field label="Opening hours" hint="One line per row.">
            <textarea name="hours" rows={4} defaultValue={(contact.hours ?? []).join("\n")} className={inputClass} />
          </Field>
        </Card>

        <div className="space-y-5">
          <Card className="space-y-4 p-5">
            <h2 className="font-display font-semibold">Home page hero</h2>
            <Field label="Eyebrow"><input name="heroEyebrow" defaultValue={hero.eyebrow} className={inputClass} /></Field>
            <Field label="Headline"><input name="heroTitle" defaultValue={hero.title} className={inputClass} /></Field>
            <Field label="Supporting text">
              <textarea name="heroBody" rows={3} defaultValue={hero.body} className={inputClass} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button label"><input name="heroCtaLabel" defaultValue={hero.ctaLabel} className={inputClass} /></Field>
              <Field label="Button link"><input name="heroCtaHref" defaultValue={hero.ctaHref} className={inputClass} /></Field>
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="font-display font-semibold">Announcement bar</h2>
            <label className="flex items-center gap-2.5 text-[0.88rem]">
              <input type="checkbox" name="announcementEnabled" defaultChecked={announcement.enabled}
                     className="size-4 accent-[var(--color-tan)]" />
              Show the bar at the top of every page
            </label>
            <Field label="Message">
              <input name="announcementText" defaultValue={announcement.text} className={inputClass} />
            </Field>
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="font-display font-semibold">Bank deposit details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Bank"><input name="bankName" defaultValue={bank.bankName} className={inputClass} /></Field>
              <Field label="Branch"><input name="branch" defaultValue={bank.branch ?? ""} className={inputClass} /></Field>
              <Field label="Account name"><input name="accountName" defaultValue={bank.accountName} className={inputClass} /></Field>
              <Field label="Account number"><input name="accountNumber" defaultValue={bank.accountNumber} className={inputClass} /></Field>
            </div>
            <Field label="Instructions to the customer">
              <textarea name="bankInstructions" rows={2} defaultValue={bank.instructions ?? ""} className={inputClass} />
            </Field>
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="font-display font-semibold">Deposit policy</h2>
            <Field label="Deposit percentage" hint="Shown on the checkout page.">
              <input name="depositPercent" type="number" min={0} max={100}
                     defaultValue={deposit.percent} className={inputClass} />
            </Field>
            <Field label="Note">
              <textarea name="depositNote" rows={2} defaultValue={deposit.note} className={inputClass} />
            </Field>
          </Card>

          <Card className="p-5">
            <h2 className="font-display font-semibold">Integrations</h2>
            <ul className="mt-3 space-y-2.5 text-[0.86rem]">
              <li className="flex items-center justify-between gap-3">
                <span>Yo! mobile money</span>
                <span className={isConfigured() ? "text-success" : "text-warn"}>
                  {isConfigured() ? "Connected" : "Not configured"}
                </span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>Image uploads</span>
                <span className={uploadsConfigured() ? "text-success" : "text-warn"}>
                  {uploadsConfigured() ? "Connected" : "Not configured"}
                </span>
              </li>
            </ul>
            <p className="mt-3 text-[0.78rem] leading-relaxed text-muted">
              These are set with environment variables on the server, not here — see the README for
              the exact names.
            </p>
          </Card>

          <Button type="submit" size="lg" className="w-full">Save settings</Button>
        </div>
      </form>
    </>
  );
}
