"use client";

import { useState } from "react";
import { ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import { useSuspenseTransactions } from "@/hooks/useSuspense";
import type { SuspenseReason, SuspenseStatus, SuspenseTransaction } from "@/types/suspense";
import ResolveDialog from "./ResolveDialog";

const STATUS_OPTIONS: { value: SuspenseStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "unresolved", label: "Chưa xử lý" },
  { value: "resolved", label: "Đã giải quyết" },
  { value: "accepted", label: "Đã chấp nhận" },
  { value: "refunded", label: "Đã hoàn tiền" },
];

const REASON_OPTIONS: { value: SuspenseReason | "all"; label: string }[] = [
  { value: "all", label: "Tất cả lý do" },
  { value: "missing_pair", label: "Thiếu cặp GIFT/EARN" },
  { value: "balance_sum_mismatch", label: "Lệch tổng ví" },
  { value: "balance_chain_mismatch", label: "Đứt chuỗi số dư" },
  { value: "no_order_code", label: "Không có mã đơn" },
  { value: "order_not_found", label: "Không tìm thấy đơn" },
  { value: "order_not_pending", label: "Đơn không còn chờ xử lý" },
  { value: "amount_mismatch", label: "Sai số tiền" },
  { value: "order_expired", label: "Đơn hết hạn" },
  { value: "processing_error", label: "Lỗi xử lý webhook" },
];

const REASON_LABELS: Record<SuspenseReason, string> = Object.fromEntries(
  REASON_OPTIONS.filter((o) => o.value !== "all").map((o) => [o.value, o.label])
) as Record<SuspenseReason, string>;

const STATUS_CLS: Record<SuspenseStatus, string> = {
  unresolved: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  resolved: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  accepted: "text-stone-400 bg-stone-500/10 border-stone-500/20",
  refunded: "text-sky-400 bg-sky-500/10 border-sky-500/20",
};

const STATUS_TEXT: Record<SuspenseStatus, string> = {
  unresolved: "Chưa xử lý",
  resolved: "Đã giải quyết",
  accepted: "Đã chấp nhận",
  refunded: "Đã hoàn tiền",
};

const PAGE_SIZE = 15;

function AmountCell({ item }: { item: SuspenseTransaction }) {
  if (item.amountVnd != null)
    return <span className="text-stone-300">{item.amountVnd.toLocaleString()}đ</span>;
  if (item.amountCandy != null)
    return (
      <span className={item.amountCandy >= 0 ? "text-emerald-400" : "text-red-400"}>
        {item.amountCandy >= 0 ? "+" : ""}
        {item.amountCandy.toLocaleString()} kẹo
      </span>
    );
  return <span className="text-stone-700">—</span>;
}

export default function SuspenseTable() {
  const [status, setStatus] = useState<SuspenseStatus | "all">("unresolved");
  const [reason, setReason] = useState<SuspenseReason | "all">("all");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<SuspenseTransaction | null>(null);

  const { data, isLoading } = useSuspenseTransactions({
    status: status !== "all" ? status : undefined,
    reason: reason !== "all" ? reason : undefined,
    page,
    limit: PAGE_SIZE,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-4">
      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setStatus(opt.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                status === opt.value
                  ? "bg-violet-500/15 border-violet-500/40 text-violet-300"
                  : "border-stone-700 text-stone-400 hover:bg-stone-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <select
          value={reason}
          onChange={(e) => {
            setReason(e.target.value as SuspenseReason | "all");
            setPage(1);
          }}
          className="bg-stone-800 border border-stone-700 text-stone-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-violet-500/60 transition-colors"
        >
          {REASON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-stone-600 text-xs">{(meta?.total ?? 0).toLocaleString()} bản ghi</p>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-stone-700 border-t-violet-500 rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-xl flex flex-col items-center py-16 gap-3 text-stone-600">
          <ShieldAlert className="w-10 h-10" strokeWidth={1.5} />
          <p className="text-sm font-medium text-stone-500">Không có bản ghi nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-800">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-stone-900/80 border-b border-stone-800">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  Lý do
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  Liên quan
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  Số tiền / kẹo
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  Lần đầu / gần nhất
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/50">
              {items.map((item) => (
                <tr key={item.id} className="bg-stone-900/40 hover:bg-stone-800/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="text-stone-200 font-medium">{REASON_LABELS[item.reason]}</p>
                    {item.transferContent && (
                      <p className="text-stone-600 text-xs mt-0.5 max-w-[220px] truncate">
                        {item.transferContent}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold ${STATUS_CLS[item.status]}`}
                    >
                      {STATUS_TEXT[item.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-stone-400 text-xs">
                    {item.affectedUser ? (
                      <>
                        <p className="text-stone-300">{item.affectedUser.name}</p>
                        <p className="text-stone-600">{item.affectedUser.email}</p>
                      </>
                    ) : (
                      <span className="text-stone-700">Chưa xác định</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-medium">
                    <AmountCell item={item} />
                  </td>
                  <td className="px-4 py-3.5 text-stone-600 text-xs">
                    <p>{new Date(item.createdAt).toLocaleDateString("vi-VN")}</p>
                    {item.lastSeenAt !== item.createdAt && (
                      <p className="text-stone-700">
                        gần nhất: {new Date(item.lastSeenAt).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {item.status === "unresolved" ? (
                      <button
                        onClick={() => setTarget(item)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-500/15 border border-violet-500/30 text-violet-300 hover:bg-violet-500/25 transition-colors"
                      >
                        Xử lý
                      </button>
                    ) : (
                      <span className="text-stone-700 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-stone-600 text-xs">
            Trang {meta.page} / {meta.totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.page === 1}
              className="p-1.5 rounded-lg border border-stone-800 text-stone-400 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={meta.page === meta.totalPages}
              className="p-1.5 rounded-lg border border-stone-800 text-stone-400 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {target && <ResolveDialog suspense={target} onClose={() => setTarget(null)} />}
    </div>
  );
}
