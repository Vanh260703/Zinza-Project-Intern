"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/userStore";
import { showToast } from "@/lib/toast";
import type { Story } from "@/types/story";
import { createChapterFormSchema } from "@/schemas/chapter";

type FormData = z.infer<typeof createChapterFormSchema>;

const inputCls =
  "w-full text-stone-200 text-sm bg-stone-800 border border-stone-700 focus:border-amber-500/60 rounded-xl px-4 py-2.5 outline-none transition-colors placeholder-stone-600";

type Props = { story: Story; nextNumber: number };

export default function CreateChapterForm({ story, nextNumber }: Props) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createChapterFormSchema),
    defaultValues: {
      title: `Chương ${nextNumber}: `,
      content: "",
      candyPrice: 0,
    },
  });

  const content = useWatch({ control, name: "content" }) ?? "";
  const candyPrice = useWatch({ control, name: "candyPrice" }) ?? 0;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/novels/${story.id}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...data,
          ...(data.candyPrice === 0 ? { candyPrice: undefined } : {}),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        showToast.error(json.message ?? "Đăng chương thất bại");
        return;
      }

      showToast.success(`Đã đăng chương ${nextNumber}`);
      router.push(`/my-novels/${story.id}`);
    } catch {
      showToast.error("Lỗi kết nối, thử lại sau");
    } finally {
      setLoading(false);
    }
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
          placeholder={`Chương ${nextNumber}: Tiêu đề...`}
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
          <span className="text-stone-600 text-xs">{wordCount.toLocaleString()} từ</span>
        </div>
        <textarea
          {...register("content")}
          placeholder="Nhập nội dung chương tại đây..."
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
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
        >
          {isSubmitting ? "Đang đăng..." : "Đăng chương"}
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
