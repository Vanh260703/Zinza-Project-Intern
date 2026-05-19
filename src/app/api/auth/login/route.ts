import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/schemas/auth";
import { db } from "@/lib/mock-db";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Dữ liệu không hợp lệ", errors: result.error.flatten() },
      { status: 400 }
    );
  }

  const { email, password } = result.data;

  await new Promise((r) => setTimeout(r, 600));

  const user = db.users.findByEmail(email);
  if (!user || user.password !== password) {
    return NextResponse.json(
      { message: "Email hoặc mật khẩu không đúng" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    token: `mock-token-${user.id}`,
    user,
    history: user.isRead,
    bookmarks: user.storiesMark,
  });
}
