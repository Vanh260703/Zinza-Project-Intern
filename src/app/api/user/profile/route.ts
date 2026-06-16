import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";
import { updateProfileSchema } from "@/schemas/auth";

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  const result = updateProfileSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Dữ liệu không hợp lệ", errors: result.error.flatten() },
      { status: 400 }
    );
  }

  const { userId, ...patch } = result.data;

  await new Promise((r) => setTimeout(r, 400));

  const updated = db.users.update(userId, patch);
  if (!updated) {
    return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 });
  }

  return NextResponse.json({ user: updated });
}
