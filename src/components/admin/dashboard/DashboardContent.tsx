"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, BookOpenText, BookOpen, Candy, Crown, TrendingUp, Clock } from "lucide-react";
import { showToast } from "@/lib/toast";

type Stats = {
  totalUsers: number;
  totalNovels: number;
  totalChapters: number;
  totalCandy: number;
  vipNovels: number;
  novelsByStatus: { pending: number; completed: number };
  recentUsers: { id: string; name: string; email: string; role: string; joinedAt?: string }[];
  recentNovels: {
    id: string;
    name: string;
    author: string;
    status: string;
    chapterCount: number;
    vip: boolean;
    poster: string | null;
    updatedAt?: string;
  }[];
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  href?: string;
}) {
  const inner = (
    <div
      className={`flex flex-col gap-3 p-5 bg-stone-900 border border-stone-800 rounded-2xl hover:border-stone-700 transition-colors ${href ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {href && <TrendingUp className="w-4 h-4 text-stone-700" />}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-stone-500 text-sm mt-0.5">{label}</p>
        {sub && <p className="text-stone-600 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function formatDate(d?: string | Date) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

export default function DashboardContent() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => showToast.error("Không tải được dữ liệu thống kê"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-stone-700 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Người dùng"
          value={stats.totalUsers}
          sub={`${stats.recentUsers.length} mới nhất`}
          color="bg-violet-500/15 text-violet-400"
          href="/admin/users"
        />
        <StatCard
          icon={BookOpenText}
          label="Tổng truyện"
          value={stats.totalNovels}
          sub={`${stats.novelsByStatus.pending} đang ra · ${stats.novelsByStatus.completed} hoàn thành`}
          color="bg-blue-500/15 text-blue-400"
          href="/admin/novels"
        />
        <StatCard
          icon={BookOpen}
          label="Tổng chương"
          value={stats.totalChapters}
          color="bg-emerald-500/15 text-emerald-400"
        />
        <StatCard
          icon={Candy}
          label="Kẹo lưu thông"
          value={stats.totalCandy}
          sub={`${stats.vipNovels} truyện VIP`}
          color="bg-amber-500/15 text-amber-400"
        />
      </div>

      {/* Breakdown row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2 p-4 bg-stone-900 border border-stone-800 rounded-2xl">
          <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">
            Trạng thái truyện
          </p>
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-400">Đang ra</span>
              <span className="text-blue-400 font-semibold">{stats.novelsByStatus.pending}</span>
            </div>
            <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${stats.totalNovels ? (stats.novelsByStatus.pending / stats.totalNovels) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-400">Hoàn thành</span>
              <span className="text-emerald-400 font-semibold">
                {stats.novelsByStatus.completed}
              </span>
            </div>
            <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{
                  width: `${stats.totalNovels ? (stats.novelsByStatus.completed / stats.totalNovels) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-4 bg-stone-900 border border-stone-800 rounded-2xl">
          <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">
            Truyện VIP
          </p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-3xl font-bold text-amber-400">{stats.vipNovels}</p>
            <p className="text-stone-500 text-sm mb-1">/ {stats.totalNovels} truyện</p>
          </div>
          <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{
                width: `${stats.totalNovels ? (stats.vipNovels / stats.totalNovels) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Crown className="w-3 h-3 text-amber-400" />
            <p className="text-stone-600 text-xs">
              {stats.totalNovels ? ((stats.vipNovels / stats.totalNovels) * 100).toFixed(0) : 0}%
              tổng số
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-4 bg-stone-900 border border-stone-800 rounded-2xl">
          <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">
            Trung bình
          </p>
          <div className="flex flex-col gap-3 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-400 text-sm">Chương / truyện</span>
              <span className="text-white font-semibold">
                {stats.totalNovels ? (stats.totalChapters / stats.totalNovels).toFixed(1) : 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-400 text-sm">Kẹo / user</span>
              <span className="text-amber-400 font-semibold">
                {stats.totalUsers
                  ? Math.round(stats.totalCandy / stats.totalUsers).toLocaleString()
                  : 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent users */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-500" />
              <p className="text-white font-semibold text-sm">Người dùng mới nhất</p>
            </div>
            <Link
              href="/admin/users"
              className="text-violet-400 text-xs hover:text-violet-300 transition-colors"
            >
              Xem tất cả →
            </Link>
          </div>
          <div className="divide-y divide-stone-800/60">
            {stats.recentUsers.map((u) => (
              <Link
                key={u.id}
                href={`/admin/users/${u.id}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-800/40 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-amber-400">
                    {u.name[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-stone-200 text-sm font-medium truncate">{u.name}</p>
                  <p className="text-stone-600 text-xs truncate">{u.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                      u.role === "admin"
                        ? "text-violet-400 bg-violet-500/10 border-violet-500/20"
                        : "text-stone-500 bg-stone-800 border-stone-700"
                    }`}
                  >
                    {u.role}
                  </span>
                  <span className="text-stone-700 text-[10px]">{formatDate(u.joinedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent novels */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-500" />
              <p className="text-white font-semibold text-sm">Truyện cập nhật gần đây</p>
            </div>
            <Link
              href="/admin/novels"
              className="text-violet-400 text-xs hover:text-violet-300 transition-colors"
            >
              Xem tất cả →
            </Link>
          </div>
          <div className="divide-y divide-stone-800/60">
            {stats.recentNovels.map((n) => (
              <Link
                key={n.id}
                href={`/admin/novels/${n.id}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-800/40 transition-colors"
              >
                <div className="w-9 h-12 rounded-lg overflow-hidden bg-stone-800 shrink-0">
                  {n.poster ? (
                    <img
                      src={`/api/cover/${n.id}`}
                      alt={n.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-stone-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-stone-200 text-sm font-medium truncate">{n.name}</p>
                    {n.vip && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
                  </div>
                  <p className="text-stone-600 text-xs truncate">
                    {n.author} · {n.chapterCount} chương
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                      n.status === "completed"
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : "text-blue-400 bg-blue-500/10 border-blue-500/20"
                    }`}
                  >
                    {n.status === "completed" ? "Hoàn thành" : "Đang ra"}
                  </span>
                  <span className="text-stone-700 text-[10px]">{formatDate(n.updatedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
