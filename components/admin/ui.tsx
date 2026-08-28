import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHeader({
  title, subtitle, action,
}: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-[0.88rem] text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-line bg-paper", className)}>{children}</div>
  );
}

export function Stat({
  label, value, hint, href, tone = "neutral",
}: {
  label: string; value: string | number; hint?: string; href?: string;
  tone?: "neutral" | "tan" | "success" | "warn";
}) {
  const tones = {
    neutral: "text-ink", tan: "text-tan-2", success: "text-success", warn: "text-warn",
  };
  const body = (
    <>
      <p className="text-[0.78rem] uppercase tracking-[0.1em] text-muted">{label}</p>
      <p className={cn("tabular mt-1.5 font-display text-2xl font-semibold", tones[tone])}>{value}</p>
      {hint && <p className="mt-0.5 text-[0.78rem] text-muted">{hint}</p>}
    </>
  );
  return href ? (
    <Link href={href} className="rounded-2xl border border-line bg-paper p-5 transition hover:border-ink">
      {body}
    </Link>
  ) : (
    <div className="rounded-2xl border border-line bg-paper p-5">{body}</div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-paper px-6 py-14 text-center">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {body && <p className="mx-auto mt-2 max-w-sm text-[0.88rem] text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Field({
  label, hint, error, className, children,
}: {
  label: string; hint?: string; error?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[0.82rem] font-medium">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-[0.78rem] text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-[0.78rem] text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-line bg-cream px-3.5 py-2.5 text-[0.9rem] outline-none transition focus:border-tan";
