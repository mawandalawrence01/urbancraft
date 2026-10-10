import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft2, Call, Ruler, Receipt21, ShieldTick } from "iconsax-reactjs";

import { DesignBriefForm } from "@/components/design/DesignBriefForm";
import { prisma } from "@/lib/db";
import { getSetting, type ContactSettings } from "@/lib/settings";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Start a Design Brief",
  description:
    "Tell us about the space and we will come and measure it. The site survey and the drawing are free — you only pay once you have approved a price.",
  alternates: { canonical: "/design/enquire" },
};

type Search = Promise<{ service?: string }>;

export default async function DesignEnquirePage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { service } = await searchParams;

  const [services, contact] = await Promise.all([
    prisma.designService.findMany({
      where: { isPublished: true, kind: "FITOUT" },
      orderBy: { position: "asc" },
      select: { slug: true, name: true },
    }),
    getSetting<ContactSettings>("site.contact"),
  ]);

  const valid = services.some((s) => s.slug === service) ? service! : "";

  return (
    <div className="container-page pt-6">
      <Link
        href="/design"
        className="inline-flex items-center gap-1.5 text-[0.85rem] text-muted transition hover:text-ink"
      >
        <ArrowLeft2 size={15} /> Interior design
      </Link>

      <div className="mt-5 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Start a design brief</h1>
          <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-ink-3">
            The more you tell us now, the more useful the first visit is. None of it is binding —
            we measure, we draw, and then you decide.
          </p>

          <div className="mt-8">
            <DesignBriefForm services={services} defaultService={valid} />
          </div>
        </div>

        <aside className="lg:pt-16">
          <div className="rounded-[var(--radius-card)] border border-line bg-sand p-6">
            <h2 className="font-display text-lg font-semibold">What happens next</h2>
            <ul className="mt-4 space-y-4">
              {[
                [Call, "We call you back", "Usually the same working day, to agree a time."],
                [Ruler, "We measure on site", "Free, anywhere in Kampala. We take the dimensions ourselves."],
                [Receipt21, "You get a drawing and a price", "Itemised, so you can see what each part costs."],
                [ShieldTick, "You decide", "No deposit is taken before you approve the quote."],
              ].map(([Icon, title, body]) => {
                const I = Icon as typeof Call;
                return (
                  <li key={title as string} className="flex gap-3">
                    <I size={19} className="mt-0.5 shrink-0 text-tan" />
                    <div>
                      <p className="text-[0.88rem] font-medium">{title as string}</p>
                      <p className="mt-0.5 text-[0.82rem] leading-relaxed text-muted">
                        {body as string}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            {contact?.phone && (
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="mt-6 flex items-center justify-center gap-2 rounded-[var(--radius-card)] bg-ink px-5 py-3 text-[0.9rem] font-medium text-cream transition hover:bg-ink-2"
              >
                <Call size={17} /> {contact.phone}
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
