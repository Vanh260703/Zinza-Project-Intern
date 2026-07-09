"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useMemo } from "react";
import { useAuthStore } from "@/stores/userStore";
import { useReadingHistory } from "@/hooks/useUser";
import { getNominated } from "@/utils/handleNovels";
import type { Novel } from "@/types/novel";
import SectionHeader from "./SectionHeader";
import NovelCarousel from "./NovelCarousel";

type NominatedSectionProps = {
  allNovels: Novel[];
};

export default function NominatedSection({ allNovels }: NominatedSectionProps) {
  const user = useAuthStore((state) => state.user);
  const { data: readHistory } = useReadingHistory();
  // Danh sách novel id đã đọc từ BE (user_novel_reads)
  const history = useMemo(() => readHistory?.map((h) => h.novelId) ?? [], [readHistory]);
  const novels = useMemo(
    () => (user ? getNominated(allNovels, history) : []),
    [history, allNovels, user]
  );

  return (
    <section>
      <SectionHeader icon="⭐" title="Truyện đề cử" />

      {user ? (
        <NovelCarousel novels={novels} autoMs={2000} />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-stone-800 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-stone-600" strokeWidth={1.5} />
          </div>
          <p className="text-stone-400 text-sm font-medium mb-1">Chưa có dữ liệu</p>
          <p className="text-stone-600 text-xs mb-5">
            Đăng nhập để xem truyện được đề cử dành riêng cho bạn
          </p>
          <Link
            href="/auth/login"
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </div>
      )}
    </section>
  );
}
