import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// [id] = slug truyện. POST /novels/:slug/gift-candy { amount } (BE lấy user qua cookie)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const res = await fetch(`${BE_URL}/api/v1/novels/${id}/gift-candy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.headers.get("cookie") ?? "",
    },
    body: JSON.stringify({ amount: body.amount }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
