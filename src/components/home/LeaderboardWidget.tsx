"use client";

import Link from "next/link";
import { useState } from "react";
import { Star, TrendingUp } from "lucide-react";
import type { Story } from "@/types/story";

type LeaderboardWidgetProps = {
  stories: Story[];
};

const TABS = ["Ngày", "Tháng", "Năm"] as const;

const RANK_STYLES: Record<number, { num: string; bar: string }> = {
  1: { num: "text-amber-400 font-black",   bar: "bg-amber-500" },
  2: { num: "text-stone-300 font-black",   bar: "bg-stone-400" },
  3: { num: "text-amber-700 font-black",   bar: "bg-amber-700" },
};

function RankRow({ story, rank }: { story: Story; rank: number }) {
  const style = RANK_STYLES[rank];

  return (
    <Link
      href={`/truyen/${story.slug}`}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-800/60 transition-colors"
    >
      {/* Rank number */}
      <span
        className={`w-5 text-center text-sm shrink-0 ${
          style ? style.num : "text-stone-600 font-semibold"
        }`}
      >
        {rank}
      </span>

      {/* Cover thumbnail */}
      <div className="w-8 h-10 rounded-md overflow-hidden bg-stone-800 shrink-0">
        {story.poster ? (
          <img
            src={`/api/cover/${story.id}`}
            alt={story.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-stone-700" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-stone-200 text-xs font-semibold line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
          {story.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {story.rating > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
              <Star className="w-2.5 h-2.5 fill-amber-400" />
              {story.rating.toFixed(1)}
            </span>
          )}
          <span className="text-[10px] text-stone-600 truncate">{story.author}</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="shrink-0 flex flex-col items-end gap-1">
        <span className="text-[10px] text-stone-500 font-medium">
          {story.nominations.toLocaleString()}
        </span>
        <div className="w-10 h-1 bg-stone-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${style ? style.bar : "bg-stone-600"}`}
            style={{ width: `${Math.max(20, (rank === 1 ? 100 : (6 - rank) * 18))}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

export default function LeaderboardWidget({ stories }: LeaderboardWidgetProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Ngày");

  return (
    <div className="bg-stone-900 border border-stone-700/80 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-stone-800">
        <span className="text-base">🏆</span>
        <h3 className="text-white text-sm font-bold flex-1">Bảng xếp hạng</h3>
        <TrendingUp className="w-3.5 h-3.5 text-stone-600" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-800">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === tab
                ? "text-amber-400 border-b-2 border-amber-500 -mb-px bg-amber-500/5"
                : "text-stone-500 hover:text-stone-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Rows */}
      <div className="p-2 space-y-0.5">
        {stories.map((story, i) => (
          <RankRow key={story.id} story={story} rank={i + 1} />
        ))}
      </div>

      <p className="text-center text-stone-700 text-[10px] py-2.5">
        Dữ liệu mock · cập nhật theo nominations
      </p>
    </div>
  );
}
