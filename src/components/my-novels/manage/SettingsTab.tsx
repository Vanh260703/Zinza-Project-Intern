"use client";

import { Crown } from "lucide-react";
import type { Story } from "@/types/story";

type Props = { story: Story };

export default function SettingsTab({ story }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {/* VIP */}
      <div className="flex items-start justify-between gap-4 p-4 bg-stone-800/50 border border-stone-700 rounded-xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <p className="text-stone-200 text-sm font-medium">Truyện VIP</p>
          </div>
          <p className="text-stone-500 text-xs">Đánh dấu truyện là VIP để phân biệt với truyện thường.</p>
        </div>
        <button
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${story.vip ? "bg-amber-500" : "bg-stone-700"}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${story.vip ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </div>

      {/* Giá kẹo mặc định */}
      <div className="flex flex-col gap-3 p-4 border rounded-xl bg-stone-800/50 border-stone-700">
        <div className="flex flex-col gap-1">
          <p className="text-stone-200 text-sm font-medium">Giá kẹo mặc định cho chương trả phí</p>
          <p className="text-stone-500 text-xs">Số kẹo mặc định khi tạo chương mới. Có thể chỉnh riêng từng chương.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            defaultValue={story.price ?? 0}
            placeholder="0"
            className="w-28 text-stone-200 text-sm bg-stone-800 border border-stone-700 focus:border-amber-500/60 rounded-xl px-4 py-2 outline-none transition-colors"
          />
          <span className="text-stone-500 text-sm">kẹo / chương</span>
        </div>
        <button className="self-start px-5 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-colors">
          Lưu
        </button>
      </div>
    </div>
  );
}
