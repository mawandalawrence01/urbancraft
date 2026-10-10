import { CartToast } from "@/components/cart/CartToast";
import { Header, type NavCategory, type NavService } from "@/components/layout/Header";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { Footer } from "@/components/layout/Footer";
import { OrganizationJsonLd } from "@/components/brand/OrganizationJsonLd";
import { getCategoryTree } from "@/lib/catalog";
import { getPublishedServices } from "@/lib/design";
import { siteUrl } from "@/lib/site";
import { getSetting, type AnnouncementSettings, type ContactSettings } from "@/lib/settings";


export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [tree, fitout, contact, announcement] = await Promise.all([
    getCategoryTree().catch(() => []),
    getPublishedServices("FITOUT").catch(() => []),
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

  const services: NavService[] = fitout.map((s) => ({
    slug: s.slug,
    name: s.name,
    count: s._count.images,
  }));

  return (
    <>
      <OrganizationJsonLd contact={contact} siteUrl={siteUrl} />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius-card)] focus:bg-ink focus:px-4 focus:py-2 focus:font-medium focus:text-white"
      >
        Skip to content
      </a>

      <Header
        categories={categories}
        services={services}
        announcement={announcement}
        phone={contact.phone}
      />

      <main id="main" className="pb-16 lg:pb-0">{children}</main>

      <Footer contact={contact} categories={categories} />
      <MobileTabBar />
      <CartToast />
    </>
  );
}
