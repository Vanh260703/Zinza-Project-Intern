import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// POST /api/payments/orders — tạo đơn nạp kẹo thật. BE check user qua cookie.
export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${BE_URL}/api/v1/payments/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: req.headers.get("cookie") ?? "" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
