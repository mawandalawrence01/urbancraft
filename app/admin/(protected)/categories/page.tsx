import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Add, ArrowUp2, ArrowDown2 } from "iconsax-reactjs";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, Field, PageHeader, inputClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

async function saveCategory(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const data = {
    name,
    description: String(formData.get("description") ?? "").trim() || null,
    parentId: String(formData.get("parentId") ?? "") || null,
    isActive: formData.get("isActive") === "on",
  };

  if (id) {
    await prisma.category.update({ where: { id }, data });
  } else {
    let slug = slugify(name);
    const clash = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
    if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    const last = await prisma.category.findFirst({
      where: { parentId: data.parentId }, orderBy: { position: "desc" }, select: { position: true },
    });
    await prisma.category.create({ data: { ...data, slug, position: (last?.position ?? -1) + 1 } });
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
}

async function moveCategory(id: string, direction: "up" | "down") {
  "use server";
  await requireAdmin();

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return;

  const neighbour = await prisma.category.findFirst({
    where: {
      parentId: category.parentId,
      position: direction === "up" ? { lt: category.position } : { gt: category.position },
    },
    orderBy: { position: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbour) return;

  await prisma.$transaction([
    prisma.category.update({ where: { id: category.id }, data: { position: neighbour.position } }),
    prisma.category.update({ where: { id: neighbour.id }, data: { position: category.position } }),
  ]);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export default async function CategoriesPage() {
  const rooms = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { position: "asc" },
    include: {
      children: {
        orderBy: { position: "asc" },
        include: { _count: { select: { productLinks: true } } },
      },
      _count: { select: { productLinks: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Rooms and the categories inside them. Order here is the order shown on the site."
      />

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="space-y-3">
          {rooms.map((room, roomIndex) => (
            <Card key={room.id} className="overflow-hidden">
              <div className="flex items-center gap-3 border-b border-line px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-display font-semibold">
                    {room.name}
                    {!room.isActive && <Badge tone="neutral">hidden</Badge>}
                  </p>
                  <p className="truncate text-[0.76rem] text-muted">
                    /c/{room.slug} · {room._count.productLinks} products
                  </p>
                </div>
                <div className="flex shrink-0 gap-0.5">
                  <form action={moveCategory.bind(null, room.id, "up")}>
                    <button type="submit" disabled={roomIndex === 0} aria-label="Move up"
                            className="grid size-8 place-items-center rounded-lg hover:bg-sand disabled:opacity-25">
                      <ArrowUp2 size={14} />
                    </button>
                  </form>
                  <form action={moveCategory.bind(null, room.id, "down")}>
                    <button type="submit" disabled={roomIndex === rooms.length - 1} aria-label="Move down"
                            className="grid size-8 place-items-center rounded-lg hover:bg-sand disabled:opacity-25">
                      <ArrowDown2 size={14} />
                    </button>
                  </form>
                </div>
              </div>

              <ul className="divide-y divide-line-2">
                {room.children.map((child, i) => (
                  <li key={child.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-[0.88rem]">
                        {child.name}
                        {!child.isActive && <Badge tone="neutral">hidden</Badge>}
                      </p>
                      <p className="truncate text-[0.74rem] text-muted">
                        /c/{child.slug} · {child._count.productLinks} products
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-0.5">
                      <form action={moveCategory.bind(null, child.id, "up")}>
                        <button type="submit" disabled={i === 0} aria-label="Move up"
                                className="grid size-7 place-items-center rounded-lg hover:bg-sand disabled:opacity-25">
                          <ArrowUp2 size={13} />
                        </button>
                      </form>
                      <form action={moveCategory.bind(null, child.id, "down")}>
                        <button type="submit" disabled={i === room.children.length - 1} aria-label="Move down"
                                className="grid size-7 place-items-center rounded-lg hover:bg-sand disabled:opacity-25">
                          <ArrowDown2 size={13} />
                        </button>
                      </form>
                      <Link
                        href={`/c/${child.slug}`} target="_blank"
                        className="grid size-7 place-items-center rounded-lg text-[0.7rem] text-tan-2 hover:bg-sand"
                      >
                        ↗
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-display font-semibold">
            <Add size={18} className="text-tan" /> Add a category
          </h2>
          <form action={saveCategory} className="mt-4 space-y-4">
            <Field label="Name">
              <input name="name" required className={inputClass} placeholder="Bar Stools" />
            </Field>
            <Field label="Inside which room?" hint="Leave blank to create a new top-level room.">
              <select name="parentId" className={inputClass} defaultValue="">
                <option value="">— Top level room —</option>
                {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </Field>
            <Field label="Description" hint="Shown under the heading on the category page.">
              <textarea name="description" rows={3} className={inputClass} />
            </Field>
            <label className="flex items-center gap-2.5 text-[0.88rem]">
              <input type="checkbox" name="isActive" defaultChecked className="size-4 accent-[var(--color-tan)]" />
              Visible on the site
            </label>
            <Button type="submit" className="w-full">Create category</Button>
          </form>
        </Card>
      </div>
    </>
  );
}
