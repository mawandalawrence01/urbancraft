import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Award, Ruler, ShieldTick, Truck } from "iconsax-reactjs";
import { ButtonLink } from "@/components/ui/Button";
import { prisma } from "@/lib/db";
import { getSetting, type ContactSettings } from "@/lib/settings";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About the Workshop",
  description:
    "UrbanCraft is a furniture workshop in Kawempe, Kampala. We cut, joint and finish every piece by hand, then deliver and install it ourselves.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [contact, shots, counts] = await Promise.all([
    getSetting<ContactSettings>("site.contact"),
    prisma.project.findMany({
      where: { isPublished: true, clientType: "Workshop" },
      orderBy: { position: "asc" }, take: 3,
    }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
  ]);

  return (
    <div className="container-page pt-8">
      <header className="max-w-2xl">
        <p className="text-[0.75rem] uppercase tracking-[0.2em] text-tan-2">The workshop</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-[2.6rem] sm:leading-[1.1]">
          We build furniture the slow way, in Kampala
        </h1>
        <p className="mt-4 text-[1rem] leading-relaxed text-ink-3">
          UrbanCraft is a working carpentry shop, not a showroom that ships someone else&apos;s
          furniture. Timber comes in one end, and finished pieces leave the other on our own truck.
        </p>
      </header>

      {shots.length > 0 && (
        <div className="mt-9 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {shots.map((s, i) => (
            <div
              key={s.id}
              className={`relative overflow-hidden rounded-[var(--radius-card)] bg-sand ${
                i === 0 ? "col-span-2 aspect-[16/10] lg:col-span-1 lg:aspect-[4/5]" : "aspect-[4/5]"
              }`}
            >
              {s.coverImage && (
                <Image src={s.coverImage} alt={s.title} fill sizes="(min-width:1024px) 32vw, 45vw"
                       className="object-cover" priority={i === 0} />
              )}
            </div>
          ))}
        </div>
      )}

      <section className="mt-14 grid gap-10 lg:grid-cols-2">
        <div className="max-w-xl space-y-4 text-[0.97rem] leading-relaxed text-ink-3">
          <h2 className="font-display text-2xl font-semibold text-ink">How we work</h2>
          <p>
            Almost everything we make is made to order. You choose the timber, the finish and the
            dimensions; we cut to them. That is why a piece takes one to two weeks rather than
            coming off a shelf.
          </p>
          <p>
            We are honest about grades. The same design can be built three ways, and the difference
            is the timber and the finishing — not the drawing. We publish all three prices so you
            can pick the one that fits your budget, instead of being sold the cheapest build at the
            best price.
          </p>
          <p>
            When it is done we deliver and install it ourselves. If a joint moves or a finish fails
            inside the warranty, we come and fix it.
          </p>
        </div>

        <div className="space-y-3">
          {[
            [Award, "Three quality classes", "Economy, Standard and Top class — priced openly, not negotiated in the room."],
            [Ruler, "Built to your measurements", "Send the dimensions of the space. We cut the piece to fit it."],
            [ShieldTick, "Warranty in writing", "Two years on Standard, five on Top class, covering joinery and finish."],
            [Truck, "We deliver and install", "Free within Kampala Central, quoted honestly beyond it."],
          ].map(([Icon, title, body]) => {
            const I = Icon as typeof Award;
            return (
              <div key={title as string} className="flex gap-4 rounded-2xl border border-line bg-paper p-5">
                <I size={22} className="mt-0.5 shrink-0 text-tan" />
                <div>
                  <h3 className="font-medium">{title as string}</h3>
                  <p className="mt-1 text-[0.87rem] leading-relaxed text-muted">{body as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-14 rounded-[var(--radius-card)] bg-ink px-6 py-12 text-cream sm:px-10">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            [`${counts}`, "pieces in the catalogue"],
            ["1–2 weeks", "typical build time"],
            ["5 years", "warranty on Top class"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="tabular font-display text-3xl font-semibold">{value}</p>
              <p className="mt-1 text-[0.85rem] text-cream/55">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-9 max-w-xl text-[0.95rem] leading-relaxed text-cream/65">
          Find us at {contact.address}. We work by appointment — call before you set off so we can
          give you proper time.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/contact" variant="tan" size="lg">Start a commission</ButtonLink>
          <Link
            href="/projects"
            className="inline-flex h-12 items-center rounded-full border border-cream/25 px-6 font-medium transition hover:bg-cream/10"
          >
            See our work
          </Link>
        </div>
      </section>
    </div>
  );
}
