import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";
import { z } from "zod";

const createChapterSchema = z.object({
  userId:      z.string().min(1),
  title:       z.string().min(1, "Tiêu đề không được để trống").max(200).trim(),
  content:     z.string().min(1, "Nội dung không được để trống").trim(),
  candyPrice:  z.number().int().min(0).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const story = db.stories.findById(id);
  if (!story) return NextResponse.json({ message: "Không tìm thấy truyện" }, { status: 404 });

  const chapters = db.chapters.getIndex(story.slug);
  const enriched = chapters.map((ch) => {
    let wordCount = ch.wordCount;
    if (wordCount === undefined) {
      try {
        const content = db.chapters.getContent(story.id, story.slug, ch.filename);
        wordCount = content.replace(/\s/g, "").length;
      } catch {
        wordCount = 0;
      }
    }
    let createdAt = ch.createdAt;
    if (!createdAt) {
      const ts = parseInt(ch.filename.split("_")[1]?.replace(".txt", "") ?? "", 10);
      createdAt = ts > 1_000_000_000_000 ? new Date(ts).toISOString() : undefined;
    }
    return { ...ch, wordCount, views: ch.views ?? 0, createdAt };
  });
  return NextResponse.json(enriched);
}

// Thêm chương
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const result = createChapterSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Dữ liệu không hợp lệ", errors: result.error.flatten() },
      { status: 400 }
    );
  }

  const story = db.stories.findById(id);
  if (!story) return NextResponse.json({ message: "Không tìm thấy truyện" }, { status: 404 });
  if (story.postedBy !== result.data.userId) {
    return NextResponse.json({ message: "Bạn không có quyền đăng chương cho truyện này" }, { status: 403 });
  }

  await new Promise((r) => setTimeout(r, 400));

  const { userId, ...chapterData } = result.data;
  const chapter = db.chapters.create(story, chapterData);
  return NextResponse.json({ chapter }, { status: 201 });
}
