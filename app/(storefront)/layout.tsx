import { CartToast } from "@/components/cart/CartToast";
import { Header, type NavCategory } from "@/components/layout/Header";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { Footer } from "@/components/layout/Footer";
import { OrganizationJsonLd } from "@/components/brand/OrganizationJsonLd";
import { getCategoryTree } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";
import { getSetting, type AnnouncementSettings, type ContactSettings } from "@/lib/settings";


export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [tree, contact, announcement] = await Promise.all([
    getCategoryTree().catch(() => []),
    getSetting<ContactSettings>("site.contact"),
    getSetting<AnnouncementSettings>("site.announcement"),
  ]);

  const categories: NavCategory[] = tree.map((room) => ({
    slug: room.slug,
    name: room.name,
    children: room.children.map((c) => ({
      slug: c.slug, name: c.name, count: c._count.productLinks,
    })),
  }));

  return (
    <>
      <OrganizationJsonLd contact={contact} siteUrl={siteUrl} />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
      >
        Skip to content
      </a>

      <Header categories={categories} announcement={announcement} phone={contact.phone} />

      <main id="main" className="pb-16 lg:pb-0">{children}</main>

      <Footer contact={contact} categories={categories} />
      <MobileTabBar />
      <CartToast />
    </>
  );
}
