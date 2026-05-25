"use client";

import { useState } from "react";
import { Candy, CheckCircle2, Zap, Copy, Check, Info } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";

type Package = {
  id: string;
  price: number;
  candy: number;
  bonus: number;
  badge?: string;
};

const PACKAGES: Package[] = [
  { id: "p1", price: 20_000,    candy: 200,    bonus: 0     },
  { id: "p2", price: 50_000,    candy: 550,    bonus: 50    },
  { id: "p3", price: 100_000,   candy: 1_200,  bonus: 200,  badge: "Phổ biến"     },
  { id: "p4", price: 200_000,   candy: 2_600,  bonus: 600   },
  { id: "p5", price: 500_000,   candy: 7_000,  bonus: 2_000, badge: "Giá trị nhất" },
  { id: "p6", price: 1_000_000, candy: 15_000, bonus: 5_000 },
];

const BANK_NAME    = "MB Bank";
const BANK_CODE    = "MB";
const ACCOUNT_NO   = "0123456789";
const ACCOUNT_NAME = "ZINZA PLATFORM";

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
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
          {copied
            ? <Check className="w-3.5 h-3.5 text-emerald-400" />
            : <Copy className="w-3.5 h-3.5" />
          }
        </button>
      </div>
    </div>
  );
}

function QRPlaceholder({ amount, content }: { amount: number; content: string }) {
  // Mock QR via VietQR public format — placeholder visual only
  const qrUrl = `https://img.vietqr.io/image/${BANK_CODE}-${ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-40 h-40 rounded-xl overflow-hidden bg-white p-2 shadow-lg shadow-black/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrUrl}
          alt="QR chuyển khoản"
          className="w-full h-full object-contain"
        />
      </div>
      <p className="text-stone-500 text-[11px]">Quét bằng app ngân hàng</p>
    </div>
  );
}

export default function PaymentContent() {
  const user = useAuthStore((s) => s.user);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);

  const pkg = PACKAGES.find((p) => p.id === selectedPkg) ?? null;

  // Transfer note SePay dùng để auto-match giao dịch
  const transferContent = pkg && user
    ? `NAPKEO ${user.id.slice(0, 8).toUpperCase()} ${pkg.id.toUpperCase()}`
    : "";

  return (
    <div className="flex flex-col gap-6">
      {/* Header + balance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white font-bold text-xl flex items-center gap-2">
            <Candy className="w-5 h-5 text-amber-400" />
            Nạp kẹo
          </h2>
          <p className="text-stone-500 text-sm mt-1">Chuyển khoản ngân hàng — tự động xác nhận qua SePay.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl shrink-0">
          <span className="text-stone-400 text-sm">Số dư hiện tại</span>
          <span className="text-amber-400 font-bold text-sm">
            🍬 {(user?.candy ?? 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Package grid */}
      <div>
        <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-3">Chọn gói nạp</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PACKAGES.map((p) => {
            const isSelected = selectedPkg === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPkg(p.id)}
                className={`relative flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/40"
                    : "bg-stone-800/50 border-stone-700 hover:border-stone-600 hover:bg-stone-800"
                }`}
              >
                {p.badge && (
                  <span className={`absolute -top-2 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.badge === "Giá trị nhất" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                  }`}>
                    {p.badge}
                  </span>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🍬</span>
                  <span className={`text-lg font-black ${isSelected ? "text-amber-400" : "text-white"}`}>
                    {p.candy.toLocaleString()}
                  </span>
                </div>
                {p.bonus > 0 ? (
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                    <Zap className="w-3 h-3" />
                    +{p.bonus.toLocaleString()} bonus
                  </div>
                ) : (
                  <div className="h-4" />
                )}
                <p className={`text-sm font-semibold mt-0.5 ${isSelected ? "text-amber-300" : "text-stone-400"}`}>
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

      {/* Transfer info — chỉ hiện sau khi chọn gói */}
      {pkg && (
        <div className="flex flex-col gap-4 p-5 bg-stone-800/40 border border-stone-700 rounded-2xl">
          <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest">Thông tin chuyển khoản</p>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* QR Code */}
            <div className="shrink-0 mx-auto sm:mx-0">
              <QRPlaceholder amount={pkg.price} content={transferContent} />
            </div>

            {/* Bank fields */}
            <div className="flex-1 w-full flex flex-col">
              <CopyField label="Ngân hàng"  value={BANK_NAME}    />
              <CopyField label="Số tài khoản" value={ACCOUNT_NO}  />
              <CopyField label="Tên tài khoản" value={ACCOUNT_NAME} />
              <CopyField label="Số tiền"    value={formatVND(pkg.price)} />
              <CopyField label="Nội dung CK" value={transferContent} />
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-start gap-2 text-amber-400/80 text-xs">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Nhập <span className="font-semibold text-amber-400">đúng nội dung chuyển khoản</span> để hệ thống tự động xác nhận.</span>
            </div>
            <div className="flex items-start gap-2 text-stone-500 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
              <span>Kẹo sẽ được cộng tự động sau 1–2 phút khi nhận được giao dịch.</span>
            </div>
          </div>
        </div>
      )}

      {!pkg && (
        <p className="text-stone-600 text-sm italic text-center py-2">
          ← Chọn một gói để xem thông tin chuyển khoản
        </p>
      )}
    </div>
  );
}
