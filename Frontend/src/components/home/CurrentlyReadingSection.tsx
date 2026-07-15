"use client";

import Link from "next/link";
import Image from "next/image";
import { useNovelsByIds } from "@/hooks/useNovels";
import { useReadingHistory } from "@/hooks/useUser";
import { BookOpen, Crown, BookMarked } from "lucide-react";

export default function CurrentlyReadingSection() {
  // Lịch sử đọc từ BE (user_novel_reads), sắp theo lần đọc gần nhất
  const { data: history = [] } = useReadingHistory();

  const entries = history.slice(0, 5);
  const ids = entries.map((h) => h.novelId);
  const lastChapterByNovel = Object.fromEntries(history.map((h) => [h.novelId, h.chapter]));

  const { data: novels = [] } = useNovelsByIds(ids, ids.length > 0);
  const byId = Object.fromEntries(novels.map((s) => [s.id, s]));

  // Giữ thứ tự theo recency của lịch sử đọc
  const orderedNovels = entries.map((h) => byId[h.novelId]).filter(Boolean);

  if (orderedNovels.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mt-5">
      <h2 className="text-white font-bold text-sm flex items-center gap-1.5">
        <BookOpen className="w-4 h-4 text-amber-400" />
        Đang đọc
      </h2>

      <div className="flex flex-col bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        {orderedNovels.map((novel) => {
          const lastChapter = lastChapterByNovel[novel.id];
          const href = lastChapter
            ? `/novels/${novel.slug}/chapters/${lastChapter.id}`
            : `/novels/${novel.slug}`;

          return (
            <Link
              key={novel.id}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-stone-800/60 transition-colors border-b border-stone-800/60 last:border-0 group"
            >
              <div className="relative w-9 h-12 rounded-md overflow-hidden bg-stone-800 shrink-0">
                {novel.posterUrl ? (
                  <Image
                    src={novel.posterUrl}
                    alt={novel.name}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5 text-stone-600" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-stone-200 text-xs font-semibold line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {novel.name}
                  </p>
                  {novel.vip && <Crown className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
                </div>
                <p className="text-stone-500 text-[11px] truncate">{novel.author}</p>
                <p className="text-stone-600 text-[10px] flex items-center gap-1">
                  <BookMarked className="w-3 h-3" />
                  {lastChapter
                    ? `Ch.${lastChapter.number}: ${lastChapter.title}`
                    : `${novel.chapterCount} chương`}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
