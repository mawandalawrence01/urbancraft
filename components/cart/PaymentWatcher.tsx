"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Polls while a mobile money prompt is outstanding. The IPN normally lands
 * first; this covers the case where it is slow or never arrives.
 */
export function PaymentWatcher({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const tick = async () => {
      if (cancelled) return;
      attempts++;
      try {
        const res = await fetch(`/api/payments/status?order=${orderNumber}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.settled) { router.refresh(); return; }
        }
      } catch { /* offline — try again on the next tick */ }

      setElapsed(attempts * 5);
      // Approvals rarely take more than three minutes; stop rather than poll forever.
      if (attempts < 36) setTimeout(tick, 5000);
    };

    const t = setTimeout(tick, 5000);
    return () => { cancelled = true; clearTimeout(t); };
  }, [orderNumber, router]);

  return (
    <p className="mt-3 flex items-center gap-2 text-[0.8rem] text-muted">
      <span className="size-2 animate-pulse rounded-full bg-warn" />
      {elapsed >= 180
        ? "Still waiting. If you did not get a prompt, call us and we will sort it out."
        : "Waiting for your approval…"}
    </p>
  );
}
