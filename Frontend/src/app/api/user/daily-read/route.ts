import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const { novelId, chapterId } = await req.json() as {
    novelId?: string;
    chapterId?: string;
  };

  if (!novelId || !chapterId) {
    return NextResponse.json({ message: "Thiếu thông tin" }, { status: 400 });
  }

  // BE uses novelId instead of novelId
  const res = await fetch(`${BE_URL}/api/v1/user/daily-read`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.headers.get("cookie") ?? "",
    },
    body: JSON.stringify({ novelId: novelId, chapterId }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
