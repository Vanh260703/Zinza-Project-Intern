import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// POST /api/novels/import — nhận file ZIP (multipart, field "file"), forward BE.
// BE xử lý bất đồng bộ (BullMQ) → trả ngay { jobId, message }, không đợi xử lý xong.
export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const res = await fetch(`${BE_URL}/api/v1/novels/import`, {
    method: "POST",
    headers: { Cookie: req.headers.get("cookie") ?? "" },
    body: formData,
  });

  const data = await res.json().catch(() => ({ message: "Phản hồi không hợp lệ từ máy chủ" }));
  return NextResponse.json(data, { status: res.status });
}
