"use client";

import { Candy, BookOpen, Users, Lock } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";

const FOLLOWER_UNLOCK = 1000;

export default function ProfileStats() {
  const user = useAuthStore((s) => s.user);

  const candy        = user?.candy        ?? 0;
  const chaptersRead = user?.chaptersRead ?? 0;
  const followers    = user?.follower     ?? 0;
  const unlocked     = followers >= FOLLOWER_UNLOCK;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 grid grid-cols-3 divide-x divide-stone-800">
      {/* Kẹo */}
      <div className="flex flex-col gap-1 px-4 first:pl-0">
        <div className="flex items-center gap-1.5 text-stone-500 text-xs">
          <Candy className="w-3.5 h-3.5 text-amber-400" />
          Ngân quỹ
        </div>
        <p className="text-amber-400 text-xl font-bold">{candy.toLocaleString()}</p>
        <p className="text-stone-600 text-[11px]">Kẹo</p>
      </div>

      {/* Chương đã đọc */}
      <div className="flex flex-col gap-1 px-4">
        <div className="flex items-center gap-1.5 text-stone-500 text-xs">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          Đã đọc
        </div>
        <p className="text-emerald-400 text-xl font-bold">{chaptersRead.toLocaleString()}</p>
        <p className="text-stone-600 text-[11px]">Chương</p>
      </div>

      {/* Người theo dõi */}
      <div className="flex flex-col gap-1 px-4">
        <div className="flex items-center gap-1.5 text-stone-500 text-xs">
          <Users className={`w-3.5 h-3.5 ${unlocked ? "text-violet-400" : "text-stone-500"}`} />
          Theo dõi
        </div>
        <p className={`text-xl font-bold ${unlocked ? "text-violet-400" : "text-stone-300"}`}>
          {followers.toLocaleString()}
        </p>
        {unlocked ? (
          <p className="text-violet-400/80 text-[11px]">Chương trả phí đã mở ✦</p>
        ) : (
          <p className="text-stone-600 text-[11px] flex items-center gap-1">
            <Lock className="w-2.5 h-2.5 shrink-0" />
            Cần {FOLLOWER_UNLOCK.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
