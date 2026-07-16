"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Candy } from "lucide-react";
import { useResolveSuspense } from "@/hooks/useSuspense";
import type { SuspenseTransaction } from "@/types/suspense";

type Step = "input" | "loading" | "success" | "error";
type ResolveStatus = "resolved" | "accepted" | "refunded";

type Props = {
  suspense: SuspenseTransaction;
  onClose: () => void;
};

// missing_pair: hệ thống đã tự tính đúng số kẹo thiếu + biết sẵn người nhận
// lúc audit — gợi ý sẵn, admin không phải tự tra tay wallet_transactions.
function suggestedCredit(suspense: SuspenseTransaction) {
  if (suspense.reason !== "missing_pair") return null;
  return suspense.amountCandy !== null && suspense.amountCandy > 0
    ? suspense.amountCandy
    : null;
}

// balance_sum_mismatch/balance_chain_mismatch là lỗi ghi sổ (thiếu 1 dòng
// transaction hoặc snapshot before/after sai) — không phải "thiếu tiền cần
// bù". BE chặn hẳn credit cho 2 reason này nên FE cũng không hiện tuỳ chọn.
function isCreditBlocked(suspense: SuspenseTransaction) {
  return (
    suspense.reason === "balance_sum_mismatch" ||
    suspense.reason === "balance_chain_mismatch"
  );
}

const STATUS_OPTIONS: { value: ResolveStatus; label: string; activeCls: string }[] = [
  {
    value: "resolved",
    label: "Đã giải quyết",
    activeCls: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
  },
  {
    value: "accepted",
    label: "Chấp nhận",
    activeCls: "bg-stone-500/15 border-stone-500/40 text-stone-300",
  },
  {
    value: "refunded",
    label: "Đã hoàn tiền",
    activeCls: "bg-sky-500/15 border-sky-500/40 text-sky-300",
  },
];

export default function ResolveDialog({ suspense, onClose }: Props) {
  const suggested = suggestedCredit(suspense);
  const creditBlocked = isCreditBlocked(suspense);

  const [status, setStatus] = useState<ResolveStatus>("resolved");
  const [note, setNote] = useState("");
  const [withCredit, setWithCredit] = useState(suggested !== null);
  const [creditUserId, setCreditUserId] = useState(suspense.affectedUser?.id ?? "");
  const [creditAmount, setCreditAmount] = useState(suggested !== null ? String(suggested) : "");
  const [step, setStep] = useState<Step>("input");
  const [errMsg, setErrMsg] = useState("");

  const resolveMutation = useResolveSuspense();

  const parsedAmount = parseInt(creditAmount, 10);
  const creditValid = !withCredit || (!!creditUserId && !isNaN(parsedAmount) && parsedAmount > 0);
  const isValid = note.trim().length > 0 && creditValid;

  const submit = () => {
    setStep("loading");
    resolveMutation.mutate(
      {
        id: suspense.id,
        payload: {
          status,
          resolutionNote: note.trim(),
          ...(withCredit && !creditBlocked
            ? { creditUserId, creditAmount: parsedAmount }
            : {}),
        },
      },
      {
        onSuccess: () => setStep("success"),
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
      <div className="relative bg-stone-900 border border-stone-700 rounded-2xl p-6 w-full max-w-md shadow-xl shadow-black/50 flex flex-col gap-5">
        {step === "loading" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-8 h-8 border-2 border-stone-700 border-t-violet-500 rounded-full animate-spin" />
            <p className="text-stone-400 text-sm">Đang xử lý...</p>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
            <div>
              <p className="text-white font-semibold text-lg">Đã xử lý xong</p>
              <p className="text-stone-500 text-sm mt-1">
                Bản ghi được đánh dấu{" "}
                <span className="text-stone-300">
                  {STATUS_OPTIONS.find((o) => o.value === status)?.label}
                </span>
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
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-violet-500 hover:bg-violet-400 text-white transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {step === "input" && (
          <>
            <div>
              <p className="text-white font-semibold text-lg">Xử lý suspense</p>
              <p className="text-stone-500 text-sm mt-0.5">
                {suspense.transferContent || suspense.affectedUser?.email || suspense.caseKey}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-stone-400 text-xs font-medium">Kết quả</label>
              <div className="grid grid-cols-3 gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatus(opt.value)}
                    className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                      status === opt.value
                        ? opt.activeCls
                        : "border-stone-700 text-stone-400 hover:bg-stone-800"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-stone-400 text-xs font-medium">Ghi chú xử lý</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Vd: đã xác định đúng chủ, đã chuyển khoản hoàn tiền tay..."
                className="bg-stone-800 border border-stone-700 focus:border-violet-500/60 rounded-xl px-3 py-2.5 text-sm text-stone-200 placeholder-stone-600 outline-none transition-colors resize-none"
              />
            </div>

            {creditBlocked ? (
              <p className="text-stone-600 text-[11px] bg-stone-800/60 border border-stone-700 rounded-xl px-3 py-2.5">
                Lỗi ghi sổ (thiếu dòng giao dịch / snapshot số dư sai) — không cộng bù kẹo qua
                đây. Nếu cần sửa, phải chỉnh trực tiếp dữ liệu ví/giao dịch ngoài hệ thống.
              </p>
            ) : (
              <>
                <label
                  className={`flex items-center gap-2 text-sm text-stone-300 select-none ${suggested !== null ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                >
                  <input
                    type="checkbox"
                    checked={withCredit}
                    disabled={suggested !== null}
                    onChange={(e) => setWithCredit(e.target.checked)}
                    className="accent-violet-500"
                  />
                  Cộng bù kẹo cho người dùng
                </label>

                {withCredit && (
                  <div className="flex flex-col gap-3 p-3 bg-stone-800/60 border border-stone-700 rounded-xl">
                    {suggested !== null && (
                      <p className="text-stone-500 text-[11px]">
                        Hệ thống đã xác định chính xác người nhận và số kẹo từ chênh lệch
                        GIFT/EARN — không thể chỉnh sửa.
                      </p>
                    )}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-stone-400 text-xs font-medium">User ID</label>
                      <input
                        value={creditUserId}
                        onChange={(e) => setCreditUserId(e.target.value)}
                        readOnly={suggested !== null}
                        placeholder="UUID người nhận"
                        className="bg-stone-900 border border-stone-700 focus:border-violet-500/60 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder-stone-600 outline-none transition-colors read-only:opacity-60 read-only:cursor-not-allowed"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-stone-400 text-xs font-medium">Số kẹo cộng</label>
                      <div className="flex items-center gap-2 bg-stone-900 border border-stone-700 focus-within:border-violet-500/60 rounded-lg px-3 py-2 transition-colors has-[input:read-only]:opacity-60">
                        <Candy className="w-4 h-4 text-amber-400 shrink-0" />
                        <input
                          type="number"
                          min={1}
                          value={creditAmount}
                          onChange={(e) => setCreditAmount(e.target.value)}
                          readOnly={suggested !== null}
                          placeholder="0"
                          className="flex-1 bg-transparent text-stone-200 text-sm outline-none read-only:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
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
                onClick={submit}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-violet-500 hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
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
