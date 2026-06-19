import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

type Params = Promise<{ id: string; chapterId: string }>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { id, chapterId } = await params;
  const { userId } = await req.json();

  if (!userId) return NextResponse.json({ message: "Thiếu userId" }, { status: 400 });

  const story = db.stories.findById(id);
  if (!story) return NextResponse.json({ message: "Không tìm thấy truyện" }, { status: 404 });

  const chapter = db.chapters.getOne(story.slug, chapterId);
  if (!chapter) return NextResponse.json({ message: "Không tìm thấy chương" }, { status: 404 });

  const isOwner = story.postedBy === userId;
  const price = isOwner ? 0 : (chapter.price ?? 0);

  if (!isOwner && price === 0) {
    return NextResponse.json({ message: "Chương miễn phí" }, { status: 400 });
  }

  const result = db.users.unlockChapter(userId, chapterId, price);
  if ("error" in result) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  // Trả về nội dung chương sau khi mở khoá
  const content = db.chapters.getContent(story.id, story.slug, chapter.filename);
  return NextResponse.json({
    wallet: { userId, balance: (result.user as typeof result.user & { candy: number }).candy },
    content,
  });
}
