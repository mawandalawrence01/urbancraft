"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home2, Element3, ShoppingCart, User, Shop } from "iconsax-reactjs";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home", Icon: Home2 },
  { href: "/shop", label: "Shop", Icon: Shop },
  { href: "/c", label: "Rooms", Icon: Element3 },
  { href: "/cart", label: "Cart", Icon: ShoppingCart },
  { href: "/account", label: "Account", Icon: User },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();
  const { count, ready } = useCart();

  // The admin area has its own chrome
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5">
        {TABS.map(({ href, label, Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2.5 text-[0.66rem] transition",
                  active ? "text-tan-2" : "text-muted",
                )}
                aria-current={active ? "page" : undefined}
              >
                <span className="relative">
                  <Icon size={21} variant={active ? "Bold" : "Linear"} />
                  {href === "/cart" && ready && count > 0 && (
                    <span className="tabular absolute -right-2 -top-1.5 grid min-w-[1.05rem] place-items-center rounded-full bg-tan px-1 text-[0.58rem] font-semibold text-white">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
