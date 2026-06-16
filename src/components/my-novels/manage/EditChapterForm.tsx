"use client";

import { useUpdateChapter } from "@/hooks/useChapters";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/userStore";
import ErrorPage from "@/components/error/ErrorPage";

import type { Chapter } from "@/types/chapter";
import { editChapterFormSchema } from "@/schemas/chapter";

type FormData = z.infer<typeof editChapterFormSchema>;

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
  const updateMutation = useUpdateChapter(novelId, chapter.id);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(editChapterFormSchema),
    defaultValues: {
      title: chapter.title,
      content: initialContent,
      candyPrice: chapter.candyPrice ?? 0,
    },
  });

  const content = useWatch({ control, name: "content" }) ?? "";
  const candyPrice = useWatch({ control, name: "candyPrice" }) ?? 0;
  const wordCount = content.replace(/\s/g, "").length;

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

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(
      { title: data.title.trim(), content: data.content, candyPrice: data.candyPrice },
      { onSuccess: () => router.push(`/my-novels/${novelId}`) }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Tiêu đề */}
      <div className="flex flex-col gap-2">
        <label className="text-stone-400 text-xs font-medium">
          Tiêu đề chương <span className="text-red-400">*</span>
        </label>
        <input
          {...register("title")}
          className={`${inputCls} ${errors.title ? "border-red-500/60" : ""}`}
        />
        {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
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
          {...register("content")}
          rows={20}
          className={`${inputCls} resize-y leading-relaxed font-mono text-[13px] ${errors.content ? "border-red-500/60" : ""}`}
        />
        {errors.content && <p className="text-red-400 text-xs">{errors.content.message}</p>}
      </div>

      {/* Giá kẹo */}
      <div className="flex flex-col gap-2 p-4 rounded-xl border border-stone-700 bg-stone-800/40">
        <label className="text-stone-400 text-xs font-medium">Giá kẹo để mở chương</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            {...register("candyPrice", { valueAsNumber: true })}
            className="w-28 text-stone-200 text-sm bg-stone-800 border border-stone-700 focus:border-amber-500/60 rounded-xl px-4 py-2 outline-none transition-colors"
          />
          <span className="text-stone-500 text-sm">kẹo</span>
          {candyPrice === 0 && <span className="text-stone-600 text-xs">(miễn phí)</span>}
        </div>
        {errors.candyPrice && <p className="text-red-400 text-xs">{errors.candyPrice.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={updateMutation.isPending || !isDirty}
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
