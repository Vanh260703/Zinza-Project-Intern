"use client";

import { useMemo } from "react";
import { BookOpen } from "lucide-react";
import type { Novel } from "@/types/novel";
import NovelCard from "./NovelCard";
import { getNovelStatus } from "@/config/statuses";
import { useCategories } from "@/hooks/useCategories";

const SORT_LABELS: Record<string, string> = {
  latest: "Mới nhất",
  views: "Lượt xem",
  rating: "Đánh giá",
};

type SearchResultsSectionProps = {
  novels: Novel[];
  q?: string;
  genre?: string;
  status?: string;
  sort?: string;
};

export default function SearchResultsSection({
  novels,
  q,
  genre,
  status,
  sort,
}: SearchResultsSectionProps) {
  const { data: categories = [] } = useCategories();
  const genreLabels = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.slug, c.name])),
    [categories]
  );

  const activeFilters = [
    q && { label: `"${q}"` },
    genre && { label: genreLabels[genre] ?? genre },
    status && { label: getNovelStatus(status).label },
    sort && sort !== "latest" && { label: SORT_LABELS[sort] ?? sort },
  ].filter(Boolean) as { label: string }[];

  return (
    <section>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div>
          <h2 className="text-white text-xl font-bold">
            Kết quả tìm kiếm
            <span className="ml-2 text-amber-400">{novels.length}</span>
            <span className="text-stone-500 text-base font-normal ml-1">truyện</span>
          </h2>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {activeFilters.map((f, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-full"
              >
                {f.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {novels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-stone-800 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-stone-600" strokeWidth={1.5} />
          </div>
          <p className="text-stone-400 text-sm font-medium mb-1">Không tìm thấy kết quả</p>
          <p className="text-stone-600 text-xs">Thử thay đổi từ khóa hoặc bộ lọc</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {novels.map((novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      )}
    </section>
  );
}
