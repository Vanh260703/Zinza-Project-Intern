import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: storyId } = await params;
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ message: "Thiếu thông tin" }, { status: 400 });
  }

  const story = db.stories.findById(storyId);
  if (!story) {
    return NextResponse.json({ message: "Không tìm thấy truyện" }, { status: 404 });
  }

  const user = db.users.findById(userId);
  if (!user) {
    return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 });
  }

  if (story.postedBy === userId) {
    return NextResponse.json(
      { message: "Bạn không thể đề cử truyện của chính mình" },
      { status: 403 }
    );
  }

  if ((user.recommendationTickets ?? 0) < 1) {
    return NextResponse.json({ message: "Bạn không còn vé đề cử tháng này" }, { status: 400 });
  }

  // Trừ vé user
  const updatedUser = db.users.update(userId, {
    recommendationTickets: user.recommendationTickets - 1,
  });

  // Tăng nominations story
  db.stories.update(storyId, { nominations: story.nominations + 1 });

  if (!updatedUser) {
    return NextResponse.json({ message: "Cập nhật thất bại" }, { status: 500 });
  }

  const { candy, isRead, storiesMark, unlockedChapters, ...safeUser } =
    updatedUser as typeof updatedUser & {
      candy: number;
      isRead: string[];
      storiesMark: string[];
      unlockedChapters: string[];
    };
  void candy;
  void isRead;
  void storiesMark;
  void unlockedChapters;

  return NextResponse.json({ user: safeUser, nominations: story.nominations + 1 });
}
