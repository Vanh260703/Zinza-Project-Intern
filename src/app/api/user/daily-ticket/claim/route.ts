import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

const REQUIRED_CHAPTERS = 10;

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ message: "Thiếu thông tin" }, { status: 400 });
  }

  const user = db.users.findById(userId);
  if (!user) {
    return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 });
  }

  const todayStr = today();
  const isToday = user.dailyReadDate === todayStr;
  const count = isToday ? (user.dailyReadCount ?? 0) : 0;

  if (count < REQUIRED_CHAPTERS) {
    return NextResponse.json(
      { message: `Cần đọc đủ ${REQUIRED_CHAPTERS} chương (hiện tại: ${count})` },
      { status: 400 }
    );
  }

  if (isToday && user.dailyTicketClaimed) {
    return NextResponse.json({ message: "Đã nhận vé hôm nay rồi" }, { status: 400 });
  }

  const updated = db.users.update(userId, {
    dailyTicketClaimed: true,
    recommendationTickets: (user.recommendationTickets ?? 0) + 1,
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
