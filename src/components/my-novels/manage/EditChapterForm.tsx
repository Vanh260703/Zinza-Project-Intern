"use client";

import { useState } from "react";
import { useUpdateChapter } from "@/hooks/useChapters";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/userStore";
import ErrorPage from "@/components/error/ErrorPage";

import type { Chapter } from "@/types/chapter";

const inputCls =
  "w-full text-stone-200 text-sm bg-stone-800 border border-stone-700 focus:border-amber-500/60 rounded-xl px-4 py-2.5 outline-none transition-colors placeholder-stone-600";

type Props = {
  novelId: string;
  postedBy: string;
  chapter: Chapter;
  initialContent: string;
};

export default function EditChapterForm({ novelId, postedBy, chapter, initialContent }: Props) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [title, setTitle] = useState(chapter.title);
  const [content, setContent] = useState(initialContent);
  const [candyPrice, setCandyPrice] = useState<number>(chapter.candyPrice ?? 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const updateMutation = useUpdateChapter(novelId, chapter.id);

  if (user && user.id !== postedBy) {
    return (
      <ErrorPage
        code={403}
        title="Không có quyền truy cập"
        description="Bạn không phải tác giả của truyện này."
        action={{ label: "Truyện của tôi", href: "/my-novels" }}
      />
    );
  }

  const wordCount = content.replace(/\s/g, "").length;

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setErrors({});
    updateMutation.mutate(
      { title: title.trim(), content, candyPrice },
      {
        onSuccess: () => router.push(`/my-novels/${novelId}`),
        onError: (e: unknown) => {
          const d = e as { errors?: { fieldErrors?: Record<string, string[]> }; message?: string };
          if (d?.errors?.fieldErrors) {
            const mapped: Record<string, string> = {};
            for (const [k, v] of Object.entries(d.errors.fieldErrors)) mapped[k] = v[0];
            setErrors(mapped);
          }
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Tiêu đề */}
      <div className="flex flex-col gap-2">
        <label className="text-stone-400 text-xs font-medium">
          Tiêu đề chương <span className="text-red-400">*</span>
        </label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
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
      <div className="flex flex-col gap-2 p-4 rounded-xl border border-stone-700 bg-stone-800/40">
        <label className="text-stone-400 text-xs font-medium">Giá kẹo để mở chương</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={candyPrice}
            onChange={(e) => setCandyPrice(Number(e.target.value))}
            className="w-28 text-stone-200 text-sm bg-stone-800 border border-stone-700 focus:border-amber-500/60 rounded-xl px-4 py-2 outline-none transition-colors"
          />
          <span className="text-stone-500 text-sm">kẹo</span>
          {candyPrice === 0 && <span className="text-stone-600 text-xs">(miễn phí)</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
        >
          {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
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
