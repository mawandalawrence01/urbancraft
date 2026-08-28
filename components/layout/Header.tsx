"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ShoppingCart, SearchNormal1, Menu, CloseSquare, User, ArrowDown2, Call,
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

export function Header({
  categories,
  announcement,
  phone,
}: {
  categories: NavCategory[];
  announcement?: { enabled: boolean; text: string };
  phone?: string;
}) {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openRoom, setOpenRoom] = useState<string | null>(null);

  // Ten rooms will not fit on one line; keep the busiest inline and tuck the
  // rest behind "More" so the bar never wraps.
  const primary = categories.slice(0, 6);
  const overflow = categories.slice(6);

  // Route change closes anything still open
  useEffect(() => {
    setMenuOpen(false);
    setOpenRoom(null);
  }, [pathname]);

  // A fixed drawer over a scrolling body is disorienting on mobile
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      {announcement?.enabled && announcement.text && (
        <div className="bg-ink px-4 py-2 text-center text-[0.78rem] text-cream/90">
          {announcement.text}
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-line bg-cream/85 backdrop-blur-md">
        <div className="container-page flex h-16 items-center gap-3 lg:h-18">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="-ml-2 grid size-10 place-items-center rounded-full text-ink lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <Link href="/" className="shrink-0" aria-label="UrbanCraft home">
            <Logo markClassName="size-8 lg:size-9" />
          </Link>

          <nav className="ml-5 hidden items-center gap-0.5 lg:flex xl:ml-7">
            {primary.map((room) => (
              <div
                key={room.slug}
                className="relative"
                onMouseEnter={() => setOpenRoom(room.slug)}
                onMouseLeave={() => setOpenRoom(null)}
              >
                <Link
                  href={`/c/${room.slug}`}
                  className={cn(
                    "flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-[0.86rem] transition hover:bg-sand xl:px-3",
                    pathname === `/c/${room.slug}` && "bg-sand",
                  )}
                >
                  {room.name}
                  {room.children.length > 1 && <ArrowDown2 size={13} />}
                </Link>

                {openRoom === room.slug && room.children.length > 1 && (
                  <div className="absolute left-0 top-full w-60 pt-2">
                    <div className="animate-fade-in overflow-hidden rounded-2xl border border-line bg-paper p-2 shadow-[0_18px_40px_-24px_rgba(23,21,15,0.4)]">
                      {room.children.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/c/${c.slug}`}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-[0.87rem] transition hover:bg-sand"
                        >
                          {c.name}
                          <span className="tabular text-xs text-muted">{c.count}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {overflow.length > 0 && (
              <div
                className="relative"
                onMouseEnter={() => setOpenRoom("__more")}
                onMouseLeave={() => setOpenRoom(null)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-[0.86rem] transition hover:bg-sand xl:px-3"
                  aria-expanded={openRoom === "__more"}
                >
                  More <ArrowDown2 size={13} />
                </button>
                {openRoom === "__more" && (
                  <div className="absolute left-0 top-full w-56 pt-2">
                    <div className="animate-fade-in overflow-hidden rounded-2xl border border-line bg-paper p-2 shadow-[0_18px_40px_-24px_rgba(23,21,15,0.4)]">
                      {overflow.map((room) => (
                        <Link
                          key={room.slug}
                          href={`/c/${room.slug}`}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-[0.87rem] transition hover:bg-sand"
                        >
                          {room.name}
                        </Link>
                      ))}
                      <Link
                        href="/projects"
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-[0.87rem] transition hover:bg-sand"
                      >
                        Our Work
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="mr-2 hidden items-center gap-2 whitespace-nowrap text-[0.83rem] text-ink-3 transition hover:text-ink 2xl:flex"
              >
                <Call size={17} />
                {phone}
              </a>
            )}

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid size-10 place-items-center rounded-full transition hover:bg-sand"
              aria-label="Search products"
            >
              <SearchNormal1 size={20} />
            </button>

            <Link
              href="/account"
              className="hidden size-10 place-items-center rounded-full transition hover:bg-sand lg:grid"
              aria-label="Your account"
            >
              <User size={20} />
            </Link>

            <Link
              href="/cart"
              className="relative grid size-10 place-items-center rounded-full transition hover:bg-sand"
              aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
            >
              <ShoppingCart size={20} />
              {ready && count > 0 && (
                <span className="tabular absolute right-0.5 top-0.5 grid min-w-[1.15rem] place-items-center rounded-full bg-tan px-1 text-[0.62rem] font-semibold text-white">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------- mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 animate-fade-in bg-ink/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm animate-fade-in flex-col bg-cream">
            <div className="flex items-center justify-between border-b border-line px-4 py-4">
              <Logo showTagline />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="grid size-10 place-items-center rounded-full"
                aria-label="Close menu"
              >
                <CloseSquare size={22} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-3">
              <Link
                href="/shop"
                className="mx-2 mb-2 flex items-center justify-between rounded-xl bg-ink px-4 py-3 text-cream"
              >
                <span className="font-medium">Shop everything</span>
                <span className="text-sm text-cream/70">243 pieces</span>
              </Link>

              {categories.map((room) => (
                <div key={room.slug} className="px-2">
                  <button
                    type="button"
                    onClick={() => setOpenRoom(openRoom === room.slug ? null : room.slug)}
                    className="flex w-full items-center justify-between rounded-xl px-2 py-3 text-left"
                    aria-expanded={openRoom === room.slug}
                  >
                    <span className="font-display text-[0.98rem] font-medium">{room.name}</span>
                    {room.children.length > 1 ? (
                      <ArrowDown2
                        size={16}
                        className={cn("transition", openRoom === room.slug && "rotate-180")}
                      />
                    ) : null}
                  </button>

                  {(openRoom === room.slug || room.children.length <= 1) && (
                    <div className="pb-2 pl-2">
                      <Link
                        href={`/c/${room.slug}`}
                        className="block rounded-lg px-2 py-2 text-[0.88rem] text-ink-3"
                      >
                        All {room.name.toLowerCase()}
                      </Link>
                      {room.children.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/c/${c.slug}`}
                          className="flex items-center justify-between rounded-lg px-2 py-2 text-[0.88rem] text-ink-3"
                        >
                          {c.name}
                          <span className="tabular text-xs text-muted">{c.count}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-3 border-t border-line px-4 pt-3">
                {[
                  ["/projects", "Our Work"],
                  ["/about", "About the workshop"],
                  ["/orders/track", "Track an order"],
                  ["/account", "Your account"],
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
                className="flex items-center justify-center gap-2 border-t border-line bg-sand px-4 py-4 font-medium"
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
