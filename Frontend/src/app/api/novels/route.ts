import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";
import { createNovelSchema } from "@/schemas/novel";
import { normalizeNovel, type BeNovel } from "@/lib/normalizeNovel";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Các param đẩy thẳng xuống BE GET /novels
const FORWARD_PARAMS = ["ids", "vip", "sort", "status", "limit", "category", "q", "page"];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  if (searchParams.get("all") === "true") {
    return NextResponse.json(db.novels.getAll());
  }

  const postedBy = searchParams.get("postedBy");
  if (postedBy) {
    return NextResponse.json(db.novels.getByUser(postedBy));
  }

  // Còn lại → BE thật, chuẩn hoá BE novel → Novel
  const be = new URL(`${BE_URL}/api/v1/novels`);
  for (const key of FORWARD_PARAMS) {
    const v = searchParams.get(key);
    if (v !== null) be.searchParams.set(key, v);
  }

  const res = await fetch(be, { headers: { Cookie: req.headers.get("cookie") ?? "" } });
  if (!res.ok) return NextResponse.json([], { status: res.status });

  const json = (await res.json()) as { data?: BeNovel[] };
  return NextResponse.json((json.data ?? []).map(normalizeNovel));
}

// POST /api/novels
export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = createNovelSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Dữ liệu không hợp lệ", errors: result.error.flatten() },
      { status: 400 }
    );
  }

  await new Promise((r) => setTimeout(r, 500));

  const novel = db.novels.create(result.data);
  return NextResponse.json({ novel }, { status: 201 });
}
