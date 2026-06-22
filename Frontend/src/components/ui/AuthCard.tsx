import { BookOpen } from "lucide-react";
import { ReactNode } from "react";

type AuthCardProps = {
  children: ReactNode;
};

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20 mb-4">
            <BookOpen className="w-8 h-8 text-white" strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl font-bold text-white">TruyệnHay</h1>
          <p className="text-stone-500 text-sm mt-1">Kho truyện chữ hàng đầu Việt Nam</p>
        </div>

        {/* Card */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 px-8 py-8 shadow-2xl">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-stone-700 mt-6">
          © 2025 TruyệnHay. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </div>
  );
}
