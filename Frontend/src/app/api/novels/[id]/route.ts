import { NextRequest, NextResponse } from "next/server";
import { normalizeNovel, type BeNovel } from "@/lib/normalizeNovel";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Params = Promise<{ id: string }>; // [id] = slug (BE định danh theo slug)

// GET /api/novels/:slug — chi tiết truyện
export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { id: slug } = await params;
  const res = await fetch(`${BE_URL}/api/v1/novels/${slug}`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json(normalizeNovel(data as BeNovel));
}

// PATCH /api/novels/:slug — sửa truyện. BE check owner qua cookie.
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { id: slug } = await params;
  const body = await req.json();

  // Chỉ forward field BE cho phép
  const patch: Record<string, unknown> = {};
  for (const k of ["name", "author", "description", "status", "categories"] as const) {
    if (body[k] !== undefined) patch[k] = body[k];
  }

  const res = await fetch(`${BE_URL}/api/v1/novels/${slug}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: req.headers.get("cookie") ?? "" },
    body: JSON.stringify(patch),
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json({ novel: normalizeNovel(data as BeNovel) });
}

// DELETE /api/novels/:slug — xoá truyện. BE check owner qua cookie.
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const { id: slug } = await params;
  const res = await fetch(`${BE_URL}/api/v1/novels/${slug}`, {
    method: "DELETE",
    headers: { Cookie: req.headers.get("cookie") ?? "" },
  });
  const data = await res.json().catch(() => ({ message: "Đã xóa truyện" }));
  return NextResponse.json(data, { status: res.status });
}
