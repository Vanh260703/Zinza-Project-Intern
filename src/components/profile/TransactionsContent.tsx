"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CreditCard, Filter, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";
import { PAYMENT_PACKAGES } from "@/config/payment";
import type { PaymentStatus } from "@/types/payment";
import paymentsData from "@/lib/data/payments.json";
import type { Payment } from "@/types/payment";

const MOCK_PAYMENTS = paymentsData as Payment[];

const FILTER_OPTIONS = [
  { value: "all", label: "Tất cả loại" },
  { value: "topup", label: "Nạp kẹo" },
  { value: "unlock", label: "Mở khóa chương" },
  { value: "gift", label: "Tặng quà" },
];

type Transaction = {
  id: string;
  type: "topup" | "unlock" | "gift";
  amount: number;       // kẹo (+/-)
  description: string;
  createdAt: string;
  status?: PaymentStatus;
};

const STATUS_CONFIG = {
  completed: { label: "Thành công", icon: CheckCircle2, cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  pending:   { label: "Đang chờ",   icon: Clock,         cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  failed:    { label: "Thất bại",   icon: XCircle,       cls: "text-red-400 bg-red-500/10 border-red-500/20" },
} as const;

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default function TransactionsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);

  const [filter, setFilter] = useState(searchParams.get("type") ?? "all");
  const [fromDate, setFromDate] = useState(searchParams.get("from") ?? "");
  const [toDate, setToDate] = useState(searchParams.get("to") ?? "");
  const [open, setOpen] = useState(false);

  const syncParams = (type: string, from: string, to: string) => {
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  // Map MOCK_PAYMENTS → Transaction[]
  const allTransactions = useMemo((): Transaction[] => {
    return MOCK_PAYMENTS.filter((p) => p.userId === user?.id).map((p) => {
      const pkg = PAYMENT_PACKAGES.find((x) => x.id === p.packageId);
      return {
        id: p.id,
        type: "topup" as const,
        amount: p.candyReceived,
        description: `Nạp kẹo${pkg ? ` — ${formatVND(p.amount)}` : ""}`,
        createdAt: p.createdAt,
        status: p.status,
      };
    });
  }, [user?.id]);

  const filtered = useMemo(() => {
    const transactions = allTransactions;
    return transactions.filter((t) => {
      if (filter !== "all" && t.type !== filter) return false;
      if (fromDate && t.createdAt < fromDate) return false;
      if (toDate && t.createdAt > toDate) return false;
      return true;
    });
  }, [filter, fromDate, toDate]);

  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  const selectedLabel = FILTER_OPTIONS.find((o) => o.value === filter)?.label ?? "Tất cả loại";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
        <div>
          <h2 className="text-white font-bold text-xl flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            Lịch sử giao dịch
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Theo dõi kẹo vào/ra, tặng quà và mở khóa chương.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Type dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 bg-stone-800 border border-stone-700 text-stone-300 text-sm rounded-xl px-3 py-2 outline-none hover:border-stone-600 transition-colors min-w-37.5 justify-between"
            >
              <span>{selectedLabel}</span>
              <svg
                className="w-4 h-4 text-stone-500 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 mt-1 w-48 bg-stone-800 border border-stone-700 rounded-xl overflow-hidden shadow-xl z-10">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setFilter(opt.value);
                      setOpen(false);
                      syncParams(opt.value, fromDate, toDate);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                      filter === opt.value
                        ? "text-amber-400 bg-amber-500/10"
                        : "text-stone-300 hover:bg-stone-700"
                    }`}
                  >
                    {opt.label}
                    {filter === opt.value && (
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date range */}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              syncParams(filter, e.target.value, toDate);
            }}
            className="bg-stone-800 border border-stone-700 text-stone-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-amber-500/60 transition-colors"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              syncParams(filter, fromDate, e.target.value);
            }}
            className="bg-stone-800 border border-stone-700 text-stone-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-amber-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Summary card */}
      <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl flex flex-col gap-1">
        <p className="text-stone-600 text-[10px] font-semibold tracking-wider">
          TỔNG KẸO ĐÃ GIAO DỊCH TRONG RANGE
        </p>
        <p className="text-2xl font-bold text-amber-400">{total.toLocaleString()}</p>
      </div>

      {/* Empty state / table */}
      {filtered.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-xl flex flex-col items-center py-16 gap-3 text-stone-600">
          <Filter className="w-10 h-10" strokeWidth={1.5} />
          <div className="text-center">
            <p className="text-sm font-medium text-stone-500">Không có giao dịch</p>
            <p className="text-sm mt-0.5">Thử đổi bộ lọc hoặc dải ngày.</p>
          </div>
        </div>
      ) : (
        <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-800">
                <th className="px-4 py-3 text-[10px] font-semibold tracking-wider text-stone-500 text-left">
                  LOẠI
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-wider text-stone-500 text-left">
                  MÔ TẢ
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-wider text-stone-500 text-center">
                  SỐ KẸO
                </th>
                <th className="hidden sm:table-cell px-4 py-3 text-[10px] font-semibold tracking-wider text-stone-500 text-center">
                  TRẠNG THÁI
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-wider text-stone-500 text-right">
                  NGÀY
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-stone-800/60 last:border-0 hover:bg-stone-800/30 transition-colors"
                >
                  <td className="px-4 py-3.5 text-stone-300 text-sm">
                    {FILTER_OPTIONS.find((o) => o.value === t.type)?.label ?? t.type}
                  </td>
                  <td className="px-4 py-3.5 text-stone-500 text-sm">{t.description}</td>
                  <td
                    className={`px-4 py-3.5 text-sm text-center font-medium ${t.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {t.amount >= 0 ? "+" : ""}
                    {t.amount.toLocaleString()}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3.5 text-center">
                    {t.status && (() => {
                      const s = STATUS_CONFIG[t.status];
                      const Icon = s.icon;
                      return (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>
                          <Icon className="w-3 h-3" />
                          {s.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3.5 text-stone-500 text-sm text-right">
                    {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
