import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";
import { topupSchema } from "@/schemas/admin";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const parsed = topupSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const user = db.users.findById(id);
  if (!user) return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 });

  const updated = db.users.update(id, { candy: user.candy + parsed.data.amount });
  if (!updated) return NextResponse.json({ message: "Cập nhật thất bại" }, { status: 500 });

  const { password: _, ...safe } = updated;
  return NextResponse.json({ user: safe });
}
