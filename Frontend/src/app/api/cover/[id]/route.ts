import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Params = Promise<{ id: string }>; // [id] = slug

// POST /api/cover/:slug — upload ảnh bìa (multipart). BE check owner qua cookie.
// BE trả { poster } → map sang { posterUrl } cho FE.
export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { id: slug } = await params;
  const formData = await req.formData();

  const res = await fetch(`${BE_URL}/api/v1/novels/${slug}/cover`, {
    method: "POST",
    headers: { Cookie: req.headers.get("cookie") ?? "" },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json({ posterUrl: data.poster });
}
