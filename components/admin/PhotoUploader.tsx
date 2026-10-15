"use client";

import { useActionState, useRef } from "react";
import { Add, Warning2 } from "iconsax-reactjs";

import { Button } from "@/components/ui/Button";

type UploadState = { ok?: boolean; error?: string };

/**
 * The one way photos get into the site.
 *
 * Picking a file submits immediately — on a phone the extra "upload" tap after
 * the camera roll closes is the step people miss, and this admin is used from
 * an iPhone more often than a desktop.
 */
export function PhotoUploader({
  action,
  label = "Add photos",
  busyLabel = "Uploading…",
  hint = "JPEG, PNG or WebP up to 12MB each. We resize and convert automatically.",
  multiple = true,
  disabled = false,
  className,
}: {
  action: (prev: UploadState, formData: FormData) => Promise<UploadState>;
  label?: string;
  busyLabel?: string;
  hint?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState<UploadState, FormData>(action, {});
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (disabled) {
    return (
      <p className="rounded-lg bg-warn-soft px-3 py-2.5 text-[0.78rem] leading-relaxed text-warn">
        Photo storage is not connected. Add the Cloudinary keys to enable uploads.
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} className={className}>
      <input
        ref={inputRef}
        type="file"
        name="images"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(e) => {
          if (e.currentTarget.files?.length) formRef.current?.requestSubmit();
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
      >
        <Add size={16} /> {pending ? busyLabel : label}
      </Button>

      {state.error && (
        <p className="mt-2 flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2 text-[0.8rem] text-danger">
          <Warning2 size={15} className="mt-0.5 shrink-0" /> {state.error}
        </p>
      )}

      {hint && <p className="mt-2 text-[0.75rem] leading-relaxed text-muted">{hint}</p>}
    </form>
  );
}
