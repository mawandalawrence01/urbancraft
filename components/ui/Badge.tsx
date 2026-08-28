import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-sand text-ink-3",
  tan: "bg-tan-soft text-tan-2",
  success: "bg-success-soft text-success",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  ink: "bg-ink text-cream",
} as const;

export function Badge({
  tone = "neutral", className, children,
}: { tone?: keyof typeof tones; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.7rem] font-medium leading-none",
      tones[tone], className,
    )}>
      {children}
    </span>
  );
}
