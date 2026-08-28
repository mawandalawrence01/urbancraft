"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Filter, CloseSquare, TickSquare } from "iconsax-reactjs";
import { Button } from "@/components/ui/Button";
import { cn, formatUGX } from "@/lib/utils";
import type { SortKey } from "@/lib/catalog";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Recommended" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

export type FilterProps = {
  bounds: { min: number; max: number };
  categories?: { slug: string; name: string; count: number }[];
  activeCategory?: string;
  total: number;
};

export function Filters({ bounds, categories = [], activeCategory, total }: FilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const sort = (params.get("sort") as SortKey) ?? "featured";
  const min = Number(params.get("min") ?? bounds.min);
  const max = Number(params.get("max") ?? bounds.max);
  const inStock = params.get("stock") === "1";

  const [draftMin, setDraftMin] = useState(min);
  const [draftMax, setDraftMax] = useState(max);

  useEffect(() => { setDraftMin(min); setDraftMax(max); }, [min, max]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function apply(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    sp.delete("page"); // a changed filter invalidates the current page number
    router.push(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  const activeCount =
    (params.get("min") ? 1 : 0) + (params.get("max") ? 1 : 0) + (inStock ? 1 : 0);

  const panel = (
    <div className="space-y-7">
      {categories.length > 0 && (
        <section>
          <h3 className="mb-3 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-muted">
            Category
          </h3>
          <ul className="space-y-0.5">
            {categories.map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  onClick={() => { setOpen(false); router.push(`/c/${c.slug}`); }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-[0.88rem] transition hover:bg-sand",
                    activeCategory === c.slug && "bg-sand font-medium",
                  )}
                >
                  {c.name}
                  <span className="tabular text-xs text-muted">{c.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="mb-3 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-muted">
          Price
        </h3>
        <div className="flex items-center gap-2">
          <label className="flex-1">
            <span className="sr-only">Minimum price</span>
            <input
              type="number" inputMode="numeric" value={draftMin} min={bounds.min} max={bounds.max}
              onChange={(e) => setDraftMin(Number(e.target.value))}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-[0.85rem] outline-none focus:border-tan"
            />
          </label>
          <span className="text-muted">–</span>
          <label className="flex-1">
            <span className="sr-only">Maximum price</span>
            <input
              type="number" inputMode="numeric" value={draftMax} min={bounds.min} max={bounds.max}
              onChange={(e) => setDraftMax(Number(e.target.value))}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-[0.85rem] outline-none focus:border-tan"
            />
          </label>
        </div>
        <p className="mt-2 text-[0.75rem] text-muted">
          Catalogue runs {formatUGX(bounds.min)} – {formatUGX(bounds.max)}
        </p>
        <Button
          size="sm" variant="outline" className="mt-3 w-full"
          onClick={() => {
            setOpen(false);
            apply({
              min: draftMin > bounds.min ? String(draftMin) : null,
              max: draftMax < bounds.max ? String(draftMax) : null,
            });
          }}
        >
          Apply price
        </Button>
      </section>

      <section>
        <button
          type="button"
          onClick={() => { setOpen(false); apply({ stock: inStock ? null : "1" }); }}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-[0.88rem] transition hover:bg-sand"
        >
          <TickSquare
            size={19}
            variant={inStock ? "Bold" : "Linear"}
            className={inStock ? "text-tan" : "text-muted"}
          />
          Ready to deliver only
        </button>
      </section>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => { setOpen(false); apply({ min: null, max: null, stock: null }); }}
          className="text-[0.85rem] text-tan-2 underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Sticky control bar — the only filter affordance on mobile */}
      <div className="sticky top-16 z-20 -mx-4 mb-6 flex items-center gap-2 border-b border-line bg-cream/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-18 lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-[0.85rem] lg:hidden"
        >
          <Filter size={17} />
          Filter
          {activeCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-tan text-[0.65rem] font-semibold text-white">
              {activeCount}
            </span>
          )}
        </button>

        <p className="tabular hidden text-[0.85rem] text-muted lg:block">
          {total} {total === 1 ? "piece" : "pieces"}
        </p>

        <label className="ml-auto flex items-center gap-2">
          <span className="sr-only">Sort products</span>
          <select
            value={sort}
            onChange={(e) => apply({ sort: e.target.value === "featured" ? null : e.target.value })}
            className="rounded-full border border-line bg-paper px-3 py-2 text-[0.85rem] outline-none focus:border-tan"
          >
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
      </div>

      {/* Desktop rail */}
      <aside className="hidden w-56 shrink-0 lg:block">{panel}</aside>

      {/* Mobile sheet */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button" aria-label="Close filters" onClick={() => setOpen(false)}
            className="absolute inset-0 animate-fade-in bg-ink/40"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] animate-sheet-up overflow-y-auto rounded-t-2xl bg-cream">
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-cream px-4 py-4">
              <h2 className="font-display text-lg font-semibold">Filter</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close filters">
                <CloseSquare size={22} />
              </button>
            </div>
            <div className="px-4 py-5">{panel}</div>
            <div
              className="sticky bottom-0 border-t border-line bg-cream p-4"
              style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
            >
              <Button className="w-full" size="lg" onClick={() => setOpen(false)}>
                Show {total} {total === 1 ? "piece" : "pieces"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
