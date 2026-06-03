"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Crown,
  Star,
  MessageSquare,
  Candy,
  Hash,
  User,
  Calendar,
  ExternalLink,
} from "lucide-react";
import type { Story } from "@/types/story";
import type { Chapter } from "@/types/chapter";

type ChapterStats = { total: number; paid: number; totalWords: number };

type StoryDetail = Story & {
  publisherName?: string;
  publisherEmail?: string;
  publisherId?: string;
};

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-2 p-4 bg-stone-800/50 border border-stone-800 rounded-xl">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-lg font-bold text-white">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-stone-500 text-xs">{label}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-stone-800 last:border-0">
      <span className="text-stone-500 text-sm shrink-0">{label}</span>
      <div className="text-stone-200 text-sm text-right">{value}</div>
    </div>
  );
}

export default function NovelDetailContent({ novelId }: { novelId: string }) {
  const router = useRouter();
  const [novel, setNovel] = useState<StoryDetail | null>(null);
  const [chStats, setChStats] = useState<ChapterStats>({
    total: 0,
    paid: 0,
    totalWords: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/novels?ids=${novelId}`).then((r) => r.json()),
      fetch(`/api/admin/users`).then((r) => r.json()),
      fetch(`/api/novels/${novelId}/chapters`).then((r) => r.json()),
    ])
      .then(([stories, users, chs]) => {
        const story = (stories as Story[])[0];
        if (!story) {
          router.replace("/admin/novels");
          return;
        }
        const map: Record<string, { name: string; email: string }> = {};
        (users as { id: string; name: string; email: string }[]).forEach((u) => {
          map[u.id] = u;
        });
        setNovel({
          ...story,
          publisherName: map[story.postedBy]?.name,
          publisherEmail: map[story.postedBy]?.email,
          publisherId: story.postedBy,
        });
        const list = chs as Chapter[];
        setChStats({
          total: list.length,
          paid: list.filter((c) => (c.candyPrice ?? 0) > 0).length,
          totalWords: list.reduce((s, c) => s + (c.wordCount ?? 0), 0),
        });
      })
      .catch(() => router.replace("/admin/novels"))
      .finally(() => setLoading(false));
  }, [novelId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-stone-700 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!novel) return null;

  const formatDate = (d?: Date | string) =>
    d
      ? new Date(d).toLocaleDateString("vi-VN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—";

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Link
        href="/admin/novels"
        className="flex items-center gap-1.5 text-stone-500 hover:text-stone-300 text-sm transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách truyện
      </Link>

      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col sm:flex-row gap-5">
        <div className="w-28 h-40 sm:w-32 sm:h-44 rounded-2xl overflow-hidden bg-stone-800 shrink-0 mx-auto sm:mx-0">
          {novel.poster ? (
            <img
              src={`/api/cover/${novel.id}`}
              alt={novel.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-stone-600" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex items-start gap-2 flex-wrap">
            <h1 className="text-white font-bold text-xl leading-snug flex-1">{novel.name}</h1>
            {novel.vip && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-amber-500/15 border border-amber-500/25 text-amber-400 rounded-lg font-semibold shrink-0">
                <Crown className="w-3 h-3" />
                VIP
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                novel.status === "completed"
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : "text-blue-400 bg-blue-500/10 border-blue-500/20"
              }`}
            >
              {novel.status === "completed" ? "Hoàn thành" : "Đang ra"}
            </span>
            {novel.genres.slice(0, 3).map((g) => (
              <span
                key={g.slug}
                className="text-xs px-2.5 py-1 bg-stone-800 border border-stone-700 text-stone-400 rounded-lg"
              >
                {g.name}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-1 text-sm text-stone-400">
            <span className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-stone-600" />
              Tác giả: <span className="text-stone-300">{novel.author}</span>
            </span>
            <span className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-stone-600" />
              Đăng bởi:{" "}
              {novel.publisherId ? (
                <Link
                  href={`/admin/users/${novel.publisherId}`}
                  className="text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
                >
                  {novel.publisherName ?? novel.postedBy}
                  <ExternalLink className="w-3 h-3" />
                </Link>
              ) : (
                <span className="text-stone-300">{novel.publisherName ?? novel.postedBy}</span>
              )}
            </span>
            {novel.publisherEmail && (
              <span className="text-stone-600 text-xs ml-5">{novel.publisherEmail}</span>
            )}
            <span className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-stone-600" />
              Cập nhật: {formatDate(novel.updatedAt)}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-1">
            <Link
              href={`/novels/${novel.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Xem trang truyện
            </Link>
            <Link
              href={`/my-novels/${novel.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-500/15 border border-violet-500/25 text-violet-400 hover:bg-violet-500/25 transition-colors"
            >
              Quản lý truyện
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={BookOpen}
          label="Tổng chương"
          value={novel.chapterCount}
          color="bg-blue-500/15 text-blue-400"
        />
        <StatCard
          icon={Star}
          label="Đánh giá"
          value={novel.rating > 0 ? `${novel.rating.toFixed(2)} (${novel.ratingCount})` : "Chưa có"}
          color="bg-amber-500/15 text-amber-400"
        />
        <StatCard
          icon={Candy}
          label="Đề cử nhận được"
          value={novel.nominations}
          color="bg-emerald-500/15 text-emerald-400"
        />
        <StatCard
          icon={MessageSquare}
          label="Bình luận"
          value={novel.commentCount}
          color="bg-violet-500/15 text-violet-400"
        />
      </div>

      {/* Tóm tắt */}
      {novel.description && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider mb-3">
            Tóm tắt
          </p>
          <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-line">
            {novel.description}
          </p>
        </div>
      )}

      {/* Detail rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-stone-500" />
            <p className="text-stone-300 font-semibold text-sm">Thông tin truyện</p>
          </div>
          <Row
            label="Slug"
            value={<span className="font-mono text-xs text-stone-500">{novel.slug}</span>}
          />
          <Row label="Thể loại" value={novel.genres.map((g) => g.name).join(", ") || "—"} />
          <Row
            label="Giá mặc định"
            value={novel.price > 0 ? `${novel.price} kẹo / chương` : "Miễn phí"}
          />
          <Row label="Trạng thái" value={novel.status === "completed" ? "Hoàn thành" : "Đang ra"} />
          <Row
            label="VIP"
            value={
              novel.vip ? (
                <span className="text-amber-400">Có</span>
              ) : (
                <span className="text-stone-600">Không</span>
              )
            }
          />
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-stone-500" />
            <p className="text-stone-300 font-semibold text-sm">Thống kê chương</p>
          </div>
          <Row label="Tổng chương" value={chStats.total} />
          <Row label="Chương miễn phí" value={chStats.total - chStats.paid} />
          <Row
            label="Chương trả phí"
            value={
              <span className={chStats.paid > 0 ? "text-amber-400 font-semibold" : ""}>
                {chStats.paid}
              </span>
            }
          />
          <Row label="Tổng từ" value={chStats.totalWords.toLocaleString()} />
        </div>
      </div>
    </div>
  );
}
