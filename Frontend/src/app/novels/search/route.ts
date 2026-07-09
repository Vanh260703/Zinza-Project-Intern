import { NextRequest, NextResponse } from "next/server";
import { normalizeNovel, type BeNovel } from "@/lib/normalizeNovel";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// GET /novels/search?q=...&limit=4 — gợi ý nhanh cho ô tìm kiếm ở Navbar
// Proxy sang BE GET /novels (search theo name + slug + author) rồi chuẩn hoá → Novel[]
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = searchParams.get("limit") ?? "4";

  if (!q) return NextResponse.json({ results: [], total: 0 });

  const be = new URL(`${BE_URL}/api/v1/novels`);
  be.searchParams.set("q", q);
  be.searchParams.set("limit", limit);

  const res = await fetch(be);
  if (!res.ok) {
    return NextResponse.json({ results: [], total: 0 }, { status: res.status });
  }

  const json = (await res.json()) as { data?: BeNovel[]; meta?: { total?: number } };
  return NextResponse.json({
    results: (json.data ?? []).map(normalizeNovel),
    total: json.meta?.total ?? 0,
  });
}
