import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// GET /api/user/reading-history — danh sách truyện đã đọc
export async function GET(req: NextRequest) {
  const res = await fetch(`${BE_URL}/api/v1/user/read-history`, {
    headers: { Cookie: req.headers.get("cookie") ?? "" },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// DELETE /api/user/reading-history?id=<recordId>
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "Thiếu thông tin" }, { status: 400 });
  }

  const res = await fetch(`${BE_URL}/api/v1/user/read-history/${id}`, {
    method: "DELETE",
    headers: { Cookie: req.headers.get("cookie") ?? "" },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
