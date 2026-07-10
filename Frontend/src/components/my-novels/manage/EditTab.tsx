"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";
import { useUpdateNovel } from "@/hooks/useNovels";
import { showToast } from "@/lib/toast";

import type { Novel } from "@/types/novel";
import { CATEGORIES } from "@/config/category";
import { STATUS_OPTIONS } from "@/enums/novel";
import { editNovelFormSchema } from "@/schemas/novel";

type EditNovelFormData = z.infer<typeof editNovelFormSchema>;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTE = 2 * 1024 * 1024;

const inputCls =
  "w-full text-stone-200 text-sm bg-stone-800 border border-stone-700 focus:border-amber-500/60 rounded-xl px-4 py-2.5 outline-none transition-colors placeholder-stone-600";

type Props = { novel: Novel; onUpdated: (s: Novel) => void };

export default function EditTab({ novel, onUpdated }: Props) {
  const user = useAuthStore((s) => s.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateMutation = useUpdateNovel(novel.slug);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<EditNovelFormData>({
    resolver: zodResolver(editNovelFormSchema),
    defaultValues: {
      name: novel.name,
      author: novel.author,
      status: novel.status,
      categoryIds: novel.categories.map((c) => c.name),
      description: novel.description ?? "",
    },
  });

  // Cover state — quản lý ngoài RHF vì là File object
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setCoverError("Chỉ hỗ trợ JPG, PNG, WebP");
      setCoverFile(null);
      setCoverPreview(null);
      return;
    }
    if (file.size > MAX_SIZE_BYTE) {
      setCoverError("Ảnh tối đa 2MB");
      setCoverFile(null);
      setCoverPreview(null);
      return;
    }

    setCoverError(null);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: EditNovelFormData) => {
    if (!user || coverError) return;
    try {
      // BE check owner qua cookie (không gửi userId). Categories chưa hỗ trợ đổi qua BE nên bỏ qua.
      const result = await updateMutation.mutateAsync({
        name: data.name,
        author: data.author,
        status: data.status,
        description: data.description,
      });

      if (coverFile) {
        const form = new FormData();
        form.append("cover", coverFile);
        // Dùng slug MỚI trả về từ update — đổi tên có thể làm đổi slug (BE tự sinh lại theo tên mới)
        const coverRes = await fetch(`/api/cover/${result.novel.slug}`, {
          method: "POST",
          body: form,
        });
        if (!coverRes.ok) {
          const err = await coverRes.json().catch(() => ({}));
          showToast.error(err.message ?? "Upload ảnh bìa thất bại");
          onUpdated(result.novel);
          return;
        }
        const { posterUrl } = await coverRes.json();
        result.novel.posterUrl = posterUrl;
        setCoverFile(null);
        setCoverPreview(null);
      }

      showToast.success("Đã lưu thay đổi");
      onUpdated(result.novel);
    } catch {
      // updateMutation.mutateAsync ném lỗi khi BE trả lỗi (vd trùng tên) — hook
      // useUpdateNovel đã tự hiện toast đúng message qua onError, không lặp lại ở đây.
    }
  };

  const currentCover = coverPreview ?? novel.posterUrl ?? null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Cover */}
      <div className="flex flex-col gap-2">
        <label className="text-stone-400 text-xs font-medium">Ảnh bìa</label>
        <div className="flex items-end gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative w-28 h-40 rounded-xl overflow-hidden border-2 border-dashed cursor-pointer transition-colors flex items-center justify-center bg-stone-800/50 group ${
              coverError ? "border-red-500/60" : "border-stone-700 hover:border-amber-500/50"
            }`}
          >
            {currentCover ? (
              <>
                <img src={currentCover} alt="cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ImagePlus className="w-5 h-5 text-white" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-stone-600 group-hover:text-stone-400 transition-colors">
                <ImagePlus className="w-6 h-6" strokeWidth={1.5} />
                <span className="text-[10px] text-center px-1">Tải ảnh lên</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 text-xs text-stone-500">
            <p>JPG, PNG, WebP — tối đa 2MB</p>
            {coverFile && (
              <p className="text-amber-400">
                {coverFile.name} ({(coverFile.size / 1024 / 1024).toFixed(2)}MB)
              </p>
            )}
            {coverError && <p className="text-red-400">{coverError}</p>}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="self-start px-3 py-1.5 rounded-lg border border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
            >
              {novel.posterUrl || coverFile ? "Đổi ảnh bìa" : "Chọn ảnh bìa"}
            </button>
            {coverFile && (
              <button
                type="button"
                onClick={() => {
                  setCoverFile(null);
                  setCoverPreview(null);
                  setCoverError(null);
                }}
                className="self-start text-stone-600 hover:text-stone-300 transition-colors"
              >
                Huỷ thay đổi
              </button>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleCoverChange}
        />
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-stone-400 text-xs font-medium">
            Tên truyện <span className="text-red-400">*</span>
          </label>
          <input
            {...register("name")}
            className={`${inputCls} ${errors.name ? "border-red-500/60" : ""}`}
          />
          {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-stone-400 text-xs font-medium">
            Tác giả <span className="text-red-400">*</span>
          </label>
          <input
            {...register("author")}
            className={`${inputCls} ${errors.author ? "border-red-500/60" : ""}`}
          />
          {errors.author && <p className="text-red-400 text-xs">{errors.author.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-stone-400 text-xs font-medium">Trạng thái</label>
          <select {...register("status")} className={inputCls}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-stone-400 text-xs font-medium">
          Thể loại <span className="text-stone-600 font-normal">(chưa hỗ trợ chỉnh sửa)</span>
        </label>
        <Controller
          name="categoryIds"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2 opacity-60">
              {CATEGORIES.map((g) => {
                const active = field.value.includes(g.name);
                return (
                  <button
                    key={g.slug}
                    type="button"
                    disabled
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border cursor-not-allowed ${
                      active
                        ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                        : "bg-stone-800 border-stone-700 text-stone-400"
                    }`}
                  >
                    {g.name}
                  </button>
                );
              })}
            </div>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-stone-400 text-xs font-medium">Mô tả</label>
        <textarea
          {...register("description")}
          rows={5}
          className={`${inputCls} resize-none leading-relaxed`}
        />
      </div>

      <button
        type="submit"
        disabled={updateMutation.isPending || !!coverError || (!isDirty && !coverFile)}
        className="self-start px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
      >
        {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}
