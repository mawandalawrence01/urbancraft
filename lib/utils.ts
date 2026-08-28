import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** UGX has no minor unit, so amounts are whole shillings throughout. */
export function formatUGX(amount: number, opts: { compact?: boolean } = {}) {
  if (opts.compact && amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `UGX ${m % 1 === 0 ? m : m.toFixed(1)}M`;
  }
  return `UGX ${Math.round(amount).toLocaleString("en-UG")}`;
}

export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Normalises Ugandan numbers to the MSISDN form Yo! expects: 256XXXXXXXXX.
 * Accepts 0772…, +256772…, 256772…, and spaced or dashed variants.
 */
export function toMsisdn(input: string): string | null {
  const digits = input.replace(/[^\d]/g, "");
  let n = digits;
  if (n.startsWith("256")) n = n.slice(3);
  else if (n.startsWith("0")) n = n.slice(1);
  if (n.length !== 9) return null;
  if (!/^[37]/.test(n)) return null;
  return `256${n}`;
}

export function formatPhone(msisdnOrLocal: string) {
  const m = toMsisdn(msisdnOrLocal);
  if (!m) return msisdnOrLocal;
  return `+${m.slice(0, 3)} ${m.slice(3, 6)} ${m.slice(6)}`;
}

/** MTN and Airtel prefixes, used to label the payment prompt. */
export function detectNetwork(msisdn: string): "MTN" | "AIRTEL" | null {
  const m = toMsisdn(msisdn);
  if (!m) return null;
  const p = m.slice(3, 6);
  if (/^(77|78|76|39)/.test(p)) return "MTN";
  if (/^(70|75|74|20)/.test(p)) return "AIRTEL";
  return null;
}

export function orderNumber() {
  // Short, human-readable, and unambiguous over the phone (no O/I/0/1).
  const alphabet = "23456789ACDEFGHJKLMNPQRSTUVWXYZ";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `UC-${s}`;
}

export function truncate(s: string, n: number) {
  return s.length <= n ? s : `${s.slice(0, n).replace(/\s+\S*$/, "")}…`;
}

export function formatDate(d: Date | string, style: "short" | "long" = "short") {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-UG", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
    ...(style === "long" ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function discountPercent(price: number, compareAt?: number | null) {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
