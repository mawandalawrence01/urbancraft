"use client";

import Image from "next/image";
import { useState } from "react";

import { Lightbox, type LightboxImage } from "@/components/media/Lightbox";

/**
 * A project's cover plus its supporting shots, all tappable.
 *
 * The cover and the grid share one image list, so opening any of them lands
 * on the right slide and swiping runs through the whole project.
 */
export function ProjectGallery({
  images,
  title,
}: {
  images: LightboxImage[];
  title: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  if (images.length === 0) return null;

  const [cover, ...rest] = images;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(0)}
        aria-label={`Open ${title} full screen`}
        className="group relative mt-7 block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-[var(--radius-card)] bg-sand"
      >
        <Image
          src={cover.url}
          alt={cover.alt ?? title}
          fill
          priority
          sizes="(min-width:1024px) 60vw, 100vw"
          placeholder={cover.blurDataUrl ? "blur" : "empty"}
          blurDataURL={cover.blurDataUrl ?? undefined}
          className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
        />
      </button>

      {rest.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {rest.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setOpen(i + 1)}
              aria-label={`Open ${title} image ${i + 2} of ${images.length} full screen`}
              className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-[var(--radius-card)] bg-sand"
            >
              <Image
                src={img.url}
                alt={img.alt ?? ""}
                fill
                sizes="(min-width:1024px) 30vw, 45vw"
                placeholder={img.blurDataUrl ? "blur" : "empty"}
                blurDataURL={img.blurDataUrl ?? undefined}
                className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
              />
            </button>
          ))}
        </div>
      )}

      <Lightbox images={images} index={open} onClose={() => setOpen(null)} label={title} />
    </>
  );
}
