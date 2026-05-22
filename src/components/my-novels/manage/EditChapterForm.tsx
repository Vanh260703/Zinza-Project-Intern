"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";
import { showToast } from "@/lib/toast";
import type { Chapter } from "@/types/chapter";

const FOLLOWER_UNLOCK = 1000;

const inputCls = "w-full text-stone-200 text-sm bg-stone-800 border border-stone-700 focus:border-amber-500/60 rounded-xl px-4 py-2.5 outline-none transition-colors placeholder-stone-600";

type Props = {
  novelId: string;
  chapter: Chapter;
  initialContent: string;
  authorFollowers: number;
};

export default function EditChapterForm({ novelId, chapter, initialContent, authorFollowers }: Props) {
  const user   = useAuthStore((s) => s.user);
  const router = useRouter();

  const [title, setTitle]           = useState(chapter.title);
  const [content, setContent]       = useState(initialContent);
  const [candyPrice, setCandyPrice] = useState<number>(chapter.candyPrice ?? 0);
  const [loading, setLoading]       = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  const canSetPrice = authorFollowers >= FOLLOWER_UNLOCK;
  const wordCount   = content.replace(/\s/g, "").length;

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch(`/api/novels/${novelId}/chapters/${chapter.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content,
          candyPrice: canSetPrice ? candyPrice : 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const fieldErrors = data.errors?.fieldErrors ?? {};
        const mapped: Record<string, string> = {};
        for (const [k, v] of Object.entries(fieldErrors)) {
          mapped[k] = (v as string[])[0];
        }
        setErrors(mapped);
        showToast.error(data.message ?? "Cập nhật thất bại");
        return;
      }

      showToast.success("Đã cập nhật chương");
      router.push(`/my-novels/${novelId}`);
    } catch {
      showToast.error("Lỗi kết nối, thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Tiêu đề */}
      <div className="flex flex-col gap-2">
        <label className="text-stone-400 text-xs font-medium">
          Tiêu đề chương <span className="text-red-400">*</span>
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputCls}
        />
        {errors.title && <p className="text-red-400 text-xs">{errors.title}</p>}
      </div>

      {/* Nội dung */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-stone-400 text-xs font-medium">
            Nội dung <span className="text-red-400">*</span>
          </label>
          <span className="text-stone-600 text-xs">{wordCount.toLocaleString()} ký tự</span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          className={`${inputCls} resize-y leading-relaxed font-mono text-[13px]`}
        />
        {errors.content && <p className="text-red-400 text-xs">{errors.content}</p>}
      </div>

      {/* Giá kẹo */}
      <div className={`flex flex-col gap-2 p-4 rounded-xl border ${canSetPrice ? "border-stone-700 bg-stone-800/40" : "border-stone-800 bg-stone-900 opacity-50"}`}>
        <div className="flex items-center gap-2">
          <Lock className={`w-3.5 h-3.5 ${canSetPrice ? "text-violet-400" : "text-stone-600"}`} />
          <label className="text-stone-400 text-xs font-medium">Giá kẹo để mở chương</label>
          {!canSetPrice && (
            <span className="text-stone-600 text-[11px]">
              — Cần {FOLLOWER_UNLOCK.toLocaleString()} người theo dõi
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={candyPrice}
            onChange={(e) => setCandyPrice(Number(e.target.value))}
            disabled={!canSetPrice}
            className="w-28 text-stone-200 text-sm bg-stone-800 border border-stone-700 focus:border-amber-500/60 rounded-xl px-4 py-2 outline-none transition-colors disabled:cursor-not-allowed"
          />
          <span className="text-stone-500 text-sm">kẹo</span>
          {candyPrice === 0 && <span className="text-stone-600 text-xs">(miễn phí)</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl text-sm font-medium border border-stone-700 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
        >
          Huỷ
        </button>
      </div>
    </form>
  );
}
