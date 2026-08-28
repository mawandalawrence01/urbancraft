import { revalidatePath } from "next/cache";
import { Call, Whatsapp, Sms } from "iconsax-reactjs";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatPhone } from "@/lib/utils";
import type { EnquiryStatus } from "@/lib/generated/prisma/enums";

async function setStatus(id: string, status: EnquiryStatus) {
  "use server";
  await requireAdmin();
  await prisma.enquiry.update({ where: { id }, data: { status } });
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}

export default async function EnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  return (
    <>
      <PageHeader title="Enquiries" subtitle="Commission requests and questions from the site." />

      {enquiries.length === 0 ? (
        <EmptyState
          title="No enquiries yet"
          body="Messages sent from the contact page land here."
        />
      ) : (
        <div className="space-y-3">
          {enquiries.map((e) => (
            <Card key={e.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{e.name}</span>
                    <Badge tone={e.status === "NEW" ? "warn" : e.status === "CLOSED" ? "neutral" : "tan"}>
                      {e.status.replace(/_/g, " ").toLowerCase()}
                    </Badge>
                  </p>
                  {e.subject && <p className="mt-0.5 text-[0.88rem] text-ink-3">{e.subject}</p>}
                  <p className="text-[0.76rem] text-muted">{formatDate(e.createdAt, "long")}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={`tel:${e.phone}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-[0.8rem] transition hover:border-ink"
                  >
                    <Call size={13} className="text-tan" /> {formatPhone(e.phone)}
                  </a>
                  <a
                    href={`https://wa.me/${e.phone}`} target="_blank" rel="noreferrer"
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-[0.8rem] transition hover:border-ink"
                  >
                    <Whatsapp size={13} className="text-success" />
                  </a>
                  {e.email && (
                    <a
                      href={`mailto:${e.email}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-[0.8rem] transition hover:border-ink"
                    >
                      <Sms size={13} className="text-tan" />
                    </a>
                  )}
                </div>
              </div>

              <p className="mt-3 whitespace-pre-line rounded-xl bg-sand p-3.5 text-[0.88rem] leading-relaxed text-ink-3">
                {e.message}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {e.status !== "IN_PROGRESS" && (
                  <form action={setStatus.bind(null, e.id, "IN_PROGRESS")}>
                    <Button type="submit" size="sm" variant="outline">Mark in progress</Button>
                  </form>
                )}
                {e.status !== "CLOSED" && (
                  <form action={setStatus.bind(null, e.id, "CLOSED")}>
                    <Button type="submit" size="sm" variant="ghost" className="text-muted">Close</Button>
                  </form>
                )}
                {e.status === "CLOSED" && (
                  <form action={setStatus.bind(null, e.id, "NEW")}>
                    <Button type="submit" size="sm" variant="ghost" className="text-muted">Reopen</Button>
                  </form>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
