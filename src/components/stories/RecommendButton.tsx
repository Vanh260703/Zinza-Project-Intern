"use client";

import { useState } from "react";
import { X, Ticket, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

type Props = { storyId: string };

export default function RecommendButton({ storyId }: Props) {
  const { user, token, setUser } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const tickets = user?.recommendationTickets ?? 0;
  const hasTicket = tickets > 0;

  const handleConfirm = async () => {
    if (!user || !token || !hasTicket || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/novels/${storyId}/nominate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast.error(data.message ?? "Đề cử thất bại");
        return;
      }
      setUser(data.user, token);
      setOpen(false);
      showToast.success("Đề cử thành công! 🎫", `Bạn còn ${data.user.recommendationTickets} vé`);
      router.refresh();
    } catch {
      showToast.error("Không thể kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 text-sm font-semibold rounded-xl transition-colors"
      >
        <Ticket className="w-4 h-4 text-sky-400" />
        Đề cử
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && !loading && setOpen(false)}
        >
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-base">Đề cử truyện</h3>
              <button
                onClick={() => !loading && setOpen(false)}
                disabled={loading}
                className="text-stone-500 hover:text-white transition-colors disabled:opacity-40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!user ? (
              <p className="text-stone-400 text-sm text-center py-4">
                Bạn cần <a href="/auth/login" className="underline decoration-sky-400 underline-offset-4"><span className="text-sky-400 font-semibold">đăng nhập</span></a> để đề cử
                truyện.
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
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-sky-900 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
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
