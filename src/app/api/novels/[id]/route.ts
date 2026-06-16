import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";
import { updateNovelSchema, deleteNovelSchema } from "@/schemas/novel";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const result = updateNovelSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const story = db.stories.findById(id);
  if (!story) return NextResponse.json({ message: "Không tìm thấy truyện" }, { status: 404 });
  if (story.postedBy !== result.data.userId) {
    return NextResponse.json(
      { message: "Bạn không có quyền chỉnh sửa truyện này" },
      { status: 403 }
    );
  }

  const { userId: _userId, ...patch } = result.data;
  const updated = db.stories.update(id, patch);
  return NextResponse.json({ story: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const result = deleteNovelSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const story = db.stories.findById(id);
  if (!story) {
    return NextResponse.json({ message: "Không tìm thấy truyện" }, { status: 404 });
  }

  if (story.postedBy !== result.data.userId) {
    return NextResponse.json({ message: "Bạn không có quyền xóa truyện này" }, { status: 403 });
  }

  db.stories.delete(id);
  return NextResponse.json({ message: "Đã xóa truyện" });
}
