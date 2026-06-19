"use client";

import { useEffect, useRef, useState } from "react";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/userStore";
import { useCreateNovel } from "@/hooks/useNovels";
import { createNovelSchema } from "@/schemas/novel";
import { CATEGORIES } from "@/config/category";
import { STATUS_OPTIONS } from "@/enums/story";

const formSchema = createNovelSchema.omit({ userId: true });
type FormData = z.infer<typeof formSchema>;

const inputCls =
  "w-full text-stone-200 text-sm bg-stone-800 border border-stone-700 focus:border-amber-500/60 rounded-xl px-4 py-2.5 outline-none transition-colors placeholder-stone-600";

// ── Cover Upload ──────────────────────────────────────────────────────────────

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTE = MAX_SIZE_MB * 1024 * 1024;

function CoverUpload({ onChange }: { onChange: (file: File | null, error?: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Revoke blob URL khi preview thay đổi hoặc component unmount
  // cleanup chạy trước mỗi lần effect re-run → tự động hủy URL cũ khi đổi ảnh
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const clearFile = () => {
    setPreview(null);
    setError(null);
    onChange(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";

    if (!file) {
      setPreview(null);
      setError(null);
      onChange(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setPreview(null);
      setError("Chỉ hỗ trợ JPG, PNG, WebP");
      onChange(file, "Chỉ hỗ trợ JPG, PNG, WebP");
      return;
    }

    if (file.size > MAX_SIZE_BYTE) {
      setPreview(null);
      setError(`Ảnh tối đa ${MAX_SIZE_MB}MB`);
      onChange(file, `Ảnh tối đa ${MAX_SIZE_MB}MB`);
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file)); // useEffect cleanup sẽ revoke URL cũ trước khi set cái mới
    onChange(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-stone-400 text-xs font-medium">Ảnh bìa</label>
      <label
        className={`relative cursor-pointer group w-36 h-48 rounded-xl overflow-hidden border-2 border-dashed transition-colors flex items-center justify-center bg-stone-800/50 ${
          error ? "border-red-500/60" : "border-stone-700 hover:border-amber-500/50"
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ImagePlus className="w-6 h-6 text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-stone-600 group-hover:text-stone-400 transition-colors">
            <ImagePlus className="w-8 h-8" strokeWidth={1.5} />
            <span className="text-xs text-center px-2">Tải ảnh lên</span>
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleChange}
        />
      </label>
      {error ? (
        <div className="flex items-center gap-2">
          <p className="text-red-400 text-xs flex-1">{error}</p>
          <button
            type="button"
            onClick={clearFile}
            className="text-xs text-stone-500 hover:text-white transition-colors shrink-0"
          >
            Xóa
          </button>
        </div>
      ) : (
        <p className="text-stone-600 text-[11px]">JPG, PNG — tối đa {MAX_SIZE_MB}MB</p>
      )}
    </div>
  );
}

// ── Genre Selector ────────────────────────────────────────────────────────────

function GenreSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (g: string[]) => void;
}) {
  const toggle = (name: string) =>
    onChange(selected.includes(name) ? selected.filter((g) => g !== name) : [...selected, name]);

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((genre) => {
        const active = selected.includes(genre.name);
        return (
          <button
            key={genre.slug}
            type="button"
            onClick={() => toggle(genre.name)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
              active
                ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                : "bg-stone-800 border-stone-700 text-stone-400 hover:border-stone-600 hover:text-stone-300"
            }`}
          >
            {genre.name}
            {active && <X className="w-3 h-3" />}
          </button>
        );
      })}
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-stone-400 text-xs font-medium">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function CreateNovelForm() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [coverError, setCoverError] = useState<string | null>(null);
  const coverFileRef = useRef<File | null>(null);

  const createMutation = useCreateNovel(coverFileRef);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { status: "PENDING", categoryIds: [] },
  });

  const onSubmit = (data: FormData) => {
    if (!user || coverError) return;
    createMutation.mutate({ ...data, userId: user.id } as FormData & { userId: string }, {
      onSuccess: () => router.push("/my-novels"),
    });
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Cover */}
        <CoverUpload
          onChange={(file, err) => {
            coverFileRef.current = file;
            setCoverError(err ?? null);
          }}
        />

        {/* Main fields */}
        <div className="flex flex-col gap-4 flex-1">
          <Field label="Tên truyện" required error={errors.name?.message}>
            <input
              {...register("name")}
              type="text"
              placeholder="Nhập tên truyện..."
              className={inputCls}
            />
          </Field>

          <Field label="Tác giả" required error={errors.author?.message}>
            <input
              {...register("author")}
              type="text"
              placeholder="Tên tác giả..."
              className={inputCls}
            />
          </Field>

          <Field label="Trạng thái">
            <select {...register("status")} className={inputCls}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <Field label="Thể loại" error={errors.categoryIds?.message}>
        <Controller
          name="categoryIds"
          control={control}
          render={({ field }) => <GenreSelector selected={field.value} onChange={field.onChange} />}
        />
      </Field>

      <Field label="Mô tả" error={errors.description?.message}>
        <textarea
          {...register("description")}
          rows={5}
          placeholder="Nhập mô tả truyện..."
          className={`${inputCls} resize-none leading-relaxed`}
        />
      </Field>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={createMutation.isPending || !!coverError}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
        >
          {createMutation.isPending ? "Đang đăng..." : "Đăng truyện"}
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
