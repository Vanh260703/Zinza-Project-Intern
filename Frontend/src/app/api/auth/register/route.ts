import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/schemas/auth";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const result = registerSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Dữ liệu không hợp lệ", errors: result.error.flatten() },
      { status: 400 }
    );
  }

  const beRes = await fetch(`${BE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result.data),
  });

  const json = await beRes.json().catch(() => ({}));

  if (!beRes.ok) {
    return NextResponse.json(
      { message: (json as { message?: string }).message ?? "Đăng ký thất bại" },
      { status: beRes.status }
    );
  }

  return NextResponse.json({ message: "Đăng ký thành công" }, { status: 201 });
}
