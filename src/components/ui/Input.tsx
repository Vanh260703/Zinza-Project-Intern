"use client";

import { forwardRef, InputHTMLAttributes, ReactNode, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  labelRight?: ReactNode;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, labelRight, id, type, className, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="text-sm font-medium text-stone-300">
            {label}
          </label>
          {labelRight}
        </div>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={`w-full px-4 py-2.5 rounded-xl border bg-stone-800 text-stone-200 text-sm outline-none transition-all
              placeholder:text-stone-500
              ${isPassword ? "pr-11" : ""}
              ${error
                ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              }
              disabled:opacity-50 disabled:cursor-not-allowed ${className ?? ""}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
            >
              {showPassword
                ? <EyeOff className="w-5 h-5" strokeWidth={1.8} />
                : <Eye className="w-5 h-5" strokeWidth={1.8} />}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
