import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Params = Promise<{ id: string; chapterId: string }>;

// POST /api/novels/:slug/chapters/:chapterId/unlock — mở khoá chương ([id] = slug)
export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { id, chapterId } = await params;

  const res = await fetch(`${BE_URL}/api/v1/novels/${id}/chapters/${chapterId}/unlock`, {
    method: "POST",
    headers: { Cookie: req.headers.get("cookie") ?? "" },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
