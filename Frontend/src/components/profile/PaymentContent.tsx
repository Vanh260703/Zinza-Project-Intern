"use client";

import { useEffect, useState } from "react";
import { Candy, CheckCircle2, Zap, Copy, Check, Info, XCircle, Clock } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";
import { useCreatePaymentOrder, usePaymentOrderStatus } from "@/hooks/usePaymentOrder";
import { BANK_CONFIG } from "@/config/payment";
import type { CandyPackage } from "@/types/payment";

type Props = {
  packages: CandyPackage[];
};

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

function useCountdown(targetIso: string) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    const target = new Date(targetIso).getTime();
    const tick = () => setRemainingMs(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return remainingMs;
}

function formatCountdown(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-stone-800 last:border-0">
      <span className="text-stone-500 text-xs shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-stone-200 text-sm font-medium truncate">{value}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 p-1 rounded-md text-stone-500 hover:text-white hover:bg-stone-700 transition-colors"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

// Đơn đang chờ thanh toán — poll trạng thái, đếm ngược hết hạn
function PendingOrder({
  orderId,
  orderCode,
  amountVnd,
  qrUrl,
  expiredAt,
  onDone,
}: {
  orderId: string;
  orderCode: string;
  amountVnd: number;
  qrUrl: string;
  expiredAt: string;
  onDone: (candyAmount: number) => void;
}) {
  const { data: order } = usePaymentOrderStatus(orderId);
  const remainingMs = useCountdown(expiredAt);
  const [creditedOrderId, setCreditedOrderId] = useState<string | null>(null);

  const clientExpired = remainingMs <= 0;
  const status = order?.status ?? "pending";

  useEffect(() => {
    if (status === "completed" && creditedOrderId !== orderId && order) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCreditedOrderId(orderId);
      onDone(order.candyAmount);
    }
  }, [status, orderId, creditedOrderId, order, onDone]);

  if (status === "completed" && order) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
        <div>
          <p className="text-white font-semibold text-lg">Nạp kẹo thành công!</p>
          <p className="text-stone-500 text-sm mt-1">
            +{order.candyAmount.toLocaleString()} kẹo đã được cộng vào ví
          </p>
        </div>
      </div>
    );
  }

  if (status === "failed" || status === "expired" || clientExpired) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <XCircle className="w-12 h-12 text-red-400" strokeWidth={1.5} />
        <div>
          <p className="text-white font-semibold text-lg">
            {status === "failed" ? "Giao dịch thất bại" : "Đơn đã hết hạn"}
          </p>
          <p className="text-stone-500 text-sm mt-1">Vui lòng tạo đơn nạp mới.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-5 bg-stone-800/40 border border-stone-700 rounded-2xl">
      <div className="flex items-center justify-between">
        <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest">
          Quét mã để chuyển khoản
        </p>
        <span className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          {formatCountdown(remainingMs)}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="shrink-0 mx-auto sm:mx-0 flex flex-col items-center gap-2">
          <div className="w-40 h-40 rounded-xl overflow-hidden bg-white p-2 shadow-lg shadow-black/40">
            <img src={qrUrl} alt="QR chuyển khoản" className="w-full h-full object-contain" />
          </div>
          <p className="text-stone-500 text-[11px]">Quét bằng app ngân hàng</p>
        </div>
        <div className="flex-1 w-full flex flex-col">
          <CopyField label="Ngân hàng" value={BANK_CONFIG.name} />
          <CopyField label="Số tài khoản" value={BANK_CONFIG.accountNo} />
          <CopyField label="Tên tài khoản" value={BANK_CONFIG.accountName} />
          <CopyField label="Số tiền" value={formatVND(amountVnd)} />
          <CopyField label="Nội dung CK" value={orderCode} />
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-start gap-2 text-amber-400/80 text-xs">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            Nhập <span className="font-semibold text-amber-400">đúng nội dung chuyển khoản</span>{" "}
            để hệ thống tự động xác nhận.
          </span>
        </div>
        <div className="flex items-start gap-2 text-stone-500 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
          <span>Kẹo sẽ được cộng tự động sau 1–2 phút khi nhận được giao dịch.</span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentContent({ packages }: Props) {
  const wallet = useAuthStore((s) => s.wallet);
  const updateBalance = useAuthStore((s) => s.updateBalance);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [activeOrder, setActiveOrder] = useState<{
    orderId: string;
    orderCode: string;
    amountVnd: number;
    qrUrl: string;
    expiredAt: string;
  } | null>(null);

  const createOrder = useCreatePaymentOrder();
  const pkg = packages.find((p) => p.id === selectedId) ?? null;

  const handleSelectPackage = (id: string) => {
    setSelectedId(id);
    setConfirming(true);
    setActiveOrder(null);
  };

  const handleConfirmOrder = () => {
    if (!pkg) return;
    createOrder.mutate(pkg.id, {
      onSuccess: (order) => {
        setConfirming(false);
        setActiveOrder(order);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header + balance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white font-bold text-xl flex items-center gap-2">
            <Candy className="w-5 h-5 text-amber-400" />
            Nạp kẹo
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Chuyển khoản ngân hàng — tự động xác nhận qua SePay.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl shrink-0">
          <span className="text-stone-400 text-sm">Số dư hiện tại</span>
          <span className="text-amber-400 font-bold text-sm">
            🍬 {(wallet?.balance ?? 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Package grid */}
      <div>
        <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-3">
          Chọn gói nạp
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {packages.map((p) => {
            const isSelected = selectedId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPackage(p.id)}
                className={`relative flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/40"
                    : "bg-stone-800/50 border-stone-700 hover:border-stone-600 hover:bg-stone-800"
                }`}
              >
                {p.badge && (
                  <span
                    className={`absolute -top-2 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.badge === "Giá trị nhất"
                        ? "bg-emerald-500 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {p.badge}
                  </span>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🍬</span>
                  <span
                    className={`text-lg font-black ${isSelected ? "text-amber-400" : "text-white"}`}
                  >
                    {p.candy.toLocaleString()}
                  </span>
                </div>
                {p.bonus > 0 ? (
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                    <Zap className="w-3 h-3" />+{p.bonus.toLocaleString()} bonus
                  </div>
                ) : (
                  <div className="h-4" />
                )}
                <p
                  className={`text-sm font-semibold mt-0.5 ${isSelected ? "text-amber-300" : "text-stone-400"}`}
                >
                  {formatVND(p.price)}
                </p>
                {isSelected && (
                  <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirm step — chưa tạo đơn thật, tránh rác payment_orders khi user chỉ bấm thử */}
      {confirming && pkg && (
        <div className="flex flex-col gap-4 p-5 bg-stone-800/40 border border-stone-700 rounded-2xl">
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest">
            Xác nhận tạo đơn nạp
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500">Gói</span>
            <span className="text-white font-semibold">🍬 {pkg.candy.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500">Số tiền</span>
            <span className="text-amber-400 font-bold">{formatVND(pkg.price)}</span>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-stone-700 text-stone-300 hover:bg-stone-800 transition-colors"
            >
              Huỷ
            </button>
            <button
              type="button"
              disabled={createOrder.isPending}
              onClick={handleConfirmOrder}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white transition-colors"
            >
              {createOrder.isPending ? "Đang tạo đơn..." : "Tạo đơn nạp"}
            </button>
          </div>
        </div>
      )}

      {/* Đơn đã tạo — QR thật + polling */}
      {activeOrder && <PendingOrder {...activeOrder} onDone={(candyAmount) => updateBalance(candyAmount)} />}

      {!confirming && !activeOrder && (
        <p className="text-stone-600 text-sm italic text-center py-2">
          ← Chọn một gói để bắt đầu nạp kẹo
        </p>
      )}
    </div>
  );
}
