import { NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// GET /api/payments/candy-packages — danh sách gói kẹo đang bán, public
export async function GET() {
  const res = await fetch(`${BE_URL}/api/v1/payments/candy-packages`, {
    next: { revalidate: 300 },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
