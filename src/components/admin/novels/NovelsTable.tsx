"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Crown, ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Story } from "@/types/story";
import { showToast } from "@/lib/toast";

type StoryRow = Story & { publisherName?: string; publisherEmail?: string };

const PAGE_SIZE = 12;

const STATUS_CLS: Record<string, string> = {
  completed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  pending:   "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

function formatDate(d?: Date | string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN");
}

export default function NovelsTable() {
  const router = useRouter();
  const [novels, setNovels]   = useState<StoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]             = useState("");
  const [status, setStatus]   = useState("all");
  const [vip, setVip]         = useState("all");
  const [page, setPage]       = useState(1);

  useEffect(() => {
    Promise.all([
      fetch("/api/novels?all=true").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
    ]).then(([stories, users]) => {
      const map: Record<string, { name: string; email: string }> = {};
      (users as { id: string; name: string; email: string }[]).forEach((u) => { map[u.id] = { name: u.name, email: u.email }; });
      setNovels((stories as Story[]).map((s) => ({ ...s, publisherName: map[s.postedBy]?.name, publisherEmail: map[s.postedBy]?.email })));
    })
    .catch(() => showToast.error("Không tải được danh sách truyện"))
    .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...novels];
    if (q.trim()) {
      const lq = q.toLowerCase();
      list = list.filter((n) =>
        n.name.toLowerCase().includes(lq) ||
        n.author.toLowerCase().includes(lq) ||
        (n.publisherName ?? "").toLowerCase().includes(lq) ||
        (n.publisherEmail ?? "").toLowerCase().includes(lq),
      );
    }
    if (status !== "all") list = list.filter((n) => n.status === status);
    if (vip === "vip") list = list.filter((n) => n.vip);
    if (vip === "free") list = list.filter((n) => !n.vip);
    return list;
  }, [novels, q, status, vip]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const curPage    = Math.min(page, totalPages);
  const paginated  = filtered.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);

  const reset = (fn: () => void) => { fn(); setPage(1); };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-5 h-5 border-2 border-stone-700 border-t-violet-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 focus-within:border-violet-500/60 transition-colors flex-1">
          <Search className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <input value={q} onChange={(e) => reset(() => setQ(e.target.value))}
            placeholder="Tìm tên truyện, tác giả, người đăng..."
            className="bg-transparent text-stone-200 text-sm placeholder-stone-600 outline-none flex-1" />
        </div>
        <select value={status} onChange={(e) => reset(() => setStatus(e.target.value))}
          className="bg-stone-800 border border-stone-700 text-stone-300 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-violet-500/60 transition-colors">
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Đang ra</option>
          <option value="completed">Hoàn thành</option>
        </select>
        <select value={vip} onChange={(e) => reset(() => setVip(e.target.value))}
          className="bg-stone-800 border border-stone-700 text-stone-300 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-violet-500/60 transition-colors">
          <option value="all">Tất cả loại</option>
          <option value="vip">VIP</option>
          <option value="free">Miễn phí</option>
        </select>
      </div>

      <p className="text-stone-600 text-xs">{filtered.length.toLocaleString()} truyện</p>

      {/* Grid */}
      {paginated.length === 0 ? (
        <p className="text-stone-600 text-sm text-center py-16">Không tìm thấy truyện nào</p>
      ) : (
        <div className="flex flex-col gap-3">
          {paginated.map((n) => (
            <div key={n.id}
              onClick={() => router.push(`/admin/novels/${n.id}`)}
              className="flex gap-4 p-4 bg-stone-900/60 border border-stone-800 rounded-2xl hover:border-stone-600 hover:bg-stone-800/40 transition-colors cursor-pointer"
            >
              {/* Cover */}
              <div className="w-14 h-20 rounded-xl overflow-hidden bg-stone-800 shrink-0">
                {n.poster
                  ? <img src={`/api/cover/${n.id}`} alt={n.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-5 h-5 text-stone-600" strokeWidth={1.5} /></div>
                }
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-0 justify-center">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-stone-100 font-semibold text-sm">{n.name}</h3>
                  {n.vip && (
                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md">
                      <Crown className="w-2.5 h-2.5" />VIP
                    </span>
                  )}
                  <span className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold ${STATUS_CLS[n.status] ?? STATUS_CLS.pending}`}>
                    {n.status === "completed" ? "Hoàn thành" : "Đang ra"}
                  </span>
                </div>

                <p className="text-stone-500 text-xs">Tác giả: <span className="text-stone-400">{n.author}</span></p>

                <div className="flex items-center gap-3 flex-wrap text-xs text-stone-600">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{n.chapterCount} chương</span>
                  {n.rating > 0 && <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{n.rating.toFixed(1)}</span>}
                  <span>🍬 {n.nominations} đề cử</span>
                </div>

                <p className="text-stone-700 text-xs">
                  Đăng bởi: <span className="text-stone-500">{n.publisherName ?? n.postedBy}</span>
                  {n.publisherEmail && <span className="text-stone-700 ml-1">({n.publisherEmail})</span>}
                  <span className="mx-1.5 text-stone-800">·</span>
                  {formatDate(n.updatedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-stone-600 text-xs">Trang {curPage} / {totalPages}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={curPage === 1}
              className="p-1.5 rounded-lg border border-stone-800 text-stone-400 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - curPage) <= 1)
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(p); return acc;
              }, [])
              .map((p, i) => p === "..."
                ? <span key={`e${i}`} className="px-1 text-stone-700 text-xs">…</span>
                : <button key={p} onClick={() => setPage(p as number)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${curPage === p ? "bg-violet-500/20 border border-violet-500/30 text-violet-400" : "border border-stone-800 text-stone-500 hover:bg-stone-800 hover:text-white"}`}>
                    {p}
                  </button>
              )}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={curPage === totalPages}
              className="p-1.5 rounded-lg border border-stone-800 text-stone-400 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
