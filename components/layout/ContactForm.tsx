"use client";

import { useActionState } from "react";
import { TickCircle, Warning2 } from "iconsax-reactjs";
import { Button } from "@/components/ui/Button";
import { submitEnquiry, type EnquiryState } from "@/lib/actions/contact";
import { cn } from "@/lib/utils";

export function ContactForm({ source = "contact" }: { source?: string }) {
  const [state, action, pending] = useActionState<EnquiryState, FormData>(submitEnquiry, {});

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-success/25 bg-success-soft p-8 text-center">
        <TickCircle size={34} variant="Bold" className="mx-auto text-success" />
        <h2 className="mt-3 font-display text-lg font-semibold">Message sent</h2>
        <p className="mx-auto mt-2 max-w-sm text-[0.9rem] leading-relaxed text-ink-3">
          We will call you back, usually the same working day. If it is urgent, ring the workshop
          directly.
        </p>
      </div>
    );
  }

  const err = (n: string) => state.fieldErrors?.[n];

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="source" value={source} />
      {/* honeypot */}
      <input
        type="text" name="company" tabIndex={-1} autoComplete="off"
        aria-hidden className="absolute left-[-9999px] size-px opacity-0"
      />

      {state.error && (
        <p className="flex items-center gap-2 rounded-xl bg-danger-soft px-4 py-3 text-[0.88rem] text-danger">
          <Warning2 size={17} /> {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="name" error={err("name")} required autoComplete="name" />
        <Field label="Phone number" name="phone" error={err("phone")} required
               type="tel" inputMode="tel" autoComplete="tel" placeholder="0772 123 456" />
      </div>
      <Field label="Email (optional)" name="email" error={err("email")} type="email" autoComplete="email" />
      <Field label="What is it about?" name="subject" error={err("subject")}
             placeholder="A 6-seater dining set for a small room" />

      <label className="block">
        <span className="mb-1.5 block text-[0.83rem] font-medium">Tell us more</span>
        <textarea
          name="message" rows={6} required
          placeholder="Dimensions, timber, colour, where it is going, and when you need it."
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
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

function Field({
  label, name, error, ...props
}: { label: string; name: string; error?: string } & React.ComponentProps<"input">) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.83rem] font-medium">{label}</span>
      <input
        name={name} {...props} aria-invalid={error ? true : undefined}
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
