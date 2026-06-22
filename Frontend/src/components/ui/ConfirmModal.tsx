"use client";

import { TriangleAlert } from "lucide-react";

type Props = {
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export default function ConfirmModal({
  title,
  description,
  confirmLabel = "Xác nhận",
  onConfirm,
  onCancel,
  loading,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-stone-900 border border-stone-700 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-5 shadow-xl shadow-black/50">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <TriangleAlert className="w-5 h-5 text-red-400" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-white font-semibold">{title}</p>
            {description && <p className="text-stone-500 text-sm mt-1">{description}</p>}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white disabled:opacity-40 transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
          >
            {loading ? "Đang xóa..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
