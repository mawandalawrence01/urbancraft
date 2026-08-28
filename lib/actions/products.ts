"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteUpload, processAndUpload } from "@/lib/uploads";
import { slugify } from "@/lib/utils";

export type ActionState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

const productSchema = z.object({
  name: z.string().trim().min(2, "Give the piece a name").max(200),
  slug: z.string().trim().max(120).optional().or(z.literal("")),
  sku: z.string().trim().max(60).optional().or(z.literal("")),
  price: z.coerce.number().int().min(1000, "Price must be at least UGX 1,000"),
  compareAtPrice: z.coerce.number().int().min(0).optional(),
  summary: z.string().trim().max(400).optional().or(z.literal("")),
  bodyText: z.string().trim().max(8000).optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  inStock: z.coerce.boolean(),
  isFeatured: z.coerce.boolean(),
  leadTimeDays: z.coerce.number().int().min(0).max(365),
  warrantyMonths: z.coerce.number().int().min(0).max(240),
  material: z.string().trim().max(160).optional().or(z.literal("")),
  dimensions: z.string().trim().max(160).optional().or(z.literal("")),
  colour: z.string().trim().max(160).optional().or(z.literal("")),
  seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(400).optional().or(z.literal("")),
});

function readForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") ?? "",
    sku: formData.get("sku") ?? "",
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || undefined,
    summary: formData.get("summary") ?? "",
    bodyText: formData.get("bodyText") ?? "",
    categoryId: formData.get("categoryId") ?? "",
    status: formData.get("status") ?? "DRAFT",
    inStock: formData.get("inStock") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    leadTimeDays: formData.get("leadTimeDays") || 10,
    warrantyMonths: formData.get("warrantyMonths") || 24,
    material: formData.get("material") ?? "",
    dimensions: formData.get("dimensions") ?? "",
    colour: formData.get("colour") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });
}

function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) out[String(issue.path[0] ?? "form")] ??= issue.message;
  return out;
}

/** Paragraphs become the ordered block array the storefront renders. */
const toBlocks = (text: string) =>
  text.split(/\n{2,}/).map((t) => t.trim()).filter(Boolean).map((t) =>
    t.startsWith("- ") ? { type: "li", text: t.slice(2).trim() } : { type: "p", text: t },
  );

export async function saveProduct(
  productId: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = readForm(formData);
  if (!parsed.success) {
    return { error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }
  const d = parsed.data;

  const data = {
    name: d.name,
    sku: d.sku || null,
    price: d.price,
    compareAtPrice: d.compareAtPrice && d.compareAtPrice > 0 ? d.compareAtPrice : null,
    summary: d.summary || null,
    body: d.bodyText ? toBlocks(d.bodyText) : undefined,
    categoryId: d.categoryId || null,
    status: d.status,
    inStock: d.inStock,
    isFeatured: d.isFeatured,
    leadTimeDays: d.leadTimeDays,
    warrantyMonths: d.warrantyMonths,
    material: d.material || null,
    dimensions: d.dimensions || null,
    colour: d.colour || null,
    seoTitle: d.seoTitle || null,
    seoDescription: d.seoDescription || null,
  };

  let slug = (d.slug || slugify(d.name)).trim();

  try {
    if (productId) {
      await prisma.product.update({ where: { id: productId }, data: { ...data, slug } });
    } else {
      // A new product needs a slug nobody else holds
      const existing = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
      if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
      const created = await prisma.product.create({ data: { ...data, slug } });
      productId = created.id;
    }
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return { error: "Another product already uses that URL slug.", fieldErrors: { slug: "Already taken" } };
    }
    throw error;
  }

  // Keep the many-to-many in step with the primary category so category pages
  // and filters do not disagree with the product's own breadcrumb.
  if (d.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: d.categoryId }, select: { id: true, parentId: true },
    });
    if (category) {
      const ids = [category.id, category.parentId].filter((v): v is string => Boolean(v));
      await prisma.productCategory.deleteMany({ where: { productId } });
      await prisma.productCategory.createMany({
        data: ids.map((categoryId) => ({ productId: productId!, categoryId })),
        skipDuplicates: true,
      });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath(`/product/${slug}`);
  revalidatePath("/shop");
  redirect(`/admin/products/${productId}?saved=1`);
}

export async function uploadProductImages(
  productId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Choose at least one image." };

  const last = await prisma.productImage.findFirst({
    where: { productId }, orderBy: { position: "desc" }, select: { position: true },
  });
  let position = (last?.position ?? -1) + 1;

  try {
    for (const file of files) {
      const image = await processAndUpload(file, `products/${productId}`);
      await prisma.productImage.create({
        data: {
          productId, url: image.url, width: image.width, height: image.height,
          blurDataUrl: image.blurDataUrl, position: position++,
        },
      });
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload failed." };
  }

  revalidatePath(`/admin/products/${productId}`);
  return { ok: true };
}

export async function deleteProductImage(imageId: string) {
  await requireAdmin();
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) return;

  await prisma.productImage.delete({ where: { id: imageId } });
  await deleteUpload(image.url);

  revalidatePath(`/admin/products/${image.productId}`);
  revalidatePath("/admin/images");
}

export async function reorderProductImage(imageId: string, direction: "up" | "down") {
  await requireAdmin();
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) return;

  const neighbour = await prisma.productImage.findFirst({
    where: {
      productId: image.productId,
      position: direction === "up" ? { lt: image.position } : { gt: image.position },
    },
    orderBy: { position: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbour) return;

  await prisma.$transaction([
    prisma.productImage.update({ where: { id: image.id }, data: { position: neighbour.position } }),
    prisma.productImage.update({ where: { id: neighbour.id }, data: { position: image.position } }),
  ]);
  revalidatePath(`/admin/products/${image.productId}`);
}

export async function clearImageFlag(imageId: string) {
  await requireAdmin();
  const image = await prisma.productImage.update({
    where: { id: imageId },
    data: { needsReview: false, reviewNote: null },
  });
  revalidatePath("/admin/images");
  revalidatePath(`/admin/products/${image.productId}`);
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  const images = await prisma.productImage.findMany({ where: { productId } });
  await prisma.product.delete({ where: { id: productId } });
  await Promise.all(images.map((i) => deleteUpload(i.url)));

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function setHeroRank(productId: string, rank: number | null) {
  await requireAdmin();
  await prisma.product.update({ where: { id: productId }, data: { heroRank: rank } });
  revalidatePath("/");
  revalidatePath("/admin/products");
}
