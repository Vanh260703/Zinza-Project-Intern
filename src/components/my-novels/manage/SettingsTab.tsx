"use client";

import { Lock, Crown } from "lucide-react";
import type { Story } from "@/types/story";

const FOLLOWER_UNLOCK = 1000;

type Props = { story: Story; followerCount: number };

export default function SettingsTab({ story, followerCount }: Props) {
  const canSetPrice = followerCount >= FOLLOWER_UNLOCK;

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
      <div className={`flex flex-col gap-3 p-4 border rounded-xl ${canSetPrice ? "bg-stone-800/50 border-stone-700" : "bg-stone-900 border-stone-800 opacity-60"}`}>
        <div className="flex items-start gap-3">
          <Lock className={`w-4 h-4 mt-0.5 shrink-0 ${canSetPrice ? "text-violet-400" : "text-stone-600"}`} />
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-stone-200 text-sm font-medium">Giá kẹo mặc định cho chương trả phí</p>
            {canSetPrice ? (
              <p className="text-stone-500 text-xs">Số kẹo mặc định khi tạo chương mới. Có thể chỉnh riêng từng chương.</p>
            ) : (
              <p className="text-stone-500 text-xs">
                Cần đạt <span className="text-violet-400 font-medium">{FOLLOWER_UNLOCK.toLocaleString()} người theo dõi</span> để mở khoá tính năng này.
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            defaultValue={story.price ?? 0}
            disabled={!canSetPrice}
            placeholder="0"
            className="w-28 text-stone-200 text-sm bg-stone-800 border border-stone-700 focus:border-amber-500/60 rounded-xl px-4 py-2 outline-none transition-colors disabled:cursor-not-allowed"
          />
          <span className="text-stone-500 text-sm">kẹo / chương</span>
        </div>
        {canSetPrice && (
          <button className="self-start px-5 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-colors">
            Lưu
          </button>
        )}
      </div>
    </div>
  );
}
