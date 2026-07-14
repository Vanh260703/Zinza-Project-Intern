"use client";

import { useState } from "react";
import { useTopupUser } from "@/hooks/useAdmin";
import { Candy, CheckCircle, XCircle } from "lucide-react";

type User = { id: string; name: string; email: string; candy: number };
type Step = "input" | "confirm" | "loading" | "success" | "error";

type Props = {
  user: User;
  onClose: () => void;
  onSuccess: (newCandy: number) => void;
};

export default function TopupDialog({ user, onClose, onSuccess }: Props) {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [errMsg, setErrMsg] = useState("");

  const parsed = parseInt(amount, 10);
  const isValid = !isNaN(parsed) && parsed > 0;
  const after = user.candy + (isValid ? parsed : 0);

  const topupMutation = useTopupUser(user.id);

  const submit = () => {
    setStep("loading");
    topupMutation.mutate(
      { amount: parsed },
      {
        onSuccess: (data) => {
          setStep("success");
          onSuccess(data.candy);
        },
        onError: (e: Error) => {
          setErrMsg(e.message ?? "Lỗi kết nối, thử lại sau");
          setStep("error");
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={step === "loading" ? undefined : onClose}
      />
      <div className="relative bg-stone-900 border border-stone-700 rounded-2xl p-6 w-full max-w-sm shadow-xl shadow-black/50 flex flex-col gap-5">
        {step === "loading" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-8 h-8 border-2 border-stone-700 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-stone-400 text-sm">Đang xử lý...</p>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
            <div>
              <p className="text-white font-semibold text-lg">Nạp thành công!</p>
              <p className="text-stone-500 text-sm mt-1">
                <span className="text-stone-300">{user.name}</span> nhận{" "}
                <span className="text-amber-400 font-bold">+{parsed.toLocaleString()} kẹo</span>
              </p>
              <p className="text-stone-600 text-xs mt-1">
                Số dư mới: {user.candy.toLocaleString()} kẹo
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white transition-colors"
            >
              Đóng
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <XCircle className="w-12 h-12 text-red-400" strokeWidth={1.5} />
            <div>
              <p className="text-white font-semibold">Đã có lỗi xảy ra</p>
              <p className="text-stone-500 text-sm mt-1">{errMsg}</p>
            </div>
            <div className="flex gap-2 w-full">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-stone-700 text-stone-400 hover:bg-stone-800 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => setStep("input")}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {step === "input" && (
          <>
            <div>
              <p className="text-white font-semibold text-lg">Nạp kẹo</p>
              <p className="text-stone-500 text-sm mt-0.5">
                Cho <span className="text-stone-300 font-medium">{user.name}</span>
                <span className="text-stone-600 text-xs ml-1">({user.email})</span>
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-stone-400 text-xs font-medium">Số lượng kẹo</label>
              <div className="flex items-center gap-2 bg-stone-800 border border-stone-700 focus-within:border-amber-500/60 rounded-xl px-4 py-2.5 transition-colors">
                <Candy className="w-4 h-4 text-amber-400 shrink-0" />
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Nhập số kẹo..."
                  className="flex-1 bg-transparent text-stone-200 text-sm outline-none placeholder-stone-600"
                  autoFocus
                />
              </div>
              {amount !== "" && !isValid && (
                <p className="text-red-400 text-xs">Số lượng phải lớn hơn 0</p>
              )}
            </div>

            {isValid && (
              <div className="flex items-center justify-between text-sm px-1 text-stone-500">
                <span>Số dư hiện tại</span>
                <span className="text-stone-300">{user.candy.toLocaleString()} kẹo</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-stone-700 text-stone-300 hover:bg-stone-800 transition-colors"
              >
                Huỷ
              </button>
              <button
                disabled={!isValid}
                onClick={() => setStep("confirm")}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
              >
                Tiếp theo
              </button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <div>
              <p className="text-white font-semibold text-lg">Xác nhận nạp kẹo</p>
              <p className="text-stone-500 text-sm mt-0.5">Kiểm tra kỹ trước khi xác nhận</p>
            </div>

            <div className="flex flex-col gap-2.5 p-4 bg-stone-800/60 border border-stone-700 rounded-xl text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Người nhận</span>
                <span className="text-stone-200 font-medium">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Số kẹo nạp</span>
                <span className="text-amber-400 font-bold">+{parsed.toLocaleString()}</span>
              </div>
              <hr className="border-stone-700" />
              <div className="flex justify-between">
                <span className="text-stone-500">Trước</span>
                <span className="text-stone-400">{user.candy.toLocaleString()} kẹo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Sau</span>
                <span className="text-emerald-400 font-bold">{after.toLocaleString()} kẹo</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep("input")}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-stone-700 text-stone-300 hover:bg-stone-800 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={submit}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
