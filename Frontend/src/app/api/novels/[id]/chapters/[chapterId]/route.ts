import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";
import { updateChapterSchema } from "@/schemas/chapter";

type Params = Promise<{ id: string; chapterId: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { id, chapterId } = await params;
  const story = db.stories.findById(id);
  if (!story) return NextResponse.json({ message: "Không tìm thấy truyện" }, { status: 404 });

  const reader = db.chapters.getReader(story, chapterId);
  if (!reader) return NextResponse.json({ message: "Không tìm thấy chương" }, { status: 404 });

  return NextResponse.json({ chapter: reader.chapter, content: reader.content });
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { id, chapterId } = await params;
  const body = await req.json();

  const result = updateChapterSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Dữ liệu không hợp lệ", errors: result.error.flatten() },
      { status: 400 }
    );
  }

  const story = db.stories.findById(id);
  if (!story) return NextResponse.json({ message: "Không tìm thấy truyện" }, { status: 404 });

  const chapter = db.chapters.update(story, chapterId, result.data);
  if (!chapter) return NextResponse.json({ message: "Không tìm thấy chương" }, { status: 404 });

  return NextResponse.json({ chapter });
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const { id, chapterId } = await params;
  const story = db.stories.findById(id);
  if (!story) return NextResponse.json({ message: "Không tìm thấy truyện" }, { status: 404 });

  const deleted = db.chapters.delete(story, chapterId);
  if (!deleted) return NextResponse.json({ message: "Không tìm thấy chương" }, { status: 404 });

  return NextResponse.json({ message: "Đã xóa chương" });
}
