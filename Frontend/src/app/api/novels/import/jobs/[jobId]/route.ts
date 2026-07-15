import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Params = Promise<{ jobId: string }>;

// GET /api/novels/import/jobs/:jobId — polling trạng thái job import ZIP.
// BE trả { jobId, state: waiting|active|completed|failed, result?, error? }.
export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { jobId } = await params;

  const res = await fetch(`${BE_URL}/api/v1/novels/import/jobs/${jobId}`, {
    headers: { Cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({ message: "Phản hồi không hợp lệ từ máy chủ" }));
  return NextResponse.json(data, { status: res.status });
}
