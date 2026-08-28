"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import {
  TickCircle, Warning2, Trash, ArrowUp2, ArrowDown2, Gallery, Add, ExportSquare,
} from "iconsax-reactjs";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, Field, inputClass } from "@/components/admin/ui";
import {
  clearImageFlag, deleteProduct, deleteProductImage, reorderProductImage,
  saveProduct, setHeroRank, uploadProductImages, type ActionState,
} from "@/lib/actions/products";
import { cn, formatUGX, slugify } from "@/lib/utils";

export type ProductFormData = {
  id: string | null;
  name: string; slug: string; sku: string;
  price: number; compareAtPrice: number | null;
  summary: string; bodyText: string;
  categoryId: string | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  inStock: boolean; isFeatured: boolean; heroRank: number | null;
  leadTimeDays: number; warrantyMonths: number;
  material: string; dimensions: string; colour: string;
  seoTitle: string; seoDescription: string;
  images: {
    id: string; url: string; needsReview: boolean; reviewNote: string | null; position: number;
  }[];
  variants: { id: string; name: string; price: number; warrantyMonths: number | null }[];
};

export function ProductForm({
  product, categories, uploadsEnabled, saved,
}: {
  product: ProductFormData;
  categories: { id: string; name: string; parentName: string | null }[];
  uploadsEnabled: boolean;
  saved?: boolean;
}) {
  const save = saveProduct.bind(null, product.id);
  const [state, action, pending] = useActionState<ActionState, FormData>(save, {});
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(product.slug));

  const err = (n: string) => state.fieldErrors?.[n];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:items-start">
      <form id="product-form" action={action} className="space-y-5">
        {saved && (
          <p className="flex items-center gap-2 rounded-xl bg-success-soft px-4 py-3 text-[0.88rem] text-success">
            <TickCircle size={17} variant="Bold" /> Saved.
          </p>
        )}
        {state.error && (
          <p className="flex items-center gap-2 rounded-xl bg-danger-soft px-4 py-3 text-[0.88rem] text-danger">
            <Warning2 size={17} /> {state.error}
          </p>
        )}

        <Card className="space-y-4 p-5">
          <Field label="Name" error={err("name")}>
            <input
              name="name" value={name} required className={inputClass}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
            />
          </Field>

          <Field label="URL slug" error={err("slug")} hint={`/product/${slug || "…"}`}>
            <input
              name="slug" value={slug} className={inputClass}
              onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price (UGX)" error={err("price")} hint={formatUGX(product.price)}>
              <input name="price" type="number" inputMode="numeric" defaultValue={product.price}
                     required min={1000} step={1000} className={inputClass} />
            </Field>
            <Field label="Was (UGX)" hint="Leave blank if not on offer" error={err("compareAtPrice")}>
              <input name="compareAtPrice" type="number" inputMode="numeric"
                     defaultValue={product.compareAtPrice ?? ""} min={0} step={1000} className={inputClass} />
            </Field>
          </div>

          <Field label="Short summary" hint="One line, used on cards and in search results.">
            <input name="summary" defaultValue={product.summary} maxLength={400} className={inputClass} />
          </Field>

          <Field
            label="Description"
            hint="Blank line between paragraphs. Start a line with “- ” to make it a bullet."
          >
            <textarea name="bodyText" rows={10} defaultValue={product.bodyText} className={inputClass} />
          </Field>
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="font-display font-semibold">Specification</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SKU / item code" error={err("sku")}>
              <input name="sku" defaultValue={product.sku} className={inputClass} />
            </Field>
            <Field label="Material">
              <input name="material" defaultValue={product.material} placeholder="Mahogany, Elgon teak" className={inputClass} />
            </Field>
            <Field label="Dimensions">
              <input name="dimensions" defaultValue={product.dimensions} placeholder="180 × 90 × 75 cm" className={inputClass} />
            </Field>
            <Field label="Finish / colour">
              <input name="colour" defaultValue={product.colour} placeholder="Matte walnut" className={inputClass} />
            </Field>
            <Field label="Build time (days)">
              <input name="leadTimeDays" type="number" min={0} max={365} defaultValue={product.leadTimeDays} className={inputClass} />
            </Field>
            <Field label="Warranty (months)">
              <input name="warrantyMonths" type="number" min={0} max={240} defaultValue={product.warrantyMonths} className={inputClass} />
            </Field>
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="font-display font-semibold">Search engine listing</h2>
          <Field label="SEO title" hint="Falls back to the product name.">
            <input name="seoTitle" defaultValue={product.seoTitle} maxLength={200} className={inputClass} />
          </Field>
          <Field label="SEO description" hint="Roughly 150 characters shows in Google.">
            <textarea name="seoDescription" rows={3} defaultValue={product.seoDescription} maxLength={400} className={inputClass} />
          </Field>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Saving…" : product.id ? "Save changes" : "Create product"}
          </Button>
          {product.id && (
            <Link
              href={`/product/${product.slug}`} target="_blank"
              className="inline-flex items-center gap-1.5 text-[0.87rem] text-tan-2 hover:underline"
            >
              View on site <ExportSquare size={14} />
            </Link>
          )}
        </div>
      </form>

      {/* ------------------------------------------------------------- side */}
      <div className="space-y-5">
        <Card className="space-y-4 p-5">
          <h2 className="font-display font-semibold">Visibility</h2>

          {/* These live outside the <form> visually, so bind them by id. */}
          <Field label="Status">
            <select name="status" form="product-form" defaultValue={product.status} className={inputClass}>
              <option value="ACTIVE">Active — visible in the shop</option>
              <option value="DRAFT">Draft — hidden</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </Field>

          <Field label="Category">
            <select name="categoryId" form="product-form" defaultValue={product.categoryId ?? ""} className={inputClass}>
              <option value="">Uncategorised</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parentName ? `${c.parentName} › ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </Field>

          <label className="flex items-center gap-2.5 text-[0.88rem]">
            <input type="checkbox" name="inStock" form="product-form" defaultChecked={product.inStock}
                   className="size-4 accent-[var(--color-tan)]" />
            Ready to deliver
          </label>
          <label className="flex items-center gap-2.5 text-[0.88rem]">
            <input type="checkbox" name="isFeatured" form="product-form" defaultChecked={product.isFeatured}
                   className="size-4 accent-[var(--color-tan)]" />
            Mark as a bestseller
          </label>

          {product.id && (
            <div className="border-t border-line pt-4">
              <p className="text-[0.82rem] font-medium">Home page showcase</p>
              <p className="mt-1 text-[0.78rem] leading-relaxed text-muted">
                Curated pieces lead the home page hero and category tiles.
              </p>
              <HeroToggle productId={product.id} heroRank={product.heroRank} />
            </div>
          )}
        </Card>

        {product.id && (
          <ImageManager
            productId={product.id}
            images={product.images}
            uploadsEnabled={uploadsEnabled}
          />
        )}

        {product.variants.length > 0 && (
          <Card className="p-5">
            <h2 className="font-display font-semibold">Quality classes</h2>
            <ul className="mt-3 space-y-2">
              {product.variants.map((v) => (
                <li key={v.id} className="flex items-center justify-between rounded-lg bg-sand px-3 py-2 text-[0.85rem]">
                  <span>
                    {v.name}
                    {v.warrantyMonths ? (
                      <span className="ml-1.5 text-muted">· {v.warrantyMonths / 12}yr</span>
                    ) : null}
                  </span>
                  <span className="tabular font-medium">{formatUGX(v.price)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {product.id && (
          <Card className="p-5">
            <h2 className="font-display font-semibold text-danger">Danger zone</h2>
            <p className="mt-1.5 text-[0.83rem] leading-relaxed text-muted">
              Deleting removes the product and its photos permanently. Orders keep their own copy of
              what was bought, so history is not affected.
            </p>
            <form
              action={deleteProduct.bind(null, product.id)}
              onSubmit={(e) => {
                if (!confirm(`Delete “${product.name}” permanently?`)) e.preventDefault();
              }}
            >
              <Button type="submit" variant="danger" size="sm" className="mt-3">
                <Trash size={15} /> Delete product
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

function HeroToggle({ productId, heroRank }: { productId: string; heroRank: number | null }) {
  return (
    <form action={setHeroRank.bind(null, productId, heroRank === null ? 99 : null)}>
      <Button type="submit" variant={heroRank === null ? "outline" : "tan"} size="sm" className="mt-2.5">
        {heroRank === null ? "Add to showcase" : "Remove from showcase"}
      </Button>
    </form>
  );
}

function ImageManager({
  productId, images, uploadsEnabled,
}: {
  productId: string;
  images: ProductFormData["images"];
  uploadsEnabled: boolean;
}) {
  const upload = uploadProductImages.bind(null, productId);
  const [state, action, pending] = useActionState<ActionState, FormData>(upload, {});
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 font-display font-semibold">
        <Gallery size={18} className="text-tan" /> Photos
      </h2>

      {state.error && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2 text-[0.82rem] text-danger">
          <Warning2 size={15} className="mt-0.5 shrink-0" /> {state.error}
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {images.map((img, i) => (
          <li key={img.id} className="flex items-center gap-3 rounded-xl border border-line p-2">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-sand">
              <Image src={img.url} alt="" fill sizes="56px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              {i === 0 && <Badge tone="ink">Main photo</Badge>}
              {img.needsReview && (
                <>
                  <Badge tone="warn">Needs replacing</Badge>
                  {img.reviewNote && (
                    <p className="mt-1 text-[0.72rem] leading-snug text-muted">{img.reviewNote}</p>
                  )}
                  <form action={clearImageFlag.bind(null, img.id)}>
                    <button type="submit" className="mt-1 text-[0.75rem] text-tan-2 underline">
                      Mark as fine
                    </button>
                  </form>
                </>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <form action={reorderProductImage.bind(null, img.id, "up")}>
                <button type="submit" disabled={i === 0} aria-label="Move up"
                        className="grid size-8 place-items-center rounded-lg hover:bg-sand disabled:opacity-25">
                  <ArrowUp2 size={14} />
                </button>
              </form>
              <form action={reorderProductImage.bind(null, img.id, "down")}>
                <button type="submit" disabled={i === images.length - 1} aria-label="Move down"
                        className="grid size-8 place-items-center rounded-lg hover:bg-sand disabled:opacity-25">
                  <ArrowDown2 size={14} />
                </button>
              </form>
              <form
                action={deleteProductImage.bind(null, img.id)}
                onSubmit={(e) => { if (!confirm("Delete this photo?")) e.preventDefault(); }}
              >
                <button type="submit" aria-label="Delete photo"
                        className="grid size-8 place-items-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger">
                  <Trash size={14} />
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>

      {uploadsEnabled ? (
        <form ref={formRef} action={action} className="mt-4">
          <input
            ref={inputRef} type="file" name="images" accept="image/*" multiple hidden
            onChange={() => formRef.current?.requestSubmit()}
          />
          <Button
            type="button" variant="outline" size="sm" className="w-full"
            disabled={pending} onClick={() => inputRef.current?.click()}
          >
            <Add size={16} /> {pending ? "Uploading…" : "Add photos"}
          </Button>
          <p className="mt-2 text-[0.75rem] leading-relaxed text-muted">
            JPEG, PNG or WebP up to 12MB. We resize and convert automatically.
          </p>
        </form>
      ) : (
        <p className="mt-4 rounded-lg bg-warn-soft px-3 py-2.5 text-[0.78rem] leading-relaxed text-warn">
          Set <code className="font-mono">BLOB_READ_WRITE_TOKEN</code> to enable photo uploads.
        </p>
      )}
    </Card>
  );
}
