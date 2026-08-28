import Link from "next/link";
import { ArrowLeft2, ArrowRight2 } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

export function Pagination({
  page, pageCount, basePath, params,
}: {
  page: number; pageCount: number; basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== "page") sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const q = sp.toString();
    return q ? `${basePath}?${q}` : basePath;
  };

  // Window the page numbers so long catalogues don't produce a wall of links
  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const list = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Pagination">
      {page > 1 && (
        <Link
          href={href(page - 1)} rel="prev" aria-label="Previous page"
          className="grid size-10 place-items-center rounded-full border border-line bg-paper hover:border-ink"
        >
          <ArrowLeft2 size={16} />
        </Link>
      )}

      {list.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - list[i - 1] > 1 && <span className="px-1 text-muted">…</span>}
          <Link
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "tabular grid size-10 place-items-center rounded-full text-[0.85rem] transition",
              p === page
                ? "bg-ink text-cream"
                : "border border-line bg-paper hover:border-ink",
            )}
          >
            {p}
          </Link>
        </span>
      ))}

      {page < pageCount && (
        <Link
          href={href(page + 1)} rel="next" aria-label="Next page"
          className="grid size-10 place-items-center rounded-full border border-line bg-paper hover:border-ink"
        >
          <ArrowRight2 size={16} />
        </Link>
      )}
    </nav>
  );
}
