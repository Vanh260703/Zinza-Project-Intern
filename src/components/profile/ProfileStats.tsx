"use client";

import { Candy, Ticket, BookOpen } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";

const stats = [
  {
    key: "candy",
    label: "Ngân quỹ",
    sublabel: "Kẹo",
    icon: Candy,
    color: "amber",
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: "chaptersRead",
    label: "Chương đã đọc",
    sublabel: "Tổng",
    icon: BookOpen,
    color: "emerald",
    format: (v: number) => v.toLocaleString(),
  },
];

const COLOR_MAP: Record<string, string> = {
  amber:   "bg-amber-500/10   border-amber-500/20   text-amber-400",
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
};

const ICON_COLOR: Record<string, string> = {
  amber:   "text-amber-400",
  emerald: "text-emerald-400",
};

export default function ProfileStats() {
  const user = useAuthStore((s) => s.user);

  const values: Record<string, number> = {
    candy:        user?.candy        ?? 0,
    chaptersRead: user?.chaptersRead ?? 0,
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map(({ key, label, sublabel, icon: Icon, color, format }) => (
        <div
          key={key}
          className={`flex flex-col gap-2 p-4 rounded-xl border ${COLOR_MAP[color]}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-stone-400 text-xs font-medium">{label}</span>
            <Icon className={`w-4 h-4 ${ICON_COLOR[color]}`} strokeWidth={1.8} />
          </div>
          <p className={`text-xl font-bold ${ICON_COLOR[color]}`}>{format(values[key])}</p>
          <p className="text-stone-600 text-[11px]">{sublabel}</p>
        </div>
      ))}
    </div>
  );
}
