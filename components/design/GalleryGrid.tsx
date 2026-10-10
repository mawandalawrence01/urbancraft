"use client";

import Image from "next/image";
import { useState } from "react";

import { Lightbox, type LightboxImage } from "@/components/media/Lightbox";

/**
 * The masonry of installed work, with any photograph opening full screen.
 *
 * A client component only because the images are tappable; the page around it
 * stays a server component, so nothing but this grid ships as JS.
 */
export function GalleryGrid({
  images,
  serviceName,
}: {
  images: LightboxImage[];
  serviceName: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <div className="columns-2 gap-3 lg:columns-3 lg:gap-5 [&>*]:mb-3 lg:[&>*]:mb-5">
        {images.map((img, i) => (
          <figure key={img.url} className="break-inside-avoid">
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open image ${i + 1} of ${images.length} full screen`}
              className="group block w-full cursor-zoom-in overflow-hidden rounded-[var(--radius-card)] bg-sand"
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${serviceName} — UrbanCraft installation`}
                width={img.width ?? 1200}
                height={img.height ?? 1600}
                sizes="(min-width:1024px) 31vw, 48vw"
                priority={i < 4}
                placeholder={img.blurDataUrl ? "blur" : "empty"}
                blurDataURL={img.blurDataUrl ?? undefined}
                className="h-auto w-full transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
              />
            </button>
            {img.caption && (
              <figcaption className="px-1 pt-2 text-[0.82rem] text-muted">{img.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>

      <Lightbox images={images} index={open} onClose={() => setOpen(null)} label={serviceName} />
    </>
  );
}
