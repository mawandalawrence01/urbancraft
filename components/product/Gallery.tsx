"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowLeft2, ArrowRight2 } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

export type GalleryImage = {
  url: string; alt: string | null;
  width: number | null; height: number | null; blurDataUrl: string | null;
};

export function Gallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return <div className="aspect-[4/5] rounded-[var(--radius-card)] bg-sand" />;
  }

  const go = (index: number) => {
    const next = (index + images.length) % images.length;
    setActive(next);
    // Keep the mobile rail in step with the arrow buttons
    const rail = railRef.current;
    if (rail) rail.scrollTo({ left: next * rail.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="lg:flex lg:gap-4">
      {/* Desktop thumbnail rail */}
      {images.length > 1 && (
        <div className="hidden w-20 shrink-0 flex-col gap-2.5 lg:flex">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={i === active}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg bg-sand ring-offset-2 transition",
                i === active ? "ring-2 ring-ink" : "opacity-65 hover:opacity-100",
              )}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="min-w-0 flex-1">
        {/* Mobile: a real swipe rail, not a JS carousel */}
        <div
          ref={railRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="snap-rail -mx-4 aspect-[4/5] px-4 sm:mx-0 sm:px-0 lg:hidden"
        >
          {images.map((img, i) => (
            <div key={img.url} className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-card)] bg-sand">
              <Image
                src={img.url}
                alt={img.alt ?? `${name} — view ${i + 1}`}
                fill sizes="100vw" priority={i === 0}
                placeholder={img.blurDataUrl ? "blur" : "empty"}
                blurDataURL={img.blurDataUrl ?? undefined}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Desktop main image */}
        <div className="group relative hidden aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-sand lg:block">
          <Image
            key={images[active].url}
            src={images[active].url}
            alt={images[active].alt ?? name}
            fill sizes="(min-width:1024px) 45vw, 100vw" priority
            placeholder={images[active].blurDataUrl ? "blur" : "empty"}
            blurDataURL={images[active].blurDataUrl ?? undefined}
            className="animate-fade-in object-cover"
          />

          {images.length > 1 && (
            <>
              <GalleryArrow side="left" onClick={() => go(active - 1)} />
              <GalleryArrow side="right" onClick={() => go(active + 1)} />
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5 lg:hidden">
            {images.map((img, i) => (
              <span
                key={img.url}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === active ? "w-5 bg-ink" : "w-1.5 bg-line",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GalleryArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ArrowLeft2 : ArrowRight2;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous image" : "Next image"}
      className={cn(
        "absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-paper/90 opacity-0 shadow-sm backdrop-blur transition hover:bg-paper group-hover:opacity-100",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon size={18} />
    </button>
  );
}
