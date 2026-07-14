import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// POST /api/user/bookmarks/:storyId — toggle lưu/bỏ lưu truyện
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params;

  const res = await fetch(`${BE_URL}/api/v1/user/bookmarks/${storyId}`, {
    method: "POST",
    headers: { Cookie: req.headers.get("cookie") ?? "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
