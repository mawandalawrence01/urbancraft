"use client";

import { useActionState } from "react";
import { TickCircle, Warning2 } from "iconsax-reactjs";

import { Button } from "@/components/ui/Button";
import { submitDesignBrief, type DesignBriefState } from "@/lib/actions/design";
import { BUDGET_BANDS, SPACE_TYPES, TIMELINES } from "@/lib/design-options";
import { cn } from "@/lib/utils";

export type ServiceOption = { slug: string; name: string };

export function DesignBriefForm({
  services,
  defaultService = "",
}: {
  services: ServiceOption[];
  defaultService?: string;
}) {
  const [state, action, pending] = useActionState<DesignBriefState, FormData>(
    submitDesignBrief,
    {},
  );

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-success/25 bg-success-soft p-8 text-center">
        <TickCircle size={34} variant="Bold" className="mx-auto text-success" />
        <h2 className="mt-3 font-display text-lg font-semibold">Brief received</h2>
        <p className="mx-auto mt-2 max-w-sm text-[0.9rem] leading-relaxed text-ink-3">
          We will call you to arrange the site survey, usually the same working day. Nothing is
          charged until you have seen a drawing and a price.
        </p>
      </div>
    );
  }

  const err = (n: string) => state.fieldErrors?.[n];

  return (
    <form action={action} className="space-y-4">
      {/* honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] size-px opacity-0"
      />

      {state.error && (
        <p className="flex items-center gap-2 rounded-xl bg-danger-soft px-4 py-3 text-[0.88rem] text-danger">
          <Warning2 size={17} /> {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="name" error={err("name")} required autoComplete="name" />
        <Field
          label="Phone number"
          name="phone"
          error={err("phone")}
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0772 123 456"
        />
      </div>

      <Field
        label="Email (optional)"
        name="email"
        error={err("email")}
        type="email"
        autoComplete="email"
      />

      <Select
        label="What are we fitting out?"
        name="serviceSlug"
        error={err("serviceSlug")}
        defaultValue={defaultService}
      >
        <option value="">Not sure yet — advise me</option>
        {services.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.name}
          </option>
        ))}
      </Select>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Kind of space" name="spaceType" error={err("spaceType")} required>
          <option value="">Choose one</option>
          {SPACE_TYPES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select label="When do you need it?" name="timeline" error={err("timeline")} required>
          <option value="">Choose one</option>
          {TIMELINES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      <Select
        label="Rough budget"
        name="budgetBand"
        error={err("budgetBand")}
        hint="A range is enough. It tells us which timbers and finishes to draw."
        required
      >
        <option value="">Choose one</option>
        {BUDGET_BANDS.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </Select>

      <label className="block">
        <span className="mb-1.5 block text-[0.83rem] font-medium">Tell us about the space</span>
        <textarea
          name="message"
          rows={6}
          required
          placeholder="Room sizes if you know them, how many rooms, what is there now, and anything you have already decided."
          className={cn(
            "w-full rounded-xl border bg-paper px-4 py-3 text-[0.92rem] outline-none transition",
            err("message") ? "border-danger" : "border-line focus:border-tan",
          )}
        />
        {err("message") && (
          <span className="mt-1.5 flex items-center gap-1.5 text-[0.8rem] text-danger">
            <Warning2 size={14} /> {err("message")}
          </span>
        )}
      </label>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Send the brief"}
      </Button>
      <p className="text-[0.78rem] leading-relaxed text-muted">
        The survey and the drawing are free. You only pay once you have approved a price.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  ...props
}: { label: string; name: string; error?: string } & React.ComponentProps<"input">) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.83rem] font-medium">{label}</span>
      <input
        name={name}
        {...props}
        aria-invalid={error ? true : undefined}
        className={cn(
          "w-full rounded-xl border bg-paper px-4 py-3 text-[0.92rem] outline-none transition",
          error ? "border-danger" : "border-line focus:border-tan",
        )}
      />
      {error && (
        <span className="mt-1.5 flex items-center gap-1.5 text-[0.8rem] text-danger">
          <Warning2 size={14} /> {error}
        </span>
      )}
    </label>
  );
}

function Select({
  label,
  name,
  error,
  hint,
  children,
  ...props
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
} & React.ComponentProps<"select">) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.83rem] font-medium">{label}</span>
      <select
        name={name}
        {...props}
        aria-invalid={error ? true : undefined}
        className={cn(
          "w-full appearance-none rounded-xl border bg-paper px-4 py-3 text-[0.92rem] outline-none transition",
          error ? "border-danger" : "border-line focus:border-tan",
        )}
      >
        {children}
      </select>
      {error ? (
        <span className="mt-1.5 flex items-center gap-1.5 text-[0.8rem] text-danger">
          <Warning2 size={14} /> {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-[0.78rem] text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
