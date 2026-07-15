"use client";

import { useMemo, useState } from "react";
import { PlusCircle, Search, Upload } from "lucide-react";
import Link from "next/link";
import { useMyNovels } from "@/hooks/useNovels";
import NovelCard from "./NovelCard";
import EmptyState from "./EmptyState";
import Pagination from "@/components/ui/Pagination";

const PAGE_SIZE = 8;

export default function MyNovelsContent() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const { data: novels = [], isLoading } = useMyNovels();

  const filtered = useMemo(
    () =>
      q.trim() ? novels.filter((n) => n.name.toLowerCase().includes(q.toLowerCase())) : novels,
    [novels, q]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (isLoading) {
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
          <div className="flex items-center gap-2 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 focus-within:border-amber-500/60 transition-colors">
            <Search className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1); // đổi từ khoá → về trang 1, tránh kẹt ở trang trống
              }}
              placeholder="Tìm kiếm truyện..."
              className="bg-transparent text-stone-200 text-sm placeholder-stone-600 outline-none w-full sm:w-36"
            />
          </div>
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
        <>
          <div className="flex flex-col gap-3">
            {paged.map((novel) => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filtered.length}
            itemLabel="truyện"
          />
        </>
      )}
    </div>
  );
}
