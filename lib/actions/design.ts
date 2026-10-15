"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BUDGET_BANDS, SPACE_TYPES, TIMELINES } from "@/lib/design-options";
import { deleteUpload, processAndUpload } from "@/lib/uploads";
import { toMsisdn } from "@/lib/utils";

/* ------------------------------------------------------------------ public */

const briefSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(120),
  phone: z.string().trim().refine((v) => toMsisdn(v) !== null, "Enter a valid Ugandan number"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  serviceSlug: z.string().trim().max(60).optional().or(z.literal("")),
  spaceType: z.enum(SPACE_TYPES, { message: "Pick the kind of space" }),
  budgetBand: z.enum(BUDGET_BANDS, { message: "Pick a budget range" }),
  timeline: z.enum(TIMELINES, { message: "Pick a timeline" }),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more — at least 10 characters")
    .max(4000),
});

export type DesignBriefState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitDesignBrief(
  _prev: DesignBriefState,
  formData: FormData,
): Promise<DesignBriefState> {
  // Bots fill every field they find; a real person leaves this one alone.
  if (String(formData.get("company") ?? "")) return { ok: true };

  const parsed = briefSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    serviceSlug: formData.get("serviceSlug") ?? "",
    spaceType: formData.get("spaceType"),
    budgetBand: formData.get("budgetBand"),
    timeline: formData.get("timeline"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message;
    }
    return { error: "Please check the highlighted fields.", fieldErrors };
  }

  const d = parsed.data;
  const subjectService = d.serviceSlug
    ? await prisma.designService.findUnique({
        where: { slug: d.serviceSlug },
        select: { name: true },
      })
    : null;

  try {
    await prisma.enquiry.create({
      data: {
        kind: "DESIGN",
        name: d.name,
        phone: toMsisdn(d.phone)!,
        email: d.email || null,
        subject: subjectService ? `${subjectService.name} — ${d.spaceType}` : d.spaceType,
        message: d.message,
        source: "design-brief",
        serviceSlug: d.serviceSlug || null,
        spaceType: d.spaceType,
        budgetBand: d.budgetBand,
        timeline: d.timeline,
      },
    });
    return { ok: true };
  } catch {
    return { error: "We could not send that. Please call the workshop instead." };
  }
}

/* ------------------------------------------------------------------- admin */

const ORIGINS = ["UNSET", "OWN_WORK", "REFERENCE"] as const;
type Origin = (typeof ORIGINS)[number];

function revalidateService(slug: string) {
  revalidatePath("/design");
  revalidatePath(`/design/${slug}`);
  revalidatePath("/admin/design");
  revalidatePath(`/admin/design/${slug}`);
  revalidatePath("/");
  // Approving a service's first photo makes its gallery indexable, so the
  // sitemap has to be rebuilt too — otherwise it stays stale for an hour.
  revalidatePath("/sitemap.xml");
}

/** Sort one photo: ours, a reference, or back to undecided. */
export async function setImageOrigin(imageId: string, origin: Origin) {
  await requireAdmin();
  if (!ORIGINS.includes(origin)) return;

  const image = await prisma.designImage.update({
    where: { id: imageId },
    data: { origin },
    select: { service: { select: { slug: true } } },
  });
  revalidateService(image.service.slug);
}

/**
 * Sort a whole service at once. Only touches photos still UNSET, so an
 * accidental second click cannot overwrite decisions already made — and never
 * touches watermarked photos, which must be dealt with individually.
 */
export async function bulkSetOrigin(serviceId: string, origin: Origin) {
  await requireAdmin();
  if (!ORIGINS.includes(origin) || origin === "UNSET") return;

  const service = await prisma.designService.findUnique({
    where: { id: serviceId },
    select: { slug: true },
  });
  if (!service) return;

  await prisma.designImage.updateMany({
    where: { serviceId, origin: "UNSET", needsReview: false },
    data: { origin },
  });
  revalidateService(service.slug);
}

/** The watermark has been cropped out or the photo replaced. */
export async function clearDesignFlag(imageId: string) {
  await requireAdmin();
  const image = await prisma.designImage.update({
    where: { id: imageId },
    data: { needsReview: false, reviewNote: null },
    select: { service: { select: { slug: true } } },
  });
  revalidateService(image.service.slug);
}

export async function deleteDesignImage(imageId: string) {
  await requireAdmin();
  const image = await prisma.designImage.delete({
    where: { id: imageId },
    select: { url: true, service: { select: { slug: true } } },
  });
  // Uploaded photos are also removed from the Cloudinary library, so deleting
  // one here does not quietly leave it on the workshop's storage bill.
  await deleteUpload(image.url);
  revalidateService(image.service.slug);
}

export type UploadState = { ok?: boolean; error?: string };

/**
 * Add photos to a service gallery.
 *
 * They land as UNSET rather than live. Whoever uploads is the workshop, but
 * photos reach this workshop by WhatsApp from suppliers and from Pinterest as
 * often as from its own sites, and the provenance gate only means anything if
 * going public stays a decision. The unsorted banner above turns that decision
 * into one tap for the whole batch.
 */
export async function uploadDesignImages(
  serviceId: string,
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  await requireAdmin();

  const service = await prisma.designService.findUnique({
    where: { id: serviceId },
    select: { slug: true },
  });
  if (!service) return { error: "That service no longer exists." };

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Choose at least one photo." };

  const last = await prisma.designImage.findFirst({
    where: { serviceId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  let position = (last?.position ?? -1) + 1;

  try {
    for (const file of files) {
      const image = await processAndUpload(file, `design/${service.slug}`);
      await prisma.designImage.create({
        data: {
          serviceId,
          url: image.url,
          width: image.width,
          height: image.height,
          blurDataUrl: image.blurDataUrl,
          position: position++,
        },
      });
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload failed." };
  }

  revalidateService(service.slug);
  return { ok: true };
}

/** Swap a photo with its neighbour; the first one is the gallery cover. */
export async function reorderDesignImage(imageId: string, direction: "up" | "down") {
  await requireAdmin();

  const image = await prisma.designImage.findUnique({
    where: { id: imageId },
    select: { id: true, serviceId: true, position: true, service: { select: { slug: true } } },
  });
  if (!image) return;

  const neighbour = await prisma.designImage.findFirst({
    where: {
      serviceId: image.serviceId,
      position: direction === "up" ? { lt: image.position } : { gt: image.position },
    },
    orderBy: { position: direction === "up" ? "desc" : "asc" },
    select: { id: true, position: true },
  });
  if (!neighbour) return;

  await prisma.$transaction([
    prisma.designImage.update({ where: { id: image.id }, data: { position: neighbour.position } }),
    prisma.designImage.update({ where: { id: neighbour.id }, data: { position: image.position } }),
  ]);
  revalidateService(image.service.slug);
}

export async function toggleServicePublished(serviceId: string) {
  await requireAdmin();
  const service = await prisma.designService.findUnique({
    where: { id: serviceId },
    select: { slug: true, isPublished: true },
  });
  if (!service) return;

  await prisma.designService.update({
    where: { id: serviceId },
    data: { isPublished: !service.isPublished },
  });
  revalidateService(service.slug);
}
