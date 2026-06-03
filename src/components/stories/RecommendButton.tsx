"use client";

import { useState } from "react";
import { X, Ticket } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

export default function RecommendButton() {
  const { user, token, setUser } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const tickets = user?.monthlyRecommendationTicket ?? 0;
  const hasTicket = tickets > 0;

  const handleConfirm = () => {
    if (!user || !token || !hasTicket) return;
    setUser({ ...user, monthlyRecommendationTicket: tickets - 1 }, token);
    setOpen(false);
    showToast.success("Đề cử thành công! 🎫", `Bạn còn ${tickets - 1} vé tháng`);
    router.refresh();
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
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-base">Đề cử truyện</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-stone-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!user ? (
              <p className="text-stone-400 text-sm text-center py-4">
                Bạn cần <span className="text-sky-400 font-semibold">đăng nhập</span> để đề cử
                truyện.
              </p>
            ) : !hasTicket ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-14 h-14 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-stone-600" />
                </div>
                <div className="text-center">
                  <p className="text-stone-300 text-sm font-semibold">Không có vé tháng</p>
                  <p className="text-stone-500 text-xs mt-1.5 leading-relaxed">
                    Bạn không có vé tháng để thực hiện đề cử.
                    <br />
                    Vé tháng được cấp mới vào đầu mỗi tháng.
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
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  Dùng 1 vé để đề cử
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
