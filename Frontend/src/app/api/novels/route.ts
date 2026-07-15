import { NextRequest, NextResponse } from "next/server";
import { normalizeNovel, type BeNovel } from "@/lib/normalizeNovel";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Các param đẩy thẳng xuống BE GET /novels
const FORWARD_PARAMS = ["ids", "vip", "sort", "status", "limit", "category", "q", "page"];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

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

// POST /api/novels — tạo truyện mới. BE nhận cover trong CÙNG request (multipart)
// và tự validate (name/author/categories UUID...) qua ValidationPipe.
export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const res = await fetch(`${BE_URL}/api/v1/novels`, {
    method: "POST",
    headers: { Cookie: req.headers.get("cookie") ?? "" },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  // Response tạo mới thiếu nhiều field so với Novel đầy đủ (rating, chapterCount...)
  // → không ép qua normalizeNovel; chỉ trả field cần cho toast + redirect.
  return NextResponse.json(
    {
      novel: {
        id: data.id,
        slug: data.slug,
        name: data.name,
        author: data.author,
        posterUrl: data.poster ?? null,
        status: data.status,
      },
    },
    { status: res.status }
  );
}
