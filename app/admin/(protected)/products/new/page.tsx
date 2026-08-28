import Link from "next/link";
import { ArrowLeft2 } from "iconsax-reactjs";

import { ProductForm, type ProductFormData } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/db";
import { uploadsConfigured } from "@/lib/uploads";

const BLANK: ProductFormData = {
  id: null, name: "", slug: "", sku: "",
  price: 0, compareAtPrice: null,
  summary: "", bodyText: "",
  categoryId: null, status: "DRAFT",
  inStock: true, isFeatured: false, heroRank: null,
  leadTimeDays: 10, warrantyMonths: 24,
  material: "", dimensions: "", colour: "",
  seoTitle: "", seoDescription: "",
  images: [], variants: [],
};

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { position: "asc" }],
    select: { id: true, name: true, parent: { select: { name: true } } },
  });

  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-[0.85rem] text-muted hover:text-ink">
        <ArrowLeft2 size={14} /> All products
      </Link>
      <h1 className="mb-2 text-2xl font-semibold">New product</h1>
      <p className="mb-5 text-[0.88rem] text-muted">
        Save it first, then add photos. It stays a draft until you set it to Active.
      </p>

      <ProductForm
        product={BLANK}
        categories={categories.map((c) => ({
          id: c.id, name: c.name, parentName: c.parent?.name ?? null,
        }))}
        uploadsEnabled={uploadsConfigured()}
      />
    </>
  );
}
