import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/schemas/auth";
import { db } from "@/lib/mock-db";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const result = forgotPasswordSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ message: "Email không hợp lệ" }, { status: 400 });
  }

  await new Promise((r) => setTimeout(r, 800));

  // Không tiết lộ email có tồn tại hay không — luôn trả về thành công
  // để tránh user enumeration attack
  const user = db.users.findByEmail(result.data.email);
  if (user) {
    // TODO: gửi email thật (nodemailer, resend, v.v.)
    console.log(`[mock] Reset link sent to ${result.data.email}`);
  }

  return NextResponse.json({
    message: "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.",
  });
}
