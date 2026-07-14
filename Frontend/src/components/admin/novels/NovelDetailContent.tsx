"use client";

import { useRouter } from "next/navigation";
import { useAdminNovelDetail } from "@/hooks/useAdmin";
import { useAuthStore } from "@/stores/userStore";
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
import { getNovelStatus } from "@/config/statuses";

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

export default function NovelDetailContent({ novelSlug }: { novelSlug: string }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useAdminNovelDetail(novelSlug);

  if (isError) {
    router.replace("/admin/novels");
    return null;
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-stone-700 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { novel, chStats } = data;

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
          {novel.posterUrl ? (
            <img
              src={novel.posterUrl}
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
              className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${getNovelStatus(novel.status).cls}`}
            >
              {getNovelStatus(novel.status).label}
            </span>
            {novel.categories.slice(0, 3).map((g) => (
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
            {user?.id === novel.postedBy && (
              <Link
                href={`/my-novels/${novel.slug}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-500/15 border border-violet-500/25 text-violet-400 hover:bg-violet-500/25 transition-colors"
              >
                Quản lý truyện
              </Link>
            )}
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
          <Row label="Thể loại" value={novel.categories.map((g) => g.name).join(", ") || "—"} />
          <Row label="Trạng thái" value={getNovelStatus(novel.status).label} />
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
