import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";
import { resetPasswordSchema } from "@/schemas/auth";

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  const result = resetPasswordSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Dữ liệu không hợp lệ", errors: result.error.flatten() },
      { status: 400 }
    );
  }

  const { userId, currentPassword, newPassword } = result.data;

  await new Promise((r) => setTimeout(r, 400));

  const user = db.users.findById(userId);
  if (!user) {
    return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 });
  }

  if (user.password !== currentPassword) {
    return NextResponse.json({ message: "Mật khẩu hiện tại không đúng" }, { status: 400 });
  }

  db.users.update(userId, { password: newPassword });

  return NextResponse.json({ message: "Đổi mật khẩu thành công" });
}
