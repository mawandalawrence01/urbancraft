import { NextResponse } from "next/server";
import { getFeedPage, MAX_FEED_PAGE } from "@/lib/feed";

/** The next batch of the home page feed. Public, identical for every visitor. */
export async function GET(request: Request) {
  const raw = Number(new URL(request.url).searchParams.get("page"));
  if (!Number.isInteger(raw) || raw < 0 || raw > MAX_FEED_PAGE) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 });
  }

  const page = await getFeedPage(raw);
  return NextResponse.json(page, {
    // Matches the home page's own revalidate window.
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
