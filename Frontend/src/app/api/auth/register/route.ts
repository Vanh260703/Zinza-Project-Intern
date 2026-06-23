import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/schemas/auth";
import { db } from "@/lib/mock-db";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const result = registerSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Dữ liệu không hợp lệ", errors: result.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, password, gender } = result.data;

  await new Promise((r) => setTimeout(r, 600));

  if (db.users.findByEmail(email)) {
    return NextResponse.json({ message: "Email đã được sử dụng" }, { status: 409 });
  }

  const user = db.users.create({
    name,
    email,
    password,
    gender,
    avatarUrl: "",
    role: "user",
    candy: 0,
    chaptersRead: 0,
    joinedAt: new Date().toISOString(),
    isRead: [],
    storiesMark: [],
    unlockedChapters: [],
    recommendationTicket: 0,
  });

  return NextResponse.json(
    { message: "Đăng ký thành công", user: { id: user.id, name, email } },
    { status: 201 }
  );
}
