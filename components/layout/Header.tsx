"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ShoppingCart, SearchNormal1, Menu, CloseSquare, User, Call, ArrowDown2,
} from "iconsax-reactjs";
import { Logo } from "@/components/brand/Logo";
import { useCart } from "@/components/cart/CartProvider";
import { SearchSheet } from "@/components/layout/SearchSheet";
import { cn } from "@/lib/utils";

export type NavCategory = {
  slug: string;
  name: string;
  children: { slug: string; name: string; count: number }[];
};

export type NavService = { slug: string; name: string; count: number };

/**
 * The workshop sells two things of equal weight, so the bar carries exactly
 * two destinations — not six rooms with the second trade hidden behind
 * "More". Each opens its own panel.
 */
export function Header({
  categories,
  services,
  announcement,
  phone,
}: {
  categories: NavCategory[];
  services: NavService[];
  announcement?: { enabled: boolean; text: string };
  phone?: string;
}) {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openTrade, setOpenTrade] = useState<"furniture" | "interiors" | null>(null);

  const onShop =
    pathname === "/shop" || pathname.startsWith("/c") || pathname.startsWith("/product");
  const onDesign = pathname.startsWith("/design");

  // A route change closes anything still open. Adjusted during render so the
  // drawer never paints once on the new page before closing itself.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
    setOpenTrade(null);
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const trade = (active: boolean) =>
    cn(
      "relative flex items-center gap-1 py-2 text-[0.95rem] transition",
      "after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-ink after:transition-opacity",
      active ? "text-ink after:opacity-100" : "text-ink-2 hover:text-ink after:opacity-0",
    );

  return (
    <>
      {announcement?.enabled && announcement.text && (
        <div className="bg-ink px-4 py-2 text-center text-[0.78rem] text-white/85">
          {announcement.text}
        </div>
      )}

      <header
        className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md"
        onMouseLeave={() => setOpenTrade(null)}
      >
        <div className="container-page flex h-[4.25rem] items-center gap-6 lg:h-20">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="-ml-2 grid size-10 place-items-center text-ink lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <Link href="/" className="shrink-0" aria-label="UrbanCraft home">
            <Logo markClassName="size-8 lg:size-9" />
          </Link>

          {/* ------------------------------------------------- the two trades */}
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Trades">
            <Link
              href="/shop"
              className={trade(onShop)}
              onMouseEnter={() => setOpenTrade("furniture")}
              onFocus={() => setOpenTrade("furniture")}
            >
              Furniture
              {categories.length > 0 && <ArrowDown2 size={13} />}
            </Link>

            <Link
              href="/design"
              className={trade(onDesign)}
              onMouseEnter={() => setOpenTrade("interiors")}
              onFocus={() => setOpenTrade("interiors")}
            >
              Interiors
              <ArrowDown2 size={13} />
            </Link>

            <Link
              href="/projects"
              className={trade(pathname.startsWith("/projects"))}
              onMouseEnter={() => setOpenTrade(null)}
              onFocus={() => setOpenTrade(null)}
            >
              Our work
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="mr-3 hidden items-center gap-2 text-[0.88rem] text-ink-2 transition hover:text-ink xl:flex"
              >
                <Call size={16} />
                {phone}
              </a>
            )}

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid size-10 place-items-center rounded-[2px] transition hover:bg-sand"
              aria-label="Search products"
            >
              <SearchNormal1 size={20} />
            </button>

            <Link
              href="/account"
              className="hidden size-10 place-items-center rounded-[2px] transition hover:bg-sand lg:grid"
              aria-label="Your account"
            >
              <User size={20} />
            </Link>

            <Link
              href="/cart"
              className="relative grid size-10 place-items-center rounded-[2px] transition hover:bg-sand"
              aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
            >
              <ShoppingCart size={20} />
              {ready && count > 0 && (
                <span className="figure-num absolute right-1 top-1.5 grid min-w-[1.05rem] place-items-center rounded-full bg-accent px-1 text-[0.6rem] font-semibold text-white">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* One panel for both trades, spanning the page container rather than
            hanging off the trigger: a 46rem sheet centred under "Furniture"
            ran straight off the left edge of the window. */}
        {openTrade && (
          <div className="absolute inset-x-0 top-full hidden border-b border-line bg-paper shadow-[0_24px_60px_-40px_rgba(26,26,24,0.4)] lg:block">
            <div className="container-page animate-fade-in py-7">
              {openTrade === "furniture" ? (
                categories.length > 0 && (
                  <>
                    <div className="grid grid-cols-3 gap-x-10 gap-y-1 xl:grid-cols-4">
                      {categories.map((room) => (
                        <Link
                          key={room.slug}
                          href={`/c/${room.slug}`}
                          className="flex items-baseline justify-between gap-4 rounded-[2px] px-2 py-2.5 text-[0.92rem] text-ink-2 transition hover:bg-sand hover:text-ink"
                        >
                          <span>{room.name}</span>
                          <span className="figure-num shrink-0 text-[0.78rem] text-muted">
                            {room.children.reduce((n, c) => n + c.count, 0)}
                          </span>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/shop"
                      className="mt-5 inline-block border-b border-ink pb-0.5 text-[0.88rem] text-ink"
                    >
                      All furniture
                    </Link>
                  </>
                )
              ) : (
                <>
                  {services.length > 0 ? (
                    <div className="grid grid-cols-3 gap-x-10 gap-y-1 xl:grid-cols-4">
                      {services.map((sv) => (
                        <Link
                          key={sv.slug}
                          href={`/design/${sv.slug}`}
                          className="flex items-baseline justify-between gap-4 rounded-[2px] px-2 py-2.5 text-[0.92rem] text-ink-2 transition hover:bg-sand hover:text-ink"
                        >
                          <span>{sv.name}</span>
                          {sv.count > 0 && (
                            <span className="figure-num shrink-0 text-[0.78rem] text-muted">
                              {sv.count}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="px-2 text-[0.9rem] text-ink-3">
                      Galleries are being photographed. Call the workshop and we will walk you
                      through recent installations.
                    </p>
                  )}
                  <Link
                    href="/design/enquire"
                    className="mt-5 inline-block border-b border-accent pb-0.5 text-[0.88rem] text-accent"
                  >
                    Book a site survey
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ---------------------------------------------------- mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 animate-fade-in bg-ink/30"
          />
          <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm animate-fade-in flex-col bg-paper">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Logo showTagline />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="grid size-10 place-items-center"
                aria-label="Close menu"
              >
                <CloseSquare size={22} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
              <p className="label-xs text-muted">Furniture</p>
              <div className="mt-3 border-t border-line">
                {categories.map((room) => (
                  <Link
                    key={room.slug}
                    href={`/c/${room.slug}`}
                    className="flex items-baseline justify-between border-b border-line py-3 text-[0.95rem]"
                  >
                    {room.name}
                    <span className="figure-num text-[0.78rem] text-muted">
                      {room.children.reduce((n, c) => n + c.count, 0)}
                    </span>
                  </Link>
                ))}
                <Link href="/shop" className="block py-3 text-[0.95rem] text-accent">
                  All furniture
                </Link>
              </div>

              <p className="label-xs mt-8 text-muted">Interiors</p>
              <div className="mt-3 border-t border-line">
                {services.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/design/${s.slug}`}
                    className="flex items-baseline justify-between border-b border-line py-3 text-[0.95rem]"
                  >
                    {s.name}
                    {s.count > 0 && (
                      <span className="figure-num text-[0.78rem] text-muted">{s.count}</span>
                    )}
                  </Link>
                ))}
                <Link href="/design/enquire" className="block py-3 text-[0.95rem] text-accent">
                  Book a site survey
                </Link>
              </div>

              <div className="mt-8 border-t border-line pt-4">
                {[
                  ["/projects", "Our work"],
                  ["/about", "About the workshop"],
                  ["/founder", "Meet the founder"],
                  ["/orders/track", "Track an order"],
                  ["/account", "Your account"],
                  ["/delivery", "Delivery & returns"],
                  ["/contact", "Contact"],
                ].map(([href, label]) => (
                  <Link key={href} href={href} className="block py-2.5 text-[0.9rem] text-ink-3">
                    {label}
                  </Link>
                ))}
              </div>
            </nav>

            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="flex items-center justify-center gap-2 border-t border-line px-5 py-4 text-[0.95rem] font-medium"
              >
                <Call size={18} /> {phone}
              </a>
            )}
          </div>
        </div>
      )}

      <SearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
