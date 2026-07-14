import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/schemas/auth";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const result = forgotPasswordSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ message: "Email không hợp lệ" }, { status: 400 });
  }

  // Gọi BE — không quan tâm response để tránh user enumeration attack
  await fetch(`${BE_URL}/api/v1/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result.data),
  }).catch(() => {});

  return NextResponse.json({
    message: "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.",
  });
}
