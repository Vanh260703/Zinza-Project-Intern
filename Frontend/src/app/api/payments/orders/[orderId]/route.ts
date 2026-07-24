import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Params = { params: Promise<{ orderId: string }> };

// GET /api/payments/orders/:orderId — trạng thái đơn (dùng để polling)
export async function GET(req: NextRequest, { params }: Params) {
  const { orderId } = await params;
  const res = await fetch(`${BE_URL}/api/v1/payments/orders/${orderId}`, {
    headers: { Cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
