import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight2 } from "iconsax-reactjs";
import { getCategoryTree, getRoomCovers } from "@/lib/catalog";
import { prisma } from "@/lib/db";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Shop by Room",
  description:
    "Browse UrbanCraft furniture by room — living room, bedroom, dining, kids, office, kitchen, bathroom, doors and outdoor. Made to order in Kampala.",
  alternates: { canonical: "/c" },
};

export default async function RoomsPage() {
  const [tree, total] = await Promise.all([
    getCategoryTree(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
  ]);
  const covers = await getRoomCovers(tree.map((r) => r.slug));

  return (
    <div className="container-page pt-8">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">Shop by room</h1>
        <p className="mt-2 text-[0.95rem] text-ink-3">
          {total} pieces across {tree.length} rooms, each made to order in our Kampala workshop.
        </p>
      </header>

      <div className="mt-8 space-y-10">
        {tree.map((room) => (
          <section key={room.id}>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{room.name}</h2>
                {room.description && (
                  <p className="mt-1 max-w-xl text-[0.87rem] text-muted">{room.description}</p>
                )}
              </div>
              <Link
                href={`/c/${room.slug}`}
                className="flex shrink-0 items-center gap-1 text-[0.85rem] text-tan-2 hover:underline"
              >
                All {room._count.productLinks} <ArrowRight2 size={14} />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href={`/c/${room.slug}`}
                className="group relative col-span-full overflow-hidden rounded-[var(--radius-card)] bg-sand sm:col-span-1"
              >
                <div className="relative aspect-[16/9] sm:aspect-[4/3]">
                  {covers[room.slug] ? (
                    <Image
                      src={covers[room.slug].url} alt={room.name} fill
                      sizes="(min-width:1024px) 32vw, 100vw"
                      placeholder={covers[room.slug].blurDataUrl ? "blur" : "empty"}
                      blurDataURL={covers[room.slug].blurDataUrl ?? undefined}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : null}
                  <span className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                  <span className="absolute bottom-3 left-4 font-display text-lg font-semibold text-cream">
                    All {room.name.toLowerCase()}
                  </span>
                </div>
              </Link>

              {room.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/c/${child.slug}`}
                  className="flex items-center justify-between rounded-[var(--radius-card)] border border-line bg-paper px-4 py-3.5 transition hover:border-ink"
                >
                  <span>
                    <span className="block text-[0.92rem] font-medium">{child.name}</span>
                    <span className="text-[0.78rem] text-muted">
                      {child._count.productLinks} piece{child._count.productLinks === 1 ? "" : "s"}
                    </span>
                  </span>
                  <ArrowRight2 size={16} className="shrink-0 text-muted" />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
