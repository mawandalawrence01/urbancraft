import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Chart2, Box, Category, Receipt21, Gallery, Message2, Setting2, Logout, Shop,
} from "iconsax-reactjs";

import { LogoMark } from "@/components/brand/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { destroySession, getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [newOrders, newEnquiries, flaggedImages] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.productImage.count({ where: { needsReview: true } }),
  ]);

  const items = [
    { href: "/admin", label: "Dashboard", icon: "Chart2" as const },
    { href: "/admin/orders", label: "Orders", icon: "Receipt21" as const, badge: newOrders },
    { href: "/admin/products", label: "Products", icon: "Box" as const },
    { href: "/admin/categories", label: "Categories", icon: "Category" as const },
    { href: "/admin/images", label: "Image review", icon: "Gallery" as const, badge: flaggedImages },
    { href: "/admin/projects", label: "Our work", icon: "Shop" as const },
    { href: "/admin/enquiries", label: "Enquiries", icon: "Message2" as const, badge: newEnquiries },
    { href: "/admin/settings", label: "Settings", icon: "Setting2" as const },
  ];

  async function signOut() {
    "use server";
    await destroySession();
    redirect("/admin/login");
  }

  return (
    <div className="min-h-dvh bg-sand/40 lg:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-cream lg:flex lg:h-dvh lg:sticky lg:top-0">
        <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
          <LogoMark className="size-8" />
          <div className="min-w-0">
            <p className="truncate font-display text-[0.95rem] font-semibold">UrbanCraft</p>
            <p className="truncate text-[0.72rem] text-muted">Workshop admin</p>
          </div>
        </div>

        <AdminNav items={items} />

        <div className="border-t border-line p-3">
          <p className="truncate px-2 text-[0.78rem] font-medium">{session.name}</p>
          <p className="truncate px-2 text-[0.72rem] text-muted">{session.email}</p>
          <form action={signOut}>
            <button
              type="submit"
              className="mt-2 flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-[0.85rem] text-muted transition hover:bg-sand hover:text-danger"
            >
              <Logout size={17} /> Sign out
            </button>
          </form>
          <Link
            href="/"
            className="mt-0.5 flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-[0.85rem] text-muted transition hover:bg-sand hover:text-ink"
          >
            <Shop size={17} /> View storefront
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <AdminNav items={items} mobile signOutAction={signOut} name={session.name} />
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </div>
  );
}
