"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";
import { showToast } from "@/lib/toast";

const GENRES = ["Huyền Huyễn", "Huyền Nghi", "Kỳ Ảo", "Tiên Hiệp", "Đô Thị"];

const STATUS_OPTIONS = [
  { label: "Đang ra",    value: "pending"   },
  { label: "Hoàn thành", value: "completed" },
];

const inputCls =
  "w-full text-stone-200 text-sm bg-stone-800 border border-stone-700 focus:border-amber-500/60 rounded-xl px-4 py-2.5 outline-none transition-colors placeholder-stone-600";

// ── Cover Upload ──────────────────────────────────────────────────────────────

function CoverUpload({ onChange }: { onChange: (file: File | null) => void }) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-stone-400 text-xs font-medium">Ảnh bìa</label>
      <label className="relative cursor-pointer group w-36 h-48 rounded-xl overflow-hidden border-2 border-dashed border-stone-700 hover:border-amber-500/50 transition-colors flex items-center justify-center bg-stone-800/50">
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
        <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
      </label>
      <p className="text-stone-600 text-[11px]">JPG, PNG — tối đa 2MB</p>
    </div>
  );
}

// ── Genre Selector ────────────────────────────────────────────────────────────

function GenreSelector({ selected, onChange }: { selected: string[]; onChange: (g: string[]) => void }) {
  const toggle = (genre: string) =>
    onChange(selected.includes(genre) ? selected.filter((g) => g !== genre) : [...selected, genre]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-stone-400 text-xs font-medium">
        Thể loại <span className="text-stone-600">(chọn một hoặc nhiều)</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre) => {
          const active = selected.includes(genre);
          return (
            <button
              key={genre}
              type="button"
              onClick={() => toggle(genre)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                active
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                  : "bg-stone-800 border-stone-700 text-stone-400 hover:border-stone-600 hover:text-stone-300"
              }`}
            >
              {genre}
              {active && <X className="w-3 h-3" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-stone-400 text-xs font-medium">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
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

  const [name, setName]               = useState("");
  const [author, setAuthor]           = useState("");
  const [status, setStatus]           = useState<"pending" | "completed">("pending");
  const [genres, setGenres]           = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile]     = useState<File | null>(null);
  const [loading, setLoading]         = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/novels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, name, author, status, genres, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        const fieldErrors = data.errors?.fieldErrors ?? {};
        const mapped: Record<string, string> = {};
        for (const [k, v] of Object.entries(fieldErrors)) {
          mapped[k] = (v as string[])[0];
        }
        setErrors(mapped);
        showToast.error(data.message ?? "Đăng truyện thất bại");
        return;
      }

      // Upload ảnh bìa nếu có
      if (coverFile) {
        const form = new FormData();
        form.append("cover", coverFile);
        await fetch(`/api/cover/${data.story.id}`, { method: "POST", body: form });
      }

      showToast.success("Đăng truyện thành công");
      setLoading(false);
      router.push("/my-novels");
    } catch {
      showToast.error("Lỗi kết nối, thử lại sau");
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Cover */}
        <CoverUpload onChange={setCoverFile} />

        {/* Main fields */}
        <div className="flex flex-col gap-4 flex-1">
          <Field label="Tên truyện" required error={errors.name}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên truyện..."
              className={inputCls}
            />
          </Field>

          <Field label="Tác giả" required error={errors.author}>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Tên tác giả..."
              className={inputCls}
            />
          </Field>

          <Field label="Trạng thái">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "pending" | "completed")}
              className={inputCls}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <Field label="Thể loại" error={errors.genres}>
        <GenreSelector selected={genres} onChange={setGenres} />
      </Field>

      <Field label="Mô tả" error={errors.description}>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nhập mô tả truyện..."
          className={`${inputCls} resize-none leading-relaxed`}
        />
      </Field>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
        >
          {loading ? "Đang đăng..." : "Đăng truyện"}
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
