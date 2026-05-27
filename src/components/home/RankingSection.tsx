"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Crown, Trophy } from "lucide-react";
import type { Story } from "@/types/story";

type Period = "day" | "week" | "month";

const TABS: { id: Period; label: string }[] = [
  { id: "day",   label: "Ngày"  },
  { id: "week",  label: "Tuần"  },
  { id: "month", label: "Tháng" },
];

const RANK_COLORS: Record<number, string> = {
  1: "text-amber-400  font-bold",
  2: "text-stone-300  font-bold",
  3: "text-amber-600  font-bold",
};

type Props = {
  day:   Story[];
  week:  Story[];
  month: Story[];
};

export default function RankingSection({ day, week, month }: Props) {
  const [period, setPeriod] = useState<Period>("month");

  const stories = { day, week, month }[period];

  return (
    <aside className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-sm flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-400" />
          Bảng xếp hạng
        </h2>
        <div className="flex items-center bg-stone-800 border border-stone-700 rounded-lg p-0.5 gap-0.5">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setPeriod(id)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                period === id
                  ? "bg-amber-500 text-white"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        {stories.map((story, i) => {
          const rank = i + 1;
          return (
            <Link
              key={story.id}
              href={`/novels/${story.slug}`}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-stone-800/60 transition-colors border-b border-stone-800/60 last:border-0 group"
            >
              {/* Rank number */}
              <span className={`w-5 text-center text-sm shrink-0 ${RANK_COLORS[rank] ?? "text-stone-600 font-medium"}`}>
                {rank <= 3 ? (
                  <span className="text-base">{["🥇","🥈","🥉"][rank - 1]}</span>
                ) : rank}
              </span>

              {/* Cover */}
              <div className="w-9 h-12 rounded-md overflow-hidden bg-stone-800 shrink-0">
                {story.poster ? (
                  <img src={`/api/cover/${story.id}`} alt={story.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5 text-stone-600" strokeWidth={1.5} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-stone-200 text-xs font-semibold line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {story.name}
                  </p>
                  {story.vip && (
                    <Crown className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                  )}
                </div>
                <p className="text-stone-500 text-[11px] truncate">{story.author}</p>
                <p className="text-stone-600 text-[10px]">{story.nominations.toLocaleString()} đề cử</p>
              </div>
            </Link>
          );
        })}

        {stories.length === 0 && (
          <div className="px-4 py-10 text-center text-stone-600 text-xs">Chưa có dữ liệu.</div>
        )}
      </div>
    </aside>
  );
}
