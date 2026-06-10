import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

export async function POST(req: NextRequest) {
  const { userId, amount } = await req.json();

  if (!userId || !amount || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ message: "Số kẹo không hợp lệ" }, { status: 400 });
  }

  const user = db.users.findById(userId);
  if (!user) {
    return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 });
  }

  const balance = user.candy as number;
  if (balance < amount) {
    return NextResponse.json({ message: "Số dư kẹo không đủ" }, { status: 400 });
  }

  db.users.update(userId, { candy: balance - amount } as never);

  return NextResponse.json({
    wallet: { userId, balance: balance - amount },
  });
}
