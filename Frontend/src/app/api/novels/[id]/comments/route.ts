import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// [id] ở đây chính là slug truyện (BE dùng slug cho comment)

// GET /api/novels/:slug/comments?page=&limit=
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const qs = req.nextUrl.searchParams.toString();

  const res = await fetch(`${BE_URL}/api/v1/novels/${id}/comments${qs ? `?${qs}` : ""}`, {
    headers: { Cookie: req.headers.get("cookie") ?? "" },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// POST /api/novels/:slug/comments  { content }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const res = await fetch(`${BE_URL}/api/v1/novels/${id}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.headers.get("cookie") ?? "",
    },
    body: JSON.stringify({ content: body.content }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
