import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// GET /api/user/bookmarks — danh sách truyện đã lưu
export async function GET(req: NextRequest) {
  const res = await fetch(`${BE_URL}/api/v1/user/bookmarks`, {
    headers: { Cookie: req.headers.get("cookie") ?? "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
