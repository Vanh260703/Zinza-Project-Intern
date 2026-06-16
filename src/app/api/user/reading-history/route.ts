import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

// DELETE /api/user/reading-history?userId=...&storyId=...
export async function DELETE(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const storyId = req.nextUrl.searchParams.get("storyId");

  if (!userId || !storyId) {
    return NextResponse.json({ message: "Thiếu thông tin" }, { status: 400 });
  }

  const user = db.users.findById(userId);
  if (!user) {
    return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 });
  }

  const current = user.lastReadChapters ?? {};
  if (!current[storyId]) {
    return NextResponse.json({ message: "Truyện không có trong lịch sử" }, { status: 404 });
  }

  // Xoá storyId khỏi lastReadChapters
  const { [storyId]: _, ...updated } = current;

  const result = db.users.update(userId, { lastReadChapters: updated });
  if (!result) {
    return NextResponse.json({ message: "Cập nhật thất bại" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
