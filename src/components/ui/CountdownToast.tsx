"use client";

import { CheckCircle, XCircle } from "lucide-react";

type Props = {
  type: "success" | "error";
  title: string;
  description?: string;
  duration?: number; // ms — phải khớp với duration truyền vào toast.custom
};

export default function CountdownToast({ type, title, description, duration = 4000 }: Props) {
  const isSuccess = type === "success";

  return (
    <div className="w-[320px] rounded-xl border border-zinc-700 bg-[#1a1927] px-4 pt-4 pb-3 shadow-2xl shadow-black/50">
      {/* Icon + text */}
      <div className="flex items-start gap-3">
        {isSuccess
          ? <CheckCircle size={18} className="mt-0.5 shrink-0 text-amber-400" />
          : <XCircle    size={18} className="mt-0.5 shrink-0 text-red-400" />
        }
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-semibold text-zinc-100">{title}</p>
          {description && (
            <p className="text-xs text-zinc-400">{description}</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-px w-full overflow-hidden rounded-full bg-zinc-700/60">
        <div
          className={`h-full origin-left rounded-full ${isSuccess ? "bg-amber-400" : "bg-red-400"}`}
          style={{
            animation: `toast-progress ${duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}
