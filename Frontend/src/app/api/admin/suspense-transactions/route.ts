import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const FORWARD_PARAMS = ["status", "reason", "page", "limit"];

// GET /api/admin/suspense-transactions — hàng đợi đối soát cho admin xử lý
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const be = new URL(`${BE_URL}/api/v1/admin/suspense-transactions`);
  for (const key of FORWARD_PARAMS) {
    const v = searchParams.get(key);
    if (v !== null) be.searchParams.set(key, v);
  }

  const res = await fetch(be, {
    headers: { Cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
