"use client";

import Link from "next/link";
import { useNovelsByIds } from "@/hooks/useNovels";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useRemoveReadingHistory, useReadingHistory } from "@/hooks/useUser";
import { BookOpen, BookMarked, History, Compass, X, Loader2 } from "lucide-react";
import type { ReadChapterInfo } from "@/lib/api/user";
import type { Novel } from "@/types/novel";

// Novel card

type LastChapter = ReadChapterInfo;

function NovelCard({
  novel,
  lastChapter,
  onRemove,
  removing,
}: {
  novel: Novel;
  lastChapter?: LastChapter;
  onRemove?: () => void;
  removing?: boolean;
}) {
  const href = lastChapter
    ? `/novels/${novel.slug}/chapters/${lastChapter.id}`
    : `/novels/${novel.slug}`;

  return (
    <div className="relative group/card">
      <Link
        href={href}
        className="flex gap-3 p-3 rounded-xl hover:bg-stone-800 transition-colors group"
      >
        <div className="w-12 h-16 rounded-lg overflow-hidden bg-stone-800 shrink-0">
          {novel.posterUrl ? (
            <img
              src={novel.posterUrl}
              alt={novel.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-stone-600" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 min-w-0 justify-center">
          <p className="text-stone-200 text-sm font-medium truncate group-hover:text-amber-400 transition-colors">
            {novel.name}
          </p>
          <p className="text-stone-500 text-xs truncate">{novel.author}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-stone-600 text-[11px]">
              {lastChapter
                ? `Ch.${lastChapter.number}: ${lastChapter.title}`
                : `${novel.chapterCount} chương`}
            </span>
            {novel.vip && (
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/15 text-amber-400 rounded-md">
                VIP
              </span>
            )}
          </div>
        </div>
      </Link>

      {onRemove && (
        <button
          onClick={onRemove}
          disabled={removing}
          title="Xóa khỏi lịch sử"
          className="absolute top-1.5 right-1.5 p-1 rounded-md bg-stone-900/80 text-stone-500
            hover:text-red-400 hover:bg-stone-800 opacity-0 group-hover/card:opacity-100
            transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {removing ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
}

// Section
function Section({
  title,
  icon: Icon,
  novels,
  emptyText,
  lastChapterByNovel,
  recordIdByNovel,
  removeMutation,
}: {
  title: string;
  icon: React.ElementType;
  novels: Novel[];
  emptyText: string;
  lastChapterByNovel?: Record<string, ReadChapterInfo>;
  recordIdByNovel?: Record<string, string>;
  removeMutation?: ReturnType<typeof useRemoveReadingHistory>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-amber-400" />
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <span className="text-stone-600 text-xs">({novels.length})</span>
      </div>
      {novels.length === 0 ? (
        <p className="text-stone-600 text-sm px-1">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {novels.map((novel) => {
            const recordId = recordIdByNovel?.[novel.id];
            return (
              <NovelCard
                key={novel.id}
                novel={novel}
                lastChapter={lastChapterByNovel?.[novel.id]}
                onRemove={
                  removeMutation && recordId
                    ? () => removeMutation.mutate(recordId)
                    : undefined
                }
                removing={removeMutation?.isPending && removeMutation.variables === recordId}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// Root

export default function LibraryContent() {
  const { data: bookmarkList = [] } = useBookmarks();
  const { data: history = [], isLoading: historyLoading } = useReadingHistory();
  const removeMutation = useRemoveReadingHistory();

  // Truyện đã lưu (BE user_novel_bookmarks) → lấy id để resolve Novel qua useNovelsByIds
  const bookmarks = bookmarkList.map((b) => b.novel.id);

  // Lịch sử đọc từ BE (bảng user_novel_reads), sắp theo lần đọc gần nhất
  const readIds = history.map((h) => h.novelId);
  const lastChapterByNovel = Object.fromEntries(history.map((h) => [h.novelId, h.chapter]));
  const recordIdByNovel = Object.fromEntries(history.map((h) => [h.novelId, h.id]));

  const isEmpty = readIds.length === 0 && bookmarks.length === 0;
  const allIds = [...new Set([...readIds, ...bookmarks])];

  const { data: novels = [], isLoading: novelsLoading } = useNovelsByIds(allIds, !isEmpty);
  const loading = historyLoading || novelsLoading;

  const byId = Object.fromEntries(novels.map((s) => [s.id, s]));
  const historyNovels = readIds.map((id) => byId[id]).filter(Boolean) as Novel[];
  const bookmarkNovels = bookmarks.map((id) => byId[id]).filter(Boolean) as Novel[];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-5 h-5 border-2 border-stone-700 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center">
          <BookMarked className="w-7 h-7 text-stone-600" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-stone-300 font-medium">Tủ truyện trống</p>
          <p className="text-stone-600 text-sm mt-1">Bạn chưa đọc hoặc theo dõi truyện nào.</p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-colors"
        >
          <Compass className="w-4 h-4" />
          Khám phá truyện
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Section
        title="Đang theo dõi"
        icon={BookMarked}
        novels={bookmarkNovels}
        emptyText="Chưa theo dõi truyện nào."
      />
      <Section
        title="Đã đọc"
        icon={History}
        novels={historyNovels}
        lastChapterByNovel={lastChapterByNovel}
        recordIdByNovel={recordIdByNovel}
        emptyText="Chưa có lịch sử đọc."
        removeMutation={removeMutation}
      />
    </div>
  );
}
