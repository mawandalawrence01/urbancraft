import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap";

const variants = {
  primary: "bg-ink text-cream hover:bg-ink-2",
  tan: "bg-tan text-white hover:bg-tan-2",
  outline: "border border-line bg-paper text-ink hover:border-ink hover:bg-sand",
  ghost: "text-ink hover:bg-sand",
  danger: "bg-danger text-white hover:brightness-95",
} as const;

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.9rem]",
  lg: "h-13 px-7 text-base",
} as const;

export type ButtonProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function Button({
  variant = "primary", size = "md", className, ...props
}: ComponentProps<"button"> & ButtonProps) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  variant = "primary", size = "md", className, ...props
}: ComponentProps<typeof Link> & ButtonProps) {
  return <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
