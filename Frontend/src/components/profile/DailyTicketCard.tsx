"use client";

import { useClaimDailyTicket, useDailyProgress } from "@/hooks/useUser";
import { Ticket, BookOpen, CheckCircle2, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";

export default function DailyTicketCard() {
  const user = useAuthStore((s) => s.user);
  const { data } = useDailyProgress();
  const claimMutation = useClaimDailyTicket();

  if (!user) return null;

  // Tiến độ thật từ BE
  const REQUIRED = data?.required ?? 10;
  const count = data?.todayCount ?? 0;
  const claimed = data?.claimed ?? false;
  const pct = Math.min((count / REQUIRED) * 100, 100);
  const remaining = Math.max(REQUIRED - count, 0);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-500/15 shrink-0">
            <Ticket className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-sky-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm sm:text-base leading-tight">
              Vé đề cử hàng ngày
            </p>
            <p className="text-stone-500 text-xs mt-0.5">Đọc {REQUIRED} chương/ngày để nhận 1 vé</p>
          </div>
        </div>

        {/* Badge trạng thái — desktop hiện inline, mobile xuống dưới */}
        {claimed && (
          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã nhận hôm nay
          </span>
        )}
      </div>

      {/* Progress bar + counter */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-stone-400 text-xs">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tiến độ hôm nay</span>
          </div>
          <span
            className={`text-xs font-semibold tabular-nums ${
              count >= REQUIRED ? "text-emerald-400" : "text-stone-300"
            }`}
          >
            {count}/{REQUIRED}
          </span>
        </div>

        {/* Track */}
        <div className="h-2 sm:h-2.5 w-full bg-stone-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              count >= REQUIRED ? "bg-emerald-500" : "bg-gradient-to-r from-sky-500 to-sky-400"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Hint text */}
        <p className="mt-1.5 text-stone-600 text-[11px]">
          {claimed
            ? "Hoàn thành! Quay lại vào ngày mai để nhận thêm vé."
            : count >= REQUIRED
              ? "Đủ điều kiện — nhận vé ngay!"
              : `Còn ${remaining} chương nữa để mở khóa vé`}
        </p>
      </div>

      {/* Claim button + mobile badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => claimMutation.mutate()}
          disabled={claimed || count < REQUIRED || claimMutation.isPending}
          className={`flex-1 sm:flex-none sm:w-auto flex items-center justify-center gap-2
            px-4 py-2 sm:py-2.5 rounded-xl text-sm font-semibold transition-all
            ${
              claimed
                ? "bg-stone-800 text-stone-600 cursor-not-allowed border border-stone-700"
                : count >= REQUIRED
                  ? "bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20 active:scale-95"
                  : "bg-stone-800 text-stone-600 cursor-not-allowed border border-stone-700"
            }`}
        >
          {claimMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : claimed ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Đã nhận hôm nay
            </>
          ) : count >= REQUIRED ? (
            <>
              <Ticket className="w-4 h-4" />
              Nhận vé ngay
            </>
          ) : (
            <>
              <Ticket className="w-4 h-4" />
              Nhận vé ({count}/{REQUIRED})
            </>
          )}
        </button>

        {/* Mobile claimed badge */}
        {claimed && (
          <span className="sm:hidden flex items-center gap-1 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã nhận hôm nay
          </span>
        )}
      </div>
    </div>
  );
}
