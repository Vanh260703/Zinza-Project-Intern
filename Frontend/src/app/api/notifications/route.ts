import { NextRequest, NextResponse } from "next/server";

const BE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Số lượng notification tối đa nạp về (đủ cho dropdown 4 mục + trang profile).
const MAX_LIMIT = 100;

type BeNotification = {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
};

// BE lấy user từ JWT (@CurrentUser) → forward cookie, bỏ qua ?userId trên query.
export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "true";

  const res = await fetch(`${BE_URL}/api/v1/user/notifications?page=1&limit=${MAX_LIMIT}`, {
    headers: { Cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ notifications: [], totalUnread: 0 }, { status: res.status });
  }

  const { data = [] } = (await res.json()) as { data: BeNotification[] };
  const notifications = data.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    isRead: n.isRead,
    createdAt: n.createdAt,
  }));
  const totalUnread = notifications.filter((n) => !n.isRead).length;

  // all=false (dropdown): chỉ trả 4 mục mới nhất nhưng totalUnread vẫn tính trên toàn bộ.
  return NextResponse.json({
    notifications: all ? notifications : notifications.slice(0, 4),
    totalUnread,
  });
}

// Đánh dấu đã đọc tất cả — BE dùng @CurrentUser, không cần body.
export async function PATCH(req: NextRequest) {
  const res = await fetch(`${BE_URL}/api/v1/user/notifications/read-all`, {
    method: "PATCH",
    headers: { Cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({ updated: 0 }));
  return NextResponse.json(data, { status: res.status });
}
