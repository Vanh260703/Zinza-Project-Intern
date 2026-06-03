"use client";

import { useEffect, useState } from "react";
import { BarChart2 } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";
import { showToast } from "@/lib/toast";
import type { Story } from "@/types/story";

const SUMMARY_STATS = [
  { key: "views", label: "LƯỢT ĐỌC", color: "text-amber-400" },
  { key: "nominated", label: "ĐỀ CỬ", color: "text-amber-400" },
  { key: "unlocked", label: "MỞ KHOÁ", color: "text-amber-400" },
  { key: "gifts", label: "TIỀN QUÀ", color: "text-amber-400" },
  { key: "revenue", label: "TIỀN MỞ KHOÁ", color: "text-amber-400" },
];

const TABLE_COLS = [
  { key: "name", label: "TRUYỆN", align: "text-left" },
  { key: "author", label: "TÁC GIẢ", align: "text-left" },
  { key: "views", label: "ĐỌC", align: "text-center" },
  { key: "nominated", label: "ĐỀ CỬ", align: "text-center" },
  { key: "unlocked", label: "MỞ KHOÁ", align: "text-center" },
  { key: "gifts", label: "QUÀ", align: "text-center" },
  { key: "revenue", label: "MỞ KHOÁ", align: "text-center" },
];

type StoryStats = {
  id: string;
  name: string;
  author: string;
  views: number;
  nominated: number;
  unlocked: number;
  gifts: number;
  revenue: number;
};

function toStats(story: Story): StoryStats {
  return {
    id: story.id,
    name: story.name,
    author: story.author,
    views: 0,
    nominated: story.nominations ?? 0,
    unlocked: 0,
    gifts: 0,
    revenue: 0,
  };
}

export default function StatsContent() {
  const user = useAuthStore((s) => s.user);
  const [novels, setNovels] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    if (!user) return;
    fetch(`/api/novels?postedBy=${user.id}`)
      .then((r) => r.json())
      .then(setNovels)
      .catch(() => showToast.error("Không tải được dữ liệu thống kê"))
      .finally(() => setLoading(false));
  }, [user]);

  const rows = novels.map(toStats);

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

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
        <div>
          <h2 className="text-white font-bold text-xl flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-amber-400" />
            Thống kê truyện
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Lượt đọc, đề cử, mở khoá và doanh thu theo dải ngày.
          </p>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-stone-800 border border-stone-700 text-stone-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-amber-500/60 transition-colors"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-stone-800 border border-stone-700 text-stone-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-amber-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {SUMMARY_STATS.map(({ key, label, color }) => (
          <div
            key={key}
            className="flex flex-col gap-1.5 p-4 bg-stone-900 border border-stone-800 rounded-xl"
          >
            <p className="text-stone-600 text-[10px] font-semibold tracking-wider">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>
              {totals[key as keyof typeof totals].toLocaleString()}
            </p>
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
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-stone-800/60 last:border-0 hover:bg-stone-800/30 transition-colors"
                >
                  <td className="px-4 py-3.5 text-stone-200 text-sm font-medium">{row.name}</td>
                  <td className="px-4 py-3.5 text-stone-500 text-sm">{row.author}</td>
                  <td className="px-4 py-3.5 text-stone-300 text-sm text-center">{row.views}</td>
                  <td className="px-4 py-3.5 text-stone-300 text-sm text-center">
                    {row.nominated}
                  </td>
                  <td className="px-4 py-3.5 text-stone-300 text-sm text-center">{row.unlocked}</td>
                  <td className="px-4 py-3.5 text-amber-400 text-sm text-center font-medium">
                    {row.gifts}
                  </td>
                  <td className="px-4 py-3.5 text-amber-400 text-sm text-center font-medium">
                    {row.revenue}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
