import { NextRequest, NextResponse } from "next/server";
import { normalizeNovel, type BeNovel } from "@/lib/normalizeNovel";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const FORWARD_PARAMS = ["sort", "status", "q", "category", "page", "limit"];

// GET /api/user/my-novels — truyện của chính mình
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const be = new URL(`${BE_URL}/api/v1/user/my-novels`);
  for (const key of FORWARD_PARAMS) {
    const v = searchParams.get(key);
    if (v !== null) be.searchParams.set(key, v);
  }
  if (!be.searchParams.has("limit")) be.searchParams.set("limit", "100");

  const res = await fetch(be, {
    headers: { Cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
  });
  if (!res.ok) return NextResponse.json([], { status: res.status });

  const json = (await res.json()) as { data?: BeNovel[] };
  return NextResponse.json((json.data ?? []).map(normalizeNovel));
}
