import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const beRes = await fetch(`${BE_URL}/api/v1/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await beRes.json().catch(() => ({}));

  if (!beRes.ok) {
    return NextResponse.json(
      { message: (json as { message?: string }).message ?? "Đặt lại mật khẩu thất bại" },
      { status: beRes.status }
    );
  }

  return NextResponse.json({ message: "Đặt lại mật khẩu thành công" });
}
