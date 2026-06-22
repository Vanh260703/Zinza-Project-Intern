import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export async function POST(req: NextRequest) {
  const { userId, storyId, chapterId, chapterTitle, chapterNumber } = await req.json();

  if (!userId || !storyId || !chapterId) {
    return NextResponse.json({ message: "Thiếu thông tin" }, { status: 400 });
  }

  const user = db.users.findById(userId);
  if (!user) {
    return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 });
  }

  const todayStr = today();
  const isNewDay = user.dailyReadDate !== todayStr;

  // { storyId: { chapterId: true, ... }, ... }
  const currentMap: Record<string, Record<string, true>> = isNewDay
    ? {}
    : (user.dailyReadChapterIds ?? {});

  // Dedup: O(1) — chapter này của story này đã đọc hôm nay chưa?
  if (currentMap[storyId]?.[chapterId]) {
    const { candy, isRead, storiesMark, unlockedChapters, ...safeUser } = user as typeof user & {
      candy: number;
      isRead: string[];
      storiesMark: string[];
      unlockedChapters: string[];
    };
    void candy;
    void isRead;
    void storiesMark;
    void unlockedChapters;
    return NextResponse.json({ user: safeUser });
  }

  const updatedMap = {
    ...currentMap,
    [storyId]: { ...(currentMap[storyId] ?? {}), [chapterId]: true as const },
  };

  const totalCount = (Object.values(updatedMap) as Record<string, true>[]).reduce(
    (sum: number, chapters: Record<string, true>) => sum + Object.keys(chapters).length,
    0
  );

  const updatedLastRead = {
    ...(user.lastReadChapters ?? {}),
    [storyId]: { id: chapterId, title: chapterTitle ?? "", number: chapterNumber ?? 0 },
  };

  const updated = db.users.update(userId, {
    dailyReadDate: todayStr,
    dailyReadCount: totalCount,
    dailyReadChapterIds: updatedMap,
    lastReadChapters: updatedLastRead,
    chaptersRead: (user.chaptersRead ?? 0) + 1,
    ...(isNewDay && { dailyTicketClaimed: false }),
  });

  if (!updated) {
    return NextResponse.json({ message: "Cập nhật thất bại" }, { status: 500 });
  }

  const { candy, isRead, storiesMark, unlockedChapters, ...safeUser } =
    updated as typeof updated & {
      candy: number;
      isRead: string[];
      storiesMark: string[];
      unlockedChapters: string[];
    };
  void candy;
  void isRead;
  void storiesMark;
  void unlockedChapters;

  return NextResponse.json({ user: safeUser });
}
