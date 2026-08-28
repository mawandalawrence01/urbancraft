import { NextResponse } from "next/server";
import { quickSearch } from "@/lib/catalog";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (q.trim().length < 2) return NextResponse.json([]);

  const hits = await quickSearch(q, 6);
  return NextResponse.json(hits, {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" },
  });
}
