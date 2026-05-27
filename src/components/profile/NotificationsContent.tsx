"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";

type NotificationItem = {
  id: number;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
};

type Tab = "all" | "unread";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d === 1) return "hôm qua";
  if (d < 7) return `${d} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function NotificationsContent() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [tab, setTab] = useState<Tab>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/notifications?userId=${user.id}&all=true`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.notifications);
        setTotalUnread(d.totalUnread);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id }),
    });
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setTotalUnread(0);
  };

  const displayed = tab === "unread" ? items.filter((n) => !n.isRead) : items;

  return (
    <div className="flex flex-col gap-0 bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-stone-800">
        <div>
          <h2 className="text-white font-bold text-lg">Thông báo</h2>
          <p className="text-stone-500 text-sm mt-0.5">
            {totalUnread > 0 ? `${totalUnread} thông báo chưa đọc` : "Tất cả đã đọc"}
          </p>
        </div>
        {totalUnread > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20
              text-amber-400 hover:bg-amber-500/20 text-sm font-medium transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Đánh dấu đọc tất cả
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-800 px-6">
        {(["all", "unread"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-3 mr-6 text-sm font-medium border-b-2 transition-colors
              ${tab === t
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-stone-500 hover:text-stone-300"
              }`}
          >
            {t === "all" ? "Tất cả" : "Chưa đọc"}
            {t === "unread" && totalUnread > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded-full font-bold">
                {totalUnread}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-stone-700 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-stone-600">
          <Bell className="w-10 h-10" strokeWidth={1.5} />
          <p className="text-sm">
            {tab === "unread" ? "Không có thông báo chưa đọc" : "Chưa có thông báo nào"}
          </p>
        </div>
      ) : (
        <ul>
          {displayed.map((n) => (
            <li
              key={n.id}
              className={`flex items-start gap-4 px-6 py-4 border-b border-stone-800/60 last:border-0 transition-colors
                ${!n.isRead ? "bg-amber-500/4" : "hover:bg-stone-800/30"}`}
            >
              {/* Dot */}
              <div className="mt-1 shrink-0 w-2 flex justify-center">
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-amber-500 block" />}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-snug ${!n.isRead ? "text-white" : "text-stone-300"}`}>
                  {n.title}
                </p>
                <p className="text-stone-500 text-sm mt-1 leading-relaxed">{n.content}</p>
                <p className="text-stone-600 text-xs mt-2">{timeAgo(n.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
