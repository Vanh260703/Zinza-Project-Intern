import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// BE keyed theo slug + user (cookie) — không có :id đánh giá riêng.

async function sendWithBody(req: NextRequest, slug: string, method: "POST" | "PATCH") {
  const body = await req.json();
  const res = await fetch(`${BE_URL}/api/v1/novels/${slug}/ratings`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Cookie: req.headers.get("cookie") ?? "",
    },
    body: JSON.stringify({ rating: body.rating, review: body.review }),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// POST /api/novels/:slug/ratings  { rating, review? } — tạo đánh giá
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return sendWithBody(req, id, "POST");
}

// PATCH /api/novels/:slug/ratings  { rating?, review? } — sửa đánh giá của mình
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return sendWithBody(req, id, "PATCH");
}

// DELETE /api/novels/:slug/ratings — xoá đánh giá của mình
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${BE_URL}/api/v1/novels/${id}/ratings`, {
    method: "DELETE",
    headers: { Cookie: req.headers.get("cookie") ?? "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
