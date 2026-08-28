"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Chart2, Box, Category, Receipt21, Gallery, Message2, Setting2, Shop, Menu, CloseSquare, Logout,
} from "iconsax-reactjs";
import { LogoMark } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const ICONS = { Chart2, Box, Category, Receipt21, Gallery, Message2, Setting2, Shop };

export type NavItem = {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  badge?: number;
};

export function AdminNav({
  items, mobile = false, signOutAction, name,
}: {
  items: NavItem[];
  mobile?: boolean;
  signOutAction?: () => void;
  name?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const list = (
    <nav className="flex-1 overflow-y-auto p-3">
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.88rem] transition",
                  active ? "bg-ink text-cream" : "text-ink-3 hover:bg-sand",
                )}
              >
                <Icon size={18} variant={active ? "Bold" : "Linear"} />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span
                    className={cn(
                      "tabular grid min-w-5 place-items-center rounded-full px-1.5 text-[0.68rem] font-semibold",
                      active ? "bg-cream/20 text-cream" : "bg-tan text-white",
                    )}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  if (!mobile) return list;

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-cream px-4 py-3 lg:hidden">
        <button
          type="button" onClick={() => setOpen(true)}
          className="-ml-1 grid size-10 place-items-center rounded-full"
          aria-label="Open admin menu"
        >
          <Menu size={22} />
        </button>
        <LogoMark className="size-7" />
        <span className="font-display font-semibold">Admin</span>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button" aria-label="Close menu" onClick={() => setOpen(false)}
            className="absolute inset-0 animate-fade-in bg-ink/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-[80%] max-w-xs animate-fade-in flex-col bg-cream">
            <div className="flex items-center justify-between border-b border-line px-4 py-4">
              <span className="flex items-center gap-2.5">
                <LogoMark className="size-8" />
                <span className="font-display font-semibold">Admin</span>
              </span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
                <CloseSquare size={22} />
              </button>
            </div>
            {list}
            <div className="border-t border-line p-3">
              {name && <p className="px-2 pb-2 text-[0.78rem] font-medium">{name}</p>}
              {signOutAction && (
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-[0.85rem] text-muted"
                  >
                    <Logout size={17} /> Sign out
                  </button>
                </form>
              )}
              <Link href="/" className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[0.85rem] text-muted">
                <Shop size={17} /> View storefront
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
