import Link from "next/link";
import { Crown, ChevronLeft, ChevronRight } from "lucide-react";
import Footer from "@/components/layout/Footer";
import NovelCard from "@/components/home/NovelCard";
import type { Novel } from "@/types/novel";

type Props = {
  novels: Novel[];
  currentPage: number;
  totalPages: number;
};

export default function VipContent({ novels, currentPage, totalPages }: Props) {
  return (
    <div className="min-h-screen bg-stone-950">
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-linear-to-b from-amber-500/10 to-transparent border-b border-amber-500/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-75 bg-amber-500/6 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-amber-500/20 border border-amber-500/30 rounded-2xl">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Truyện VIP</h1>
              <p className="text-stone-400 text-sm mt-0.5">{novels.length} truyện</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 max-w-xl px-4 py-3 bg-amber-500/8 border border-amber-500/20 rounded-xl">
            <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-stone-400 text-sm leading-relaxed">
              <span className="text-amber-400 font-semibold">Truyện VIP</span> là những truyện có
              một số chương yêu cầu trả phí bằng <span className="text-amber-400">🍬 kẹo</span> để
              mở khóa. Các chương miễn phí vẫn có thể đọc bình thường.
            </p>
          </div>
        </div>
      </div>

      {/* Novel grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {novels.length === 0 ? (
          <div className="text-center py-24 text-stone-600">
            <Crown className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Chưa có truyện VIP nào</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {novels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <Link
                  href={`/novels/vip?page=${currentPage - 1}`}
                  aria-disabled={currentPage === 1}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    currentPage === 1
                      ? "pointer-events-none opacity-30 bg-stone-900 border-stone-800 text-stone-500"
                      : "bg-stone-900 border-stone-800 text-stone-300 hover:text-white hover:border-stone-700"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Trước
                </Link>

                <span className="text-stone-500 text-sm px-2">
                  Trang <span className="text-white font-semibold">{currentPage}</span> /{" "}
                  {totalPages}
                </span>

                <Link
                  href={`/novels/vip?page=${currentPage + 1}`}
                  aria-disabled={currentPage === totalPages}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    currentPage === totalPages
                      ? "pointer-events-none opacity-30 bg-stone-900 border-stone-800 text-stone-500"
                      : "bg-stone-900 border-stone-800 text-stone-300 hover:text-white hover:border-stone-700"
                  }`}
                >
                  Tiếp
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
