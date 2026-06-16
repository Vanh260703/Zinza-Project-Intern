"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

const PRESETS = [50, 100, 200, 500];

export default function CandyButton() {
  const { user, wallet, updateBalance } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState("");

  const amount = custom !== "" ? parseInt(custom) || 0 : selected;

  const handleOpen = () => {
    setSelected(null);
    setCustom("");
    setOpen(true);
  };

  const balance = wallet?.balance ?? 0;

  const handleConfirm = () => {
    if (!amount || amount <= 0 || !user) return;
    if (balance < amount) return;
    updateBalance(-amount);
    setOpen(false);
    showToast.success(
      `Đã tặng ${amount} kẹo! 🍬`,
      `Bạn còn ${(balance - amount).toLocaleString()} kẹo`
    );
    router.refresh();
  };

  const notEnough = amount !== null && amount > 0 && user !== null && balance < amount;

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-5 py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 hover:border-stone-600 text-stone-300 hover:text-white text-sm font-semibold rounded-xl transition-colors"
      >
        <span>🍬</span>
        Tặng kẹo
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col gap-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-base">Tặng kẹo cho tác giả</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-stone-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!user ? (
              <p className="text-stone-400 text-sm text-center py-4">
                Bạn cần <a href="/auth/login" className="underline decoration-amber-400 underline-offset-4"><span className="text-amber-400 font-semibol">đăng nhập</span></a> để tặng kẹo.
              </p>
            ) : (
              <>
                {/* Balance */}
                <div className="flex items-center justify-between px-4 py-3 bg-stone-950 rounded-xl border border-stone-800">
                  <span className="text-stone-400 text-sm">Kẹo của bạn</span>
                  <span className="text-amber-400 font-bold">🍬 {balance.toLocaleString()}</span>
                </div>

                {/* Presets */}
                <div>
                  <p className="text-stone-500 text-xs mb-2">Chọn số kẹo muốn tặng</p>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESETS.map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          setSelected(n);
                          setCustom("");
                        }}
                        className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                          selected === n && custom === ""
                            ? "bg-amber-500 border-amber-400 text-white"
                            : "bg-stone-800 border-stone-700 text-stone-300 hover:border-stone-500 hover:text-white"
                        }`}
                      >
                        🍬 {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom input */}
                <div>
                  <p className="text-stone-500 text-xs mb-2">Hoặc nhập số lượng</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🍬</span>
                    <input
                      type="number"
                      min={1}
                      value={custom}
                      onChange={(e) => {
                        setCustom(e.target.value);
                        setSelected(null);
                      }}
                      placeholder="Nhập số kẹo..."
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 placeholder-stone-600 text-sm focus:outline-none focus:border-stone-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                {notEnough && (
                  <p className="text-red-400 text-xs text-center -mt-2">Bạn không đủ kẹo</p>
                )}

                {/* Confirm */}
                <button
                  onClick={handleConfirm}
                  disabled={!amount || amount <= 0 || !!notEnough}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
                >
                  {amount && amount > 0 ? `Tặng ${amount} kẹo` : "Chọn số kẹo"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
