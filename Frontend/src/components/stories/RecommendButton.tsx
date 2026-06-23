"use client";

import { useState } from "react";
import { useNominateNovel } from "@/hooks/useNovels";
import { X, Ticket, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";

type Props = { storyId: string; postedBy: string };

export default function RecommendButton({ storyId, postedBy }: Props) {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const tickets = user?.recommendationTicket ?? 0;
  const hasTicket = tickets > 0;
  const isOwner = !!user && user.id === postedBy;

  const nominateMutation = useNominateNovel(storyId);

  return (
    <>
      <button
        onClick={() => {
          nominateMutation.reset();
          setOpen(true);
        }}
        disabled={isOwner}
        title={isOwner ? "Bạn không thể đề cử truyện của mình" : undefined}
        className="flex items-center gap-2 px-5 py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Ticket className="w-4 h-4 text-sky-400" />
        Đề cử
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) =>
            e.target === e.currentTarget && !nominateMutation.isPending && setOpen(false)
          }
        >
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-base">Đề cử truyện</h3>
              <button
                onClick={() => !nominateMutation.isPending && setOpen(false)}
                disabled={nominateMutation.isPending}
                className="text-stone-500 hover:text-white transition-colors disabled:opacity-40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!user ? (
              <p className="text-stone-400 text-sm text-center py-4">
                Bạn cần{" "}
                <a href="/auth/login" className="underline decoration-sky-400 underline-offset-4">
                  <span className="text-sky-400 font-semibold">đăng nhập</span>
                </a>{" "}
                để đề cử truyện.
              </p>
            ) : !hasTicket ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-14 h-14 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-stone-600" />
                </div>
                <div className="text-center">
                  <p className="text-stone-300 text-sm font-semibold">Không có vé đề cử</p>
                  <p className="text-stone-500 text-xs mt-1.5 leading-relaxed">
                    Vé đề cử được cấp khi bạn hoàn thành đọc 10 chapters mỗi ngày.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 py-3 bg-stone-950 rounded-xl border border-stone-800">
                  <span className="text-stone-400 text-sm">Vé tháng của bạn</span>
                  <span className="text-sky-400 font-bold flex items-center gap-1.5">
                    <Ticket className="w-4 h-4" />
                    {tickets.toLocaleString()}
                  </span>
                </div>

                <div className="px-4 py-3 bg-sky-950/40 border border-sky-900/50 rounded-xl">
                  <p className="text-sky-300/80 text-xs leading-relaxed">
                    Sử dụng <span className="text-sky-300 font-semibold">1 vé tháng</span> để đề cử
                    truyện này. Vé đề cử chỉ có hiệu lực trong tháng hiện tại.
                  </p>
                </div>

                <button
                  onClick={() =>
                    nominateMutation.mutate(undefined, { onSuccess: () => setOpen(false) })
                  }
                  disabled={nominateMutation.isPending}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-sky-900 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {nominateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" />
                      Dùng 1 vé để đề cử
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
