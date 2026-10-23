"use client";

import { useRef } from "react";

/**
 * Re-file one photograph.
 *
 * A select that submits on change rather than a select plus a button: on a
 * phone the picker already takes a deliberate tap to confirm, and a second
 * "Move" tap below it is the one people forget.
 */
export function MoveToGallery({
  action,
  services,
}: {
  action: (formData: FormData) => void;
  services: { id: string; name: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action}>
      <label className="sr-only" htmlFor="move-target">
        Move this photo to another gallery
      </label>
      <select
        id="move-target"
        name="serviceId"
        defaultValue=""
        onChange={(e) => {
          if (e.currentTarget.value) formRef.current?.requestSubmit();
        }}
        className="h-11 w-full rounded-lg border border-line bg-paper px-2 text-[0.78rem] text-muted sm:h-9"
      >
        <option value="">Move to…</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </form>
  );
}
