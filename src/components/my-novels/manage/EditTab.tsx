"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";
import { showToast } from "@/lib/toast";
import type { Story } from "@/types/story";

const GENRES = ["Huyền Huyễn", "Huyền Nghi", "Kỳ Ảo", "Tiên Hiệp", "Đô Thị"];
const STATUS_OPTIONS = [
  { label: "Đang ra",    value: "pending"   },
  { label: "Hoàn thành", value: "completed" },
];

const inputCls = "w-full text-stone-200 text-sm bg-stone-800 border border-stone-700 focus:border-amber-500/60 rounded-xl px-4 py-2.5 outline-none transition-colors placeholder-stone-600";

type Props = { story: Story; onUpdated: (s: Story) => void };

export default function EditTab({ story, onUpdated }: Props) {
  const user = useAuthStore((s) => s.user);
  const [name, setName]               = useState(story.name);
  const [author, setAuthor]           = useState(story.author);
  const [status, setStatus]           = useState(story.status);
  const [genres, setGenres]           = useState<string[]>(story.genres);
  const [description, setDescription] = useState(story.description);
  const [loading, setLoading]         = useState(false);

  const toggleGenre = (g: string) =>
    setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/novels/${story.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, name, author, status, genres, description }),
      });
      const data = await res.json();
      if (!res.ok) { showToast.error(data.message ?? "Cập nhật thất bại"); return; }
      showToast.success("Đã lưu thay đổi");
      onUpdated(data.story);
    } catch {
      showToast.error("Lỗi kết nối, thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-stone-400 text-xs font-medium">Tên truyện <span className="text-red-400">*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-stone-400 text-xs font-medium">Tác giả <span className="text-red-400">*</span></label>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-stone-400 text-xs font-medium">Trạng thái</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as Story["status"])} className={inputCls}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-stone-400 text-xs font-medium">Thể loại</label>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => {
            const active = genres.includes(g);
            return (
              <button key={g} type="button" onClick={() => toggleGenre(g)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                  active ? "bg-amber-500/15 border-amber-500/30 text-amber-400" : "bg-stone-800 border-stone-700 text-stone-400 hover:border-stone-600"
                }`}>
                {g}{active && <X className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-stone-400 text-xs font-medium">Mô tả</label>
        <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)}
          className={`${inputCls} resize-none leading-relaxed`} />
      </div>

      <button onClick={handleSave} disabled={loading}
        className="self-start px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors">
        {loading ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </div>
  );
}
