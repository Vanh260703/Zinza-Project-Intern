"use client";

import { useState } from "react";
import { BarChart2 } from "lucide-react";
import { useMyNovelsStats } from "@/hooks/useNovels";
import Pagination from "@/components/ui/Pagination";

const PAGE_SIZE = 10;

const SUMMARY_STATS = [
  { key: "views", label: "LƯỢT ĐỌC", color: "text-amber-400" },
  { key: "nominated", label: "ĐỀ CỬ", color: "text-amber-400" },
  { key: "unlocked", label: "MỞ KHOÁ", color: "text-amber-400" },
  { key: "gifts", label: "TIỀN QUÀ", color: "text-amber-400" },
  { key: "revenue", label: "TIỀN MỞ KHOÁ", color: "text-amber-400" },
] as const;

const TABLE_COLS = [
  { key: "name", label: "TRUYỆN", align: "text-left" },
  { key: "author", label: "TÁC GIẢ", align: "text-left" },
  { key: "views", label: "ĐỌC", align: "text-center" },
  { key: "nominated", label: "ĐỀ CỬ", align: "text-center" },
  { key: "unlocked", label: "MỞ KHOÁ", align: "text-center" },
  { key: "gifts", label: "QUÀ", align: "text-center" },
  { key: "revenue", label: "TIỀN MỞ KHOÁ", align: "text-center" },
];

export default function StatsContent() {
  const { data: rows = [], isLoading: loading } = useMyNovelsStats();
  const [page, setPage] = useState(1);

  // Tổng cộng dồn trên TOÀN BỘ truyện (không phụ thuộc trang) → thẻ tổng luôn đúng
  const totals = rows.reduce(
    (acc, r) => ({
      views: acc.views + r.views,
      nominated: acc.nominated + r.nominated,
      unlocked: acc.unlocked + r.unlocked,
      gifts: acc.gifts + r.gifts,
      revenue: acc.revenue + r.revenue,
    }),
    { views: 0, nominated: 0, unlocked: 0, gifts: 0, revenue: 0 }
  );

  // Phân trang phía client — chỉ cắt phần hiển thị bảng
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages); // clamp khi data đổi (vd list ngắn lại)
  const pageRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-white font-bold text-xl flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-amber-400" />
          Thống kê truyện
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Tổng lượt đọc, đề cử, mở khoá và doanh thu của các truyện bạn đăng.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {SUMMARY_STATS.map(({ key, label, color }) => (
          <div
            key={key}
            className="flex flex-col gap-1.5 p-4 bg-stone-900 border border-stone-800 rounded-xl"
          >
            <p className="text-stone-600 text-[10px] font-semibold tracking-wider">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{totals[key].toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-800">
              {TABLE_COLS.map(({ key, label, align }) => (
                <th
                  key={key}
                  className={`px-4 py-3 text-[10px] font-semibold tracking-wider text-stone-500 ${align}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center">
                  <div className="flex justify-center">
                    <div className="w-5 h-5 border-2 border-stone-700 border-t-amber-500 rounded-full animate-spin" />
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-stone-600 text-sm">
                  Chưa có truyện nào.
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-stone-800/60 last:border-0 hover:bg-stone-800/30 transition-colors"
                >
                  <td className="px-4 py-3.5 text-stone-200 text-sm font-medium">{row.name}</td>
                  <td className="px-4 py-3.5 text-stone-500 text-sm">{row.author}</td>
                  <td className="px-4 py-3.5 text-stone-300 text-sm text-center">
                    {row.views.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-stone-300 text-sm text-center">
                    {row.nominated.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-stone-300 text-sm text-center">
                    {row.unlocked.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-amber-400 text-sm text-center font-medium">
                    {row.gifts.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-amber-400 text-sm text-center font-medium">
                    {row.revenue.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang phía client */}
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={rows.length}
        itemLabel="truyện"
      />
    </div>
  );
}
