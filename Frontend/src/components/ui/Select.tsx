import { forwardRef, SelectHTMLAttributes } from "react";

type Option = { readonly label: string; readonly value: string };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: readonly Option[];
  error?: string;
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, id, ...props }, ref) => {
    const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-medium text-stone-300">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={`w-full px-4 py-2.5 rounded-xl border bg-stone-800 text-stone-200 text-sm outline-none transition-all
            ${
              error
                ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            }
            disabled:opacity-50 disabled:cursor-not-allowed`}
          {...props}
        >
          <option value="" className="bg-stone-900">
            -- Chọn --
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-stone-900">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
