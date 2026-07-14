import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const { storyId, chapterId } = await req.json() as {
    storyId?: string;
    chapterId?: string;
  };

  if (!storyId || !chapterId) {
    return NextResponse.json({ message: "Thiếu thông tin" }, { status: 400 });
  }

  // BE uses novelId instead of storyId
  const res = await fetch(`${BE_URL}/api/v1/user/daily-read`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.headers.get("cookie") ?? "",
    },
    body: JSON.stringify({ novelId: storyId, chapterId }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
