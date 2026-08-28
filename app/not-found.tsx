import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";

export default function GlobalNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <LogoMark className="size-12" />
      <p className="mt-6 font-display text-5xl font-semibold text-tan">404</p>
      <h1 className="mt-3 text-2xl font-semibold">This page does not exist</h1>
      <p className="mt-2 max-w-sm text-[0.93rem] leading-relaxed text-muted">
        The link may be out of date, or the piece may have left the catalogue.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex h-12 items-center rounded-full bg-ink px-7 font-medium text-cream transition hover:bg-ink-2"
      >
        Back to UrbanCraft
      </Link>
    </div>
  );
}
