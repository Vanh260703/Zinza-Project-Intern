"use client";

import { useState, useRef, useEffect } from "react";
import { X, ImagePlus } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";
import { showToast } from "@/lib/toast";
import type { Story } from "@/types/story";
import { GENRES } from "@/config/genres";

const STATUS_OPTIONS = [
  { label: "Đang ra", value: "pending" },
  { label: "Hoàn thành", value: "completed" },
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTE = 2 * 1024 * 1024;

const inputCls =
  "w-full text-stone-200 text-sm bg-stone-800 border border-stone-700 focus:border-amber-500/60 rounded-xl px-4 py-2.5 outline-none transition-colors placeholder-stone-600";

type Props = { story: Story; onUpdated: (s: Story) => void };

export default function EditTab({ story, onUpdated }: Props) {
  const user = useAuthStore((s) => s.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(story.name);
  const [author, setAuthor] = useState(story.author);
  const [status, setStatus] = useState(story.status);
  const [genres, setGenres] = useState<string[]>(story.genres.map((g) => g.name));
  const [description, setDescription] = useState(story.description);
  const [loading, setLoading] = useState(false);

  // Cover state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const toggleGenre = (g: string) =>
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

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

  const handleSave = async () => {
    if (!user) return;
    if (coverError) return;
    setLoading(true);
    try {
      // 1. Cập nhật thông tin truyện
      const res = await fetch(`/api/novels/${story.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, name, author, status, genres, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast.error(data.message ?? "Cập nhật thất bại");
        return;
      }

      // 2. Upload cover mới nếu có (route tự xóa ảnh cũ)
      if (coverFile) {
        const form = new FormData();
        form.append("cover", coverFile);
        const coverRes = await fetch(`/api/cover/${story.id}`, { method: "POST", body: form });
        if (!coverRes.ok) {
          const err = await coverRes.json().catch(() => ({}));
          showToast.error(err.message ?? "Upload ảnh bìa thất bại");
          // Thông tin truyện đã lưu, chỉ ảnh bị lỗi
          onUpdated(data.story);
          return;
        }
        const { poster } = await coverRes.json();
        data.story.poster = poster;
        setCoverFile(null);
        setCoverPreview(null);
      }

      showToast.success("Đã lưu thay đổi");
      onUpdated(data.story);
    } catch {
      showToast.error("Lỗi kết nối, thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  // Preview hiện tại: ảnh mới chọn → ảnh cũ trên server → placeholder
  const currentCover = coverPreview ?? (story.poster ? `/api/cover/${story.id}` : null);

  return (
    <div className="flex flex-col gap-5">
      {/* Cover */}
      <div className="flex flex-col gap-2">
        <label className="text-stone-400 text-xs font-medium">Ảnh bìa</label>
        <div className="flex items-end gap-4">
          {/* Preview */}
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

          {/* Info + actions */}
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
              {story.poster || coverFile ? "Đổi ảnh bìa" : "Chọn ảnh bìa"}
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
        <div className="flex flex-col gap-2">
          <label className="text-stone-400 text-xs font-medium">
            Tên truyện <span className="text-red-400">*</span>
          </label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-stone-400 text-xs font-medium">
            Tác giả <span className="text-red-400">*</span>
          </label>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-stone-400 text-xs font-medium">Trạng thái</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Story["status"])}
            className={inputCls}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-stone-400 text-xs font-medium">Thể loại</label>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => {
            const active = genres.includes(g.name);
            return (
              <button
                key={g.slug}
                type="button"
                onClick={() => toggleGenre(g.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                  active
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                    : "bg-stone-800 border-stone-700 text-stone-400 hover:border-stone-600"
                }`}
              >
                {g.name}
                {active && <X className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-stone-400 text-xs font-medium">Mô tả</label>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputCls} resize-none leading-relaxed`}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={loading || !!coverError}
        className="self-start px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
      >
        {loading ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </div>
  );
}
