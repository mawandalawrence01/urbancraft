import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-page flex max-w-md flex-col items-center py-24 text-center">
      <p className="font-display text-6xl font-semibold text-tan">404</p>
      <h1 className="mt-4 text-2xl font-semibold">We could not find that page</h1>
      <p className="mt-2 text-[0.93rem] leading-relaxed text-muted">
        It may have moved, or the piece may no longer be in the catalogue.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/shop" size="lg">Browse the catalogue</ButtonLink>
        <ButtonLink href="/" size="lg" variant="outline">Go home</ButtonLink>
      </div>
      <Link href="/contact" className="mt-6 text-[0.87rem] text-tan-2 hover:underline">
        Looking for something specific? Ask us.
      </Link>
    </div>
  );
}
