"use client";

import Image from "next/image";
import { useState } from "react";

import { Lightbox, type LightboxImage } from "@/components/media/Lightbox";

/**
 * The photograph on the sorting screen.
 *
 * Deciding whether a shot is our own installation means actually looking at
 * it — a thumbnail on a phone is not enough to spot a competitor's watermark.
 * So the image opens full screen, and the whole set is swipeable from there,
 * while the decision buttons stay beneath it in the grid.
 */
export function SortableShot({
  images,
  index,
  alt,
  label,
}: {
  images: LightboxImage[];
  index: number;
  alt: string;
  label: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const img = images[index];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(index)}
        aria-label={`Inspect ${label} photo ${index + 1} of ${images.length} full screen`}
        className="absolute inset-0 cursor-zoom-in"
      >
        <Image
          src={img.url}
          alt={alt}
          fill
          sizes="(min-width:1280px) 23vw, (min-width:640px) 45vw, 46vw"
          placeholder={img.blurDataUrl ? "blur" : "empty"}
          blurDataURL={img.blurDataUrl ?? undefined}
          className="object-cover"
        />
      </button>

      <Lightbox images={images} index={open} onClose={() => setOpen(null)} label={label} />
    </>
  );
}
