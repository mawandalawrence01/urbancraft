"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CloseSquare, ArrowLeft2, ArrowRight2 } from "iconsax-reactjs";

export type LightboxImage = {
  url: string;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  blurDataUrl?: string | null;
  caption?: string | null;
};

/**
 * Full-screen image viewer.
 *
 * The slides live in a scroll-snap rail rather than a JS carousel, so swiping
 * is the browser's own: real momentum, real rubber-banding, and it keeps
 * working if the JS that opened it is busy. The rail is the source of truth
 * for which slide is showing; the arrows and keyboard just scroll it.
 *
 * Dark ground on purpose. Everything else on this site is white so the
 * photography carries it — here the photograph *is* the page, and a bright
 * surround would fight it.
 */
export function Lightbox({
  images,
  index,
  onClose,
  label,
}: {
  images: LightboxImage[];
  /** Which slide to open on. `null` means closed. */
  index: number | null;
  onClose: () => void;
  /** Names the set for screen readers, e.g. a product or service name. */
  label: string;
}) {
  const open = index !== null;
  const railRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  const [current, setCurrent] = useState(index ?? 0);

  // Syncing the shown slide to the tapped one is a render-time adjustment, not
  // a side effect: doing it in an effect would paint the old slide first.
  const [lastIndex, setLastIndex] = useState(index);
  if (lastIndex !== index) {
    setLastIndex(index);
    if (index !== null) setCurrent(index);
  }

  const scrollTo = useCallback((i: number, smooth = true) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollTo({
      left: i * rail.clientWidth,
      behavior: smooth && !matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "smooth"
        : "auto",
    });
  }, []);

  // Opening: remember what had focus, jump to the tapped slide, take focus.
  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement as HTMLElement | null;

    // The rail has to exist and be laid out before it can be scrolled.
    const id = requestAnimationFrame(() => {
      scrollTo(index, false);
      closeRef.current?.focus({ preventScroll: true });
    });

    const { overflow, paddingRight } = document.body.style;
    // Replacing the scrollbar's width stops the page behind jumping sideways.
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;

    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      // preventScroll matters: focus() scrolls its target into view by
      // default, which would move the page out from under the visitor as the
      // viewer closes.
      restoreTo.current?.focus?.({ preventScroll: true });
    };
  }, [open, index, scrollTo]);

  // Keyboard: escape closes, arrows move, tab stays inside.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); scrollTo(Math.min(current + 1, images.length - 1)); }
      if (e.key === "ArrowLeft") { e.preventDefault(); scrollTo(Math.max(current - 1, 0)); }
      if (e.key === "Tab") {
        // Three controls at most; keep the ring inside the dialog.
        const focusable = railRef.current?.parentElement?.querySelectorAll<HTMLElement>(
          "button:not([disabled])",
        );
        if (!focusable?.length) return;
        const list = Array.from(focusable);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, current, images.length, onClose, scrollTo]);

  if (!open) return null;

  const multiple = images.length > 1;
  const img = images[current];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${label} — image ${current + 1} of ${images.length}`}
      className="animate-fade-in fixed inset-0 z-[100] bg-ink"
    >
      {/* The rail. Each slide is one viewport, so a swipe is one photograph. */}
      <div
        ref={railRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / el.clientWidth);
          if (i !== current) setCurrent(Math.max(0, Math.min(i, images.length - 1)));
        }}
        className="no-scrollbar flex h-[100dvh] w-full snap-x snap-mandatory overflow-x-auto overscroll-contain"
      >
        {images.map((image, i) => (
          <div
            key={image.url}
            className="relative grid h-[100dvh] w-full shrink-0 snap-center place-items-center px-3 py-16 sm:px-12"
          >
            <Image
              src={image.url}
              alt={image.alt ?? `${label} — image ${i + 1}`}
              width={image.width ?? 1600}
              height={image.height ?? 1600}
              sizes="100vw"
              // Only the slide in view and its neighbours are worth fetching eagerly.
              priority={Math.abs(i - current) <= 1}
              placeholder={image.blurDataUrl ? "blur" : "empty"}
              blurDataURL={image.blurDataUrl ?? undefined}
              className="max-h-full w-auto max-w-full object-contain"
            />
          </div>
        ))}
      </div>

      {/* ------------------------------------------------------- chrome */}
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close image"
        className="absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-[var(--radius-card)] bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-5 sm:top-5"
      >
        <CloseSquare size={22} />
      </button>

      {multiple && (
        <>
          <Arrow
            side="left"
            disabled={current === 0}
            onClick={() => scrollTo(current - 1)}
          />
          <Arrow
            side="right"
            disabled={current === images.length - 1}
            onClick={() => scrollTo(current + 1)}
          />
        </>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-5 text-center sm:pb-7">
        {img?.caption && (
          <p className="mx-auto mb-2 max-w-prose text-[0.88rem] leading-relaxed text-white/80">
            {img.caption}
          </p>
        )}
        {multiple && (
          <p className="figure-num text-[0.8rem] text-white/55">
            {current + 1} / {images.length}
          </p>
        )}
      </div>
    </div>
  );
}

function Arrow({
  side, onClick, disabled,
}: { side: "left" | "right"; onClick: () => void; disabled: boolean }) {
  const Icon = side === "left" ? ArrowLeft2 : ArrowRight2;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Previous image" : "Next image"}
      className={[
        "absolute top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-[var(--radius-card)]",
        "bg-white/10 text-white backdrop-blur transition hover:bg-white/20",
        "disabled:pointer-events-none disabled:opacity-0 sm:grid",
        side === "left" ? "left-4" : "right-4",
      ].join(" ")}
    >
      <Icon size={22} />
    </button>
  );
}
