import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "uc_admin";

/**
 * Hosts that serve the admin at their own root.
 *
 * `admin.` is the conventional spelling; `www.admin.` is included because it
 * is what was asked for and a visitor who types it should not get an error.
 * Both rewrite to the same pages, and the session cookie is host-scoped, so a
 * sign-in here is never sent to the storefront host.
 */
const ADMIN_HOSTS = new Set([
  "admin.urbancraft.co.ug",
  "www.admin.urbancraft.co.ug",
]);

/** Paths the framework owns; rewriting these breaks the app. */
function isInfrastructure(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    // Anything with a file extension is a static asset in public/.
    /\.[a-z0-9]+$/i.test(pathname)
  );
}

async function signedIn(request: NextRequest) {
  const token = request.cookies.get(COOKIE)?.value;
  if (!token || !process.env.AUTH_SECRET) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
    return true;
  } catch {
    // expired or tampered
    return false;
  }
}

/**
 * Routes the admin subdomain and gates the admin area at the edge, so an
 * unauthenticated request never reaches a page that would query the database.
 * Pages still call requireAdmin() — this is the cheap first line, not the only
 * one.
 */
export async function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const { pathname } = request.nextUrl;
  const onAdminHost = ADMIN_HOSTS.has(host);

  if (onAdminHost) {
    if (isInfrastructure(pathname)) return NextResponse.next();

    // The admin host serves the admin at its root: /orders, not /admin/orders.
    const target = pathname.startsWith("/admin")
      ? pathname
      : pathname === "/"
        ? "/admin"
        : `/admin${pathname}`;

    const authed = pathname.startsWith("/admin/login") || target === "/admin/login"
      ? true
      : await signedIn(request);

    if (!authed) {
      const login = request.nextUrl.clone();
      login.pathname = "/login";
      // The login page only honours a `next` under /admin, so hand it the
      // rewritten path; otherwise a deep link always lands on the dashboard.
      if (target !== "/admin") login.searchParams.set("next", target);
      return NextResponse.redirect(login);
    }

    const url = request.nextUrl.clone();
    url.pathname = target;
    const res = NextResponse.rewrite(url);
    // A control panel has no business in a search index.
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // The storefront host keeps /admin working for existing bookmarks.
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  if (pathname === "/admin/login") return NextResponse.next();

  if (await signedIn(request)) return NextResponse.next();

  const login = new URL("/admin/login", request.url);
  if (pathname !== "/admin") login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  // Everything except the framework's own paths — the admin host needs to be
  // seen at "/" to rewrite it, which the old /admin-only matcher never was.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
