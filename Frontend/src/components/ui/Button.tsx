import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export default function Button({ loading, children, disabled, className, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600
        disabled:bg-amber-500/50 disabled:cursor-not-allowed
        text-white font-semibold py-2.5 rounded-xl transition-all
        flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 ${className ?? ""}`}
      {...props}
    >
      {loading ? "Đang xử lý..." : children}
    </button>
  );
}
