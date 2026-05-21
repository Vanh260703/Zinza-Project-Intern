import Link from "next/link";
import { BookOpenText, PlusCircle, Upload } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="border-2 border-dashed border-stone-700 rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center">
        <BookOpenText className="w-7 h-7 text-stone-600" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-stone-300 font-medium">Chưa có truyện nào</p>
        <p className="text-stone-600 text-sm mt-1">Bắt đầu đăng truyện đầu tiên của bạn.</p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/my-novels/create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Bắt đầu đăng truyện
        </Link>
      </div>
    </div>
  );
}
