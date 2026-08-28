"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { SearchNormal1, CloseSquare } from "iconsax-reactjs";
import { formatUGX } from "@/lib/utils";

type Hit = {
  slug: string; name: string; price: number;
  images: { url: string; blurDataUrl: string | null }[];
};

export function SearchSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
    else { setQ(""); setHits([]); }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Debounced so typing does not fire a request per keystroke on a slow connection
  useEffect(() => {
    if (!q.trim()) { setHits([]); return; }
    const controller = new AbortController();
    const t = setTimeout(() => {
      startTransition(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
            signal: controller.signal,
          });
          if (res.ok) setHits(await res.json());
        } catch { /* aborted or offline */ }
      });
    }, 220);
    return () => { clearTimeout(t); controller.abort(); };
  }, [q]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button" aria-label="Close search" onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-ink/40"
      />
      <div className="absolute inset-x-0 top-0 animate-fade-in bg-cream shadow-xl">
        <div className="container-page py-4">
          <form onSubmit={submit} className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-3 rounded-full border border-line bg-paper px-4">
              <SearchNormal1 size={19} className="shrink-0 text-muted" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search sofas, beds, TV stands…"
                className="h-12 flex-1 bg-transparent outline-none placeholder:text-muted"
                type="search"
                enterKeyHint="search"
                autoComplete="off"
              />
            </div>
            <button
              type="button" onClick={onClose}
              className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-sand"
              aria-label="Close search"
            >
              <CloseSquare size={22} />
            </button>
          </form>

          <div className="max-h-[65vh] overflow-y-auto overscroll-contain pt-2">
            {q.trim() && hits.length === 0 && !pending && (
              <p className="px-1 py-6 text-sm text-muted">
                Nothing matched “{q}”. Try a room, a material, or a piece — “oak”, “6 seater”, “wall unit”.
              </p>
            )}

            {hits.map((hit) => (
              <Link
                key={hit.slug}
                href={`/product/${hit.slug}`}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-1 py-2 transition hover:bg-sand"
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-sand">
                  {hit.images[0] && (
                    <Image
                      src={hit.images[0].url} alt="" fill sizes="56px"
                      className="object-cover"
                      placeholder={hit.images[0].blurDataUrl ? "blur" : "empty"}
                      blurDataURL={hit.images[0].blurDataUrl ?? undefined}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.9rem] font-medium">{hit.name}</p>
                  <p className="tabular text-[0.82rem] text-tan-2">{formatUGX(hit.price)}</p>
                </div>
              </Link>
            ))}

            {q.trim() && hits.length > 0 && (
              <button
                type="button" onClick={submit as never}
                className="mt-1 w-full rounded-xl py-3 text-center text-[0.85rem] font-medium text-tan-2 hover:bg-sand"
              >
                See all results for “{q}”
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
