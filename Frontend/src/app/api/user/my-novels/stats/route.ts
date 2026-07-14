import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// GET /api/user/my-novels/stats — thống kê truyện của chính mình
export async function GET(req: NextRequest) {
  const res = await fetch(`${BE_URL}/api/v1/user/my-novels/stats`, {
    headers: { Cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
