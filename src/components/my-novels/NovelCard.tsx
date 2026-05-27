"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Eye, Candy, Crown } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";
import { showToast } from "@/lib/toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import type { Story } from "@/types/story";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  completed: { label: "HOÀN THÀNH", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  pending:   { label: "ĐANG RA",    color: "text-blue-400   bg-blue-500/10   border-blue-500/20"   },
};

function formatDate(date?: Date | string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric", year: "numeric" });
}

type Props = { story: Story; onDelete: (id: string) => void };

export default function NovelCard({ story, onDelete }: Props) {
  const user = useAuthStore((s) => s.user);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const status = STATUS_LABEL[story.status] ?? { label: story.status, color: "text-stone-400 bg-stone-800 border-stone-700" };

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/novels/${story.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast.error(data.message ?? "Xóa thất bại");
        return;
      }
      showToast.success("Đã xóa truyện");
      onDelete(story.id);
    } catch {
      showToast.error("Lỗi kết nối, thử lại sau");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
    {showConfirm && (
      <ConfirmModal
        title="Xóa truyện này?"
        description={`"${story.name}" sẽ bị xóa vĩnh viễn và không thể khôi phục.`}
        confirmLabel="Xóa truyện"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    )}
    <div className="flex gap-4 p-4 bg-stone-900 border border-stone-800 rounded-2xl hover:border-stone-700 transition-colors">
      {/* Cover */}
      <div className="w-16 h-21.5 rounded-xl overflow-hidden bg-stone-800 shrink-0">
        {story.poster ? (
          <img src={`/api/cover/${story.id}`} alt={story.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 flex-1 min-w-0 justify-center">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-stone-100 font-semibold text-sm">{story.name}</h3>
          {story.vip && (
            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md">
              <Crown className="w-2.5 h-2.5" />VIP
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold tracking-wide ${status.color}`}>
            {status.label}
          </span>
          <span className="text-stone-600 text-xs flex items-center gap-1">
            <BookOpen className="w-3 h-3" />{story.chapterCount} chương
          </span>
          <span className="text-stone-600 text-xs flex items-center gap-1">
            <Eye className="w-3 h-3" />0 lượt đọc
          </span>
          <span className="text-stone-600 text-xs flex items-center gap-1">
            <Candy className="w-3 h-3" />0 kẹo
          </span>
        </div>

        <p className="text-stone-600 text-xs">Cập nhật: {formatDate(story.updatedAt)}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 justify-center shrink-0">
        <Link
          href={`/my-novels/${story.id}`}
          className="px-4 py-1.5 rounded-lg text-xs font-medium border border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-white transition-colors text-center"
        >
          Quản lý
        </Link>
        <button
          onClick={() => setShowConfirm(true)}
          className="px-4 py-1.5 rounded-lg text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
        >
          Xóa truyện
        </button>
      </div>
    </div>
    </>
  );
}
