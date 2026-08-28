import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Warning2 } from "iconsax-reactjs";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { createSession, getSession, verifyCredentials } from "@/lib/auth";

export const metadata: Metadata = { title: "Workshop Sign In", robots: { index: false, follow: false } };

type SearchParams = Promise<{ error?: string; next?: string }>;

async function signIn(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "") || "/admin";

  const user = await verifyCredentials(email, password);
  if (!user) redirect(`/admin/login?error=1${next ? `&next=${encodeURIComponent(next)}` : ""}`);

  await createSession(user);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export default async function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { error, next } = await searchParams;
  if (await getSession()) redirect("/admin");

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center text-cream">
          <LogoMark className="size-12" />
          <h1 className="mt-4 font-display text-xl font-semibold">Workshop admin</h1>
          <p className="mt-1 text-[0.85rem] text-cream/50">UrbanCraft Furniture</p>
        </div>

        <form action={signIn} className="rounded-2xl bg-cream p-6">
          <input type="hidden" name="next" value={next ?? ""} />

          {error && (
            <p className="mb-4 flex items-center gap-2 rounded-xl bg-danger-soft px-4 py-3 text-[0.85rem] text-danger">
              <Warning2 size={16} /> Those details did not match.
            </p>
          )}

          <label className="block">
            <span className="mb-1.5 block text-[0.83rem] font-medium">Email</span>
            <input
              name="email" type="email" required autoFocus autoComplete="username"
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none transition focus:border-tan"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-[0.83rem] font-medium">Password</span>
            <input
              name="password" type="password" required autoComplete="current-password"
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none transition focus:border-tan"
            />
          </label>

          <Button type="submit" size="lg" className="mt-6 w-full">Sign in</Button>
        </form>
      </div>
    </div>
  );
}
