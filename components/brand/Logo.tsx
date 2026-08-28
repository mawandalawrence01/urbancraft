import { cn } from "@/lib/utils";

/**
 * The UrbanCraft mark: a lozenge frame holding the "U" hook and the chair
 * profile from the workshop sign. The frame and hook inherit `currentColor`
 * so the mark sits on light or dark surfaces; the chair keeps its wood tan.
 */
export function LogoMark({ className, chair = "#b87a42" }: { className?: string; chair?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden className={cn("size-8", className)}>
      <path
        d="M46 3.5H90.5A6 6 0 0 1 96.5 9.5V54A42.5 42.5 0 0 1 54 96.5H9.5A6 6 0 0 1 3.5 90.5V46A42.5 42.5 0 0 1 46 3.5Z"
        stroke="currentColor" strokeWidth="6"
      />
      <path
        d="M30 35V62a8.5 8.5 0 0 0 17 0V53"
        stroke="currentColor" strokeWidth="6.5" strokeLinecap="round"
      />
      <g stroke={chair} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M74 23 68.5 47.5H39" />
        <path d="M45.5 51 41.5 79" />
        <path d="M69 51 77 81" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  showTagline = false,
}: {
  className?: string;
  markClassName?: string;
  showTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={cn("size-9 shrink-0", markClassName)} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.05rem] font-semibold tracking-tight">
          Urban<span className="text-tan">Craft</span>
        </span>
        {showTagline && (
          <span className="mt-1 text-[0.6rem] uppercase tracking-[0.22em] text-muted">
            Furniture Workshop
          </span>
        )}
      </span>
    </span>
  );
}
