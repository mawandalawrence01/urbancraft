"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import {
  Wallet3, Truck, Bank, InfoCircle, Warning2, ArrowRight2, ShieldTick,
} from "iconsax-reactjs";

import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartProvider";
import { placeOrder, type CheckoutState } from "@/lib/actions/checkout";
import { cn, detectNetwork, formatUGX } from "@/lib/utils";
import type { BankSettings } from "@/lib/settings";

type Zone = { id: string; name: string; fee: number; etaNote: string | null };

const METHODS = [
  {
    value: "MOBILE_MONEY", label: "Mobile Money", Icon: Wallet3,
    blurb: "MTN or Airtel. You approve the payment on your phone.",
  },
  {
    value: "CASH_ON_DELIVERY", label: "Pay on delivery", Icon: Truck,
    blurb: "Pay our driver when the piece arrives.",
  },
  {
    value: "BANK_DEPOSIT", label: "Bank deposit", Icon: Bank,
    blurb: "Deposit to our account and send us the reference.",
  },
] as const;

export function CheckoutForm({
  zones, bank, momoAvailable,
}: {
  zones: Zone[];
  bank: BankSettings;
  momoAvailable: boolean;
}) {
  const { lines, subtotal, ready } = useCart();
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, {});

  const [zoneId, setZoneId] = useState(zones[0]?.id ?? "");
  const [method, setMethod] = useState<string>(momoAvailable ? "MOBILE_MONEY" : "CASH_ON_DELIVERY");
  const [phone, setPhone] = useState("");
  const [momoPhone, setMomoPhone] = useState("");

  const zone = zones.find((z) => z.id === zoneId) ?? zones[0];
  const deliveryFee = zone?.fee ?? 0;
  const total = subtotal + deliveryFee;
  const network = detectNetwork(momoPhone || phone);

  // Surface the first invalid field rather than leaving the user hunting
  useEffect(() => {
    if (!state.fieldErrors) return;
    const first = Object.keys(state.fieldErrors)[0];
    document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }, [state]);

  const payload = useMemo(
    () =>
      JSON.stringify(
        lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId ?? null,
          quantity: l.quantity,
        })),
      ),
    [lines],
  );

  if (ready && lines.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-line bg-paper px-6 py-14 text-center">
        <h2 className="font-display text-lg font-semibold">Your cart is empty</h2>
        <p className="mx-auto mt-2 max-w-sm text-[0.9rem] text-muted">
          Add a piece before checking out.
        </p>
        <Link href="/shop" className="mt-5 inline-flex items-center gap-1 text-tan-2 hover:underline">
          Browse the catalogue <ArrowRight2 size={15} />
        </Link>
      </div>
    );
  }

  const err = (name: string) => state.fieldErrors?.[name];

  return (
    <form action={action} className="mt-8 lg:flex lg:items-start lg:gap-10">
      <input type="hidden" name="lines" value={payload} />

      <div className="min-w-0 flex-1 space-y-8">
        {state.error && (
          <p className="flex items-start gap-2.5 rounded-xl bg-danger-soft px-4 py-3 text-[0.88rem] text-danger">
            <Warning2 size={18} className="mt-0.5 shrink-0" /> {state.error}
          </p>
        )}

        {/* ------------------------------------------------------- contact */}
        <section>
          <SectionTitle step={1}>Who is this for?</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" name="contactName" error={err("contactName")} required
                   autoComplete="name" placeholder="Jane Nakato" />
            <Field
              label="Phone number" name="contactPhone" error={err("contactPhone")} required
              type="tel" inputMode="tel" autoComplete="tel" placeholder="0772 123 456"
              value={phone} onChange={setPhone}
              hint="We call this number to confirm your order."
            />
            <div className="sm:col-span-2">
              <Field label="Email (optional)" name="contactEmail" error={err("contactEmail")}
                     type="email" autoComplete="email" placeholder="you@example.com" />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ delivery */}
        <section>
          <SectionTitle step={2}>Where are we delivering?</SectionTitle>

          <fieldset className="mb-4">
            <legend className="sr-only">Delivery area</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {zones.map((z) => (
                <label
                  key={z.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition",
                    z.id === zoneId ? "border-ink bg-sand" : "border-line bg-paper hover:border-ink-3",
                  )}
                >
                  <input
                    type="radio" name="deliveryZoneId" value={z.id}
                    checked={z.id === zoneId} onChange={() => setZoneId(z.id)}
                    className="mt-1 accent-[var(--color-tan)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-[0.9rem] font-medium">{z.name}</span>
                      <span className="tabular shrink-0 text-[0.85rem] font-medium">
                        {z.fee === 0 ? "Free" : formatUGX(z.fee)}
                      </span>
                    </span>
                    {z.etaNote && (
                      <span className="mt-0.5 block text-[0.78rem] text-muted">{z.etaNote}</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
            {err("deliveryZoneId") && <ErrorText>{err("deliveryZoneId")}</ErrorText>}
          </fieldset>

          <div className="grid gap-4">
            <Field label="Street / plot / building" name="deliveryLine1" required
                   error={err("deliveryLine1")} autoComplete="address-line1"
                   placeholder="Plot 24, Bukoto Street" />
            <Field label="Nearest landmark (optional)" name="deliveryLandmark"
                   error={err("deliveryLandmark")}
                   placeholder="Opposite Cafe Javas"
                   hint="Landmarks get our driver to you faster than an address." />
          </div>
        </section>

        {/* ------------------------------------------------------- payment */}
        <section>
          <SectionTitle step={3}>How would you like to pay?</SectionTitle>

          <fieldset>
            <legend className="sr-only">Payment method</legend>
            <div className="space-y-2">
              {METHODS.map(({ value, label, Icon, blurb }) => {
                const disabled = value === "MOBILE_MONEY" && !momoAvailable;
                return (
                  <label
                    key={value}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 transition",
                      disabled
                        ? "cursor-not-allowed border-line bg-sand/50 opacity-60"
                        : "cursor-pointer",
                      !disabled && value === method
                        ? "border-ink bg-sand"
                        : !disabled && "border-line bg-paper hover:border-ink-3",
                    )}
                  >
                    <input
                      type="radio" name="paymentMethod" value={value}
                      checked={value === method} disabled={disabled}
                      onChange={() => setMethod(value)}
                      className="mt-1 accent-[var(--color-tan)]"
                    />
                    <Icon size={21} className="mt-0.5 shrink-0 text-tan" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{label}</span>
                      <span className="mt-0.5 block text-[0.83rem] leading-relaxed text-muted">
                        {disabled ? "Not configured on this site yet." : blurb}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {method === "MOBILE_MONEY" && (
            <div className="mt-4 rounded-xl border border-line bg-paper p-4">
              <Field
                label="Mobile money number" name="momoPhone" error={err("momoPhone")}
                type="tel" inputMode="tel" placeholder={phone || "0772 123 456"}
                value={momoPhone} onChange={setMomoPhone}
                hint={
                  network
                    ? `Detected ${network}. You will get a prompt to approve ${formatUGX(total)}.`
                    : "Leave blank to charge the number above."
                }
              />
            </div>
          )}

          {method === "BANK_DEPOSIT" && bank.accountNumber && (
            <dl className="mt-4 space-y-1.5 rounded-xl border border-line bg-paper p-4 text-[0.87rem]">
              {[
                ["Bank", bank.bankName],
                ["Account name", bank.accountName],
                ["Account number", bank.accountNumber],
                ["Branch", bank.branch],
              ]
                .filter(([, v]) => Boolean(v))
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-muted">{k}</dt>
                    <dd className="tabular text-right font-medium">{v}</dd>
                  </div>
                ))}
              {bank.instructions && (
                <p className="pt-2 text-[0.82rem] leading-relaxed text-muted">{bank.instructions}</p>
              )}
            </dl>
          )}
        </section>

        <section>
          <SectionTitle step={4}>Anything we should know?</SectionTitle>
          <textarea
            name="customerNote" rows={3}
            placeholder="Colour preference, timber, exact dimensions, delivery timing…"
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-[0.92rem] outline-none transition focus:border-tan"
          />
        </section>
      </div>

      {/* --------------------------------------------------------- summary */}
      <aside className="mt-8 lg:sticky lg:top-24 lg:mt-0 lg:w-80 lg:shrink-0">
        <div className="rounded-2xl border border-line bg-paper p-5">
          <h2 className="font-display text-lg font-semibold">Your order</h2>

          <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto">
            {lines.map((l) => (
              <li key={`${l.productId}:${l.variantId ?? ""}`} className="flex gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-sand">
                  {l.imageUrl && <Image src={l.imageUrl} alt="" fill sizes="56px" className="object-cover" />}
                  <span className="tabular absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-ink text-[0.62rem] font-semibold text-cream">
                    {l.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[0.83rem] font-medium leading-snug">{l.name}</p>
                  {l.variantName && <p className="text-[0.75rem] text-tan-2">{l.variantName}</p>}
                </div>
                <span className="tabular shrink-0 text-[0.83rem]">
                  {formatUGX(l.unitPrice * l.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[0.9rem]">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular">{formatUGX(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd className="tabular">{deliveryFee === 0 ? "Free" : formatUGX(deliveryFee)}</dd>
            </div>
          </dl>

          <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
            <span className="font-medium">Total</span>
            <span className="tabular font-display text-xl font-semibold">{formatUGX(total)}</span>
          </div>

          <Button type="submit" size="lg" className="mt-5 w-full" disabled={pending || !ready}>
            {pending ? "Placing your order…" : `Place order · ${formatUGX(total)}`}
          </Button>

          <p className="mt-3 flex items-start gap-2 text-[0.78rem] leading-relaxed text-muted">
            <ShieldTick size={15} className="mt-0.5 shrink-0 text-success" />
            Prices are re-checked on our server before anything is charged.
          </p>
        </div>
      </aside>
    </form>
  );
}

function SectionTitle({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-2.5 font-display text-lg font-semibold">
      <span className="tabular grid size-7 shrink-0 place-items-center rounded-full bg-ink text-[0.75rem] text-cream">
        {step}
      </span>
      {children}
    </h2>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[0.8rem] text-danger">
      <Warning2 size={14} /> {children}
    </p>
  );
}

function Field({
  label, name, error, hint, value, onChange, ...props
}: {
  label: string; name: string; error?: string; hint?: string;
  value?: string; onChange?: (v: string) => void;
} & Omit<React.ComponentProps<"input">, "value" | "onChange" | "name">) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.83rem] font-medium">{label}</span>
      <input
        name={name}
        {...(onChange ? { value, onChange: (e) => onChange(e.target.value) } : {})}
        {...props}
        aria-invalid={error ? true : undefined}
        className={cn(
          "w-full rounded-xl border bg-paper px-4 py-3 text-[0.92rem] outline-none transition",
          error ? "border-danger" : "border-line focus:border-tan",
        )}
      />
      {error ? (
        <ErrorText>{error}</ErrorText>
      ) : hint ? (
        <span className="mt-1.5 flex items-start gap-1.5 text-[0.78rem] text-muted">
          <InfoCircle size={13} className="mt-0.5 shrink-0" /> {hint}
        </span>
      ) : null}
    </label>
  );
}
