"use client";

import { Candy, BookOpen, Ticket } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";
import DailyTicketCard from "./DailyTicketCard";

export default function ProfileStats() {
  const user = useAuthStore((s) => s.user);
  const wallet = useAuthStore((s) => s.wallet);

  const candy = wallet?.balance ?? 0;
  const chaptersRead = user?.chaptersRead ?? 0;
  const recommendationTickets = user?.recommendationTickets ?? 0;

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
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

      {/* Vé tháng */}
      <div className="flex flex-col gap-1 px-4 first:pl-0">
        <div className="flex items-center gap-1.5 text-stone-500 text-xs">
          <Ticket className="w-3.5 h-3.5 text-sky-400" />
          Vé đề cử
        </div>
        <p className="text-sky-400 text-xl font-bold">
          {recommendationTickets.toLocaleString()}
        </p>
        <p className="text-stone-600 text-[11px]">Vé</p>
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
    </div>
    <DailyTicketCard />
    </div>
  );
}
