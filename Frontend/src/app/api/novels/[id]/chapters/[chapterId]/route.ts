import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Params = Promise<{ id: string; chapterId: string }>; // [id] = slug

// GET /api/novels/:slug/chapters/:chapterId — nội dung chương (BE tự blank nếu khoá)
export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { id: slug, chapterId } = await params;
  const res = await fetch(`${BE_URL}/api/v1/novels/${slug}/chapters/${chapterId}`, {
    headers: { Cookie: req.headers.get("cookie") ?? "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// PATCH /api/novels/:slug/chapters/:chapterId — sửa chương. BE check owner qua cookie.
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { id: slug, chapterId } = await params;
  const body = await req.json();

  // Whitelist theo UpdateChapterDto (bỏ userId...)
  const payload: Record<string, unknown> = {};
  for (const k of ["title", "content", "price"] as const) {
    if (body[k] !== undefined) payload[k] = body[k];
  }

  const res = await fetch(`${BE_URL}/api/v1/novels/${slug}/chapters/${chapterId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: req.headers.get("cookie") ?? "" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// DELETE /api/novels/:slug/chapters/:chapterId — xoá chương. BE check owner qua cookie.
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const { id: slug, chapterId } = await params;
  const res = await fetch(`${BE_URL}/api/v1/novels/${slug}/chapters/${chapterId}`, {
    method: "DELETE",
    headers: { Cookie: req.headers.get("cookie") ?? "" },
  });
  const data = await res.json().catch(() => ({ message: "Đã xóa chương" }));
  return NextResponse.json(data, { status: res.status });
}
