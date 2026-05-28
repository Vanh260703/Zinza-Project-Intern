"use client";

import { useEffect, useState } from "react";
import { BookOpen, PlusCircle } from "lucide-react";
import Link from "next/link";
import type { Chapter } from "@/types/chapter";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { showToast } from "@/lib/toast";

type Props = { novelId: string };

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export default function ChaptersTab({ novelId }: Props) {
  const [chapters, setChapters]       = useState<Chapter[]>([]);
  const [loading, setLoading]         = useState(true);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [confirmChapter, setConfirmChapter] = useState<Chapter | null>(null);

  useEffect(() => {
    fetch(`/api/novels/${novelId}/chapters`)
      .then((r) => r.json())
      .then(setChapters)
      .catch(() => showToast.error("Không tải được danh sách chương"))
      .finally(() => setLoading(false));
  }, [novelId]);

  async function confirmDelete() {
    if (!confirmChapter) return;
    setDeletingId(confirmChapter.id);
    try {
      const res = await fetch(`/api/novels/${novelId}/chapters/${confirmChapter.id}`, { method: "DELETE" });
      if (res.ok) setChapters((prev) => prev.filter((c) => c.id !== confirmChapter.id));
    } finally {
      setDeletingId(null);
      setConfirmChapter(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-5 h-5 border-2 border-stone-700 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-stone-500 text-sm">{chapters.length} chương</p>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-colors">
            <PlusCircle className="w-3.5 h-3.5" />
            Thêm chương
          </button>
        </div>

        {chapters.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <BookOpen className="w-8 h-8 text-stone-700" strokeWidth={1.5} />
            <p className="text-stone-600 text-sm">Chưa có chương nào.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-stone-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-800/60 border-b border-stone-800">
                  <th className="text-left text-[11px] font-semibold text-stone-500 uppercase tracking-wide px-4 py-3 w-16">
                    Thứ tự
                  </th>
                  <th className="text-left text-[11px] font-semibold text-stone-500 uppercase tracking-wide px-4 py-3">
                    Tên chương
                  </th>
                  <th className="text-right text-[11px] font-semibold text-stone-500 uppercase tracking-wide px-4 py-3 w-24 hidden sm:table-cell">
                    Số chữ
                  </th>
                  <th className="text-right text-[11px] font-semibold text-stone-500 uppercase tracking-wide px-4 py-3 w-24 hidden sm:table-cell">
                    Lượt xem
                  </th>
                  <th className="text-center text-[11px] font-semibold text-stone-500 uppercase tracking-wide px-4 py-3 w-24">
                    Giá kẹo
                  </th>
                  <th className="text-center text-[11px] font-semibold text-stone-500 uppercase tracking-wide px-4 py-3 w-28 hidden md:table-cell">
                    Cập nhật
                  </th>
                  <th className="text-center text-[11px] font-semibold text-stone-500 uppercase tracking-wide px-4 py-3 w-24">
                    Tác vụ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {chapters.map((ch) => (
                  <tr key={ch.id} className="hover:bg-stone-800/30 transition-colors">
                    <td className="px-4 py-3 text-stone-500 text-sm">{ch.number}</td>
                    <td className="px-4 py-3 text-stone-300 text-sm max-w-0">
                      <span className="block truncate">{ch.title}</span>
                    </td>
                    <td className="px-4 py-3 text-stone-400 text-sm text-right hidden sm:table-cell">
                      {(ch.wordCount ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-stone-400 text-sm text-right hidden sm:table-cell">
                      {(ch.views ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {ch.candyPrice ? (
                        <span className="text-amber-400 text-sm font-medium">{ch.candyPrice} kẹo</span>
                      ) : (
                        <span className="text-amber-500/80 text-sm">Miễn phí</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-500 text-sm text-center hidden md:table-cell">
                      {formatDate(ch.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/my-novels/${novelId}/chapters/${ch.id}/edit`}
                          className="text-stone-400 hover:text-white text-sm transition-colors"
                        >
                          Sửa
                        </Link>
                        <button
                          onClick={() => setConfirmChapter(ch)}
                          className="text-red-500 hover:text-red-400 text-sm transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm delete modal */}
      {confirmChapter && (
        <ConfirmModal
          title="Xóa chương này?"
          description={`"${confirmChapter.title}" sẽ bị xóa vĩnh viễn và không thể khôi phục.`}
          confirmLabel="Xóa chương"
          loading={deletingId === confirmChapter.id}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmChapter(null)}
        />
      )}
    </>
  );
}
