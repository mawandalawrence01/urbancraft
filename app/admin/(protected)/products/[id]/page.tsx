import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft2 } from "iconsax-reactjs";

import { ProductForm, type ProductFormData } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/db";
import { uploadsConfigured } from "@/lib/uploads";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ saved?: string }>;

/** The storefront stores prose as blocks; the editor works in plain text. */
function blocksToText(body: unknown): string {
  if (!Array.isArray(body)) return "";
  return (body as { type: string; text: string }[])
    .map((b) => (b.type === "li" ? `- ${b.text}` : b.text))
    .join("\n\n");
}

export default async function EditProductPage({
  params, searchParams,
}: { params: Params; searchParams: SearchParams }) {
  const { id } = await params;
  const { saved } = await searchParams;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { position: "asc" } },
      },
    }),
    prisma.category.findMany({
      orderBy: [{ parentId: "asc" }, { position: "asc" }],
      select: { id: true, name: true, parent: { select: { name: true } } },
    }),
  ]);

  if (!product) notFound();

  const data: ProductFormData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku ?? "",
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    summary: product.summary ?? "",
    bodyText: blocksToText(product.body),
    categoryId: product.categoryId,
    status: product.status,
    inStock: product.inStock,
    isFeatured: product.isFeatured,
    heroRank: product.heroRank,
    leadTimeDays: product.leadTimeDays,
    warrantyMonths: product.warrantyMonths,
    material: product.material ?? "",
    dimensions: product.dimensions ?? "",
    colour: product.colour ?? "",
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
    images: product.images.map((i) => ({
      id: i.id, url: i.url, needsReview: i.needsReview,
      reviewNote: i.reviewNote, position: i.position,
    })),
    variants: product.variants.map((v) => ({
      id: v.id, name: v.name, price: v.price, warrantyMonths: v.warrantyMonths,
    })),
  };

  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-[0.85rem] text-muted hover:text-ink">
        <ArrowLeft2 size={14} /> All products
      </Link>
      <h1 className="mb-5 text-2xl font-semibold">{product.name}</h1>

      <ProductForm
        product={data}
        categories={categories.map((c) => ({
          id: c.id, name: c.name, parentName: c.parent?.name ?? null,
        }))}
        uploadsEnabled={uploadsConfigured()}
        saved={saved === "1"}
      />
    </>
  );
}
