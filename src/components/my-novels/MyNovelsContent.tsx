"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/stores/userStore";
import { PlusCircle, Search, Upload } from "lucide-react";
import { showToast } from "@/lib/toast";
import Link from "next/link";
import type { Story } from "@/types/story";
import NovelCard from "./NovelCard";
import EmptyState from "./EmptyState";

export default function MyNovelsContent() {
  const user = useAuthStore((s) => s.user);
  const [novels, setNovels] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!user) return;
    fetch(`/api/novels?postedBy=${user.id}`)
      .then((r) => r.json())
      .then(setNovels)
      .catch(() => showToast.error("Không tải được danh sách truyện"))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(
    () =>
      q.trim() ? novels.filter((n) => n.name.toLowerCase().includes(q.toLowerCase())) : novels,
    [novels, q]
  );

  const handleDelete = (id: string) => {
    setNovels((prev) => prev.filter((n) => n.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-5 h-5 border-2 border-stone-700 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Truyện Đã Đăng</h2>
          <p className="text-stone-500 text-sm mt-0.5">Quản lý các tác phẩm bạn đã đăng tải</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
          {/* Search — full width trên mobile */}
          <div className="flex items-center gap-2 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 focus-within:border-amber-500/60 transition-colors">
            <Search className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm kiếm truyện..."
              className="bg-transparent text-stone-200 text-sm placeholder-stone-600 outline-none w-full sm:w-36"
            />
          </div>
          {/* Buttons — nằm cùng hàng trên mobile */}
          <div className="flex items-center gap-2">
            <Link
              href="/my-novels/import"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white transition-colors whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              Import ZIP
            </Link>
            <Link
              href="/my-novels/create"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-colors whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              Đăng mới
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      {novels.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <p className="text-stone-600 text-sm text-center py-10">
          Không tìm thấy truyện nào khớp với &ldquo;{q}&rdquo;.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((novel) => (
            <NovelCard key={novel.id} story={novel} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
