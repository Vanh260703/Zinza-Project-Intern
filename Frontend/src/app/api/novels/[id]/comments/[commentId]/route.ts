import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Params = { params: Promise<{ id: string; commentId: string }> };

// DELETE /api/novels/:slug/comments/:commentId
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id, commentId } = await params;

  const res = await fetch(`${BE_URL}/api/v1/novels/${id}/comments/${commentId}`, {
    method: "DELETE",
    headers: { Cookie: req.headers.get("cookie") ?? "" },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
