import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// [id] = slug truyện. POST /novels/:slug/nominate (BE lấy user qua cookie)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const res = await fetch(`${BE_URL}/api/v1/novels/${id}/nominate`, {
    method: "POST",
    headers: { Cookie: req.headers.get("cookie") ?? "" },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
