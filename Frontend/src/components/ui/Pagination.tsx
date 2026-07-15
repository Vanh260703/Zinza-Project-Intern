"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number; // để hiện nhãn "N <itemLabel>" ở màn lớn
  itemLabel?: string;
};

// Danh sách trang rút gọn: luôn giữ trang đầu, cuối, và ±1 quanh trang hiện tại; chèn "..." vào khoảng cách.
function buildPages(totalPages: number, cur: number): (number | "...")[] {
  return Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - cur) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  itemLabel = "mục",
}: Props) {
  if (totalPages <= 1) return null;

  const cur = Math.min(Math.max(1, page), totalPages);
  const pages = buildPages(totalPages, cur);

  const arrowCls =
    "flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-lg border border-stone-700 text-stone-400 hover:bg-stone-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-stone-400 transition-colors";

  return (
    <div className="flex items-center justify-center sm:justify-between gap-3">
      {/* Nhãn — chỉ hiện từ tablet trở lên */}
      <p className="hidden sm:block text-stone-500 text-xs whitespace-nowrap">
        {totalItems != null ? (
          <>
            {totalItems.toLocaleString()} {itemLabel}
          </>
        ) : (
          <>
            Trang {cur}/{totalPages}
          </>
        )}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(cur - 1)}
          disabled={cur <= 1}
          aria-label="Trang trước"
          className={arrowCls}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Mobile: chỉ hiện "Trang x/y" giữa 2 mũi tên */}
        <span className="sm:hidden px-3 text-stone-300 text-sm font-medium tabular-nums">
          Trang {cur}/{totalPages}
        </span>

        {/* Tablet/desktop: nút số + ellipsis */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`e${i}`} className="px-1 text-stone-700 text-xs select-none">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={cur === p ? "page" : undefined}
                className={`w-8 h-8 rounded-lg text-xs font-semibold tabular-nums transition-colors ${
                  cur === p
                    ? "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                    : "border border-stone-700 text-stone-400 hover:bg-stone-800 hover:text-white"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(cur + 1)}
          disabled={cur >= totalPages}
          aria-label="Trang sau"
          className={arrowCls}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
