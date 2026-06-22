import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-stone-800 mt-8">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" strokeWidth={1.8} />
          </div>
          <span className="text-stone-400 text-sm">© 2025 TruyệnHay</span>
        </div>
        <p className="text-stone-600 text-xs">Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  );
}
