"use client";

import Link from "next/link";
import { useStoriesByIds } from "@/hooks/useStories";
import { useLibraryStore } from "@/stores/libraryStore";
import { useAuthStore } from "@/stores/userStore";
import { useRemoveReadingHistory } from "@/hooks/useUser";
import { BookOpen, BookMarked, History, Compass, X, Loader2 } from "lucide-react";
import type { User } from "@/types/user";
import type { Story } from "@/types/story";

// ── Story card ────────────────────────────────────────────────────────────────

type LastChapter = NonNullable<User["lastReadChapters"]>[string];

function StoryCard({
  story,
  lastChapter,
  onRemove,
  removing,
}: {
  story: Story;
  lastChapter?: LastChapter;
  onRemove?: () => void;
  removing?: boolean;
}) {
  const href = lastChapter
    ? `/novels/${story.slug}/chapters/${lastChapter.id}`
    : `/novels/${story.slug}`;

  return (
    <div className="relative group/card">
      <Link
        href={href}
        className="flex gap-3 p-3 rounded-xl hover:bg-stone-800 transition-colors group"
      >
        <div className="w-12 h-16 rounded-lg overflow-hidden bg-stone-800 shrink-0">
          {story.posterUrl ? (
            <img
              src={`/api/cover/${story.id}`}
              alt={story.name}
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
            {story.name}
          </p>
          <p className="text-stone-500 text-xs truncate">{story.author}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-stone-600 text-[11px]">
              {lastChapter
                ? `Ch.${lastChapter.number}: ${lastChapter.title}`
                : `${story.chapterCount} chương`}
            </span>
            {story.vip && (
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

// ── Section ───────────────────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  stories,
  emptyText,
  lastReadChapters,
  removeMutation,
}: {
  title: string;
  icon: React.ElementType;
  stories: Story[];
  emptyText: string;
  lastReadChapters?: User["lastReadChapters"];
  removeMutation?: ReturnType<typeof useRemoveReadingHistory>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-amber-400" />
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <span className="text-stone-600 text-xs">({stories.length})</span>
      </div>
      {stories.length === 0 ? (
        <p className="text-stone-600 text-sm px-1">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              lastChapter={lastReadChapters?.[story.id]}
              onRemove={removeMutation ? () => removeMutation.mutate(story.id) : undefined}
              removing={removeMutation?.isPending && removeMutation.variables === story.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function LibraryContent() {
  const { bookmarks } = useLibraryStore();
  const lastReadChapters = useAuthStore((s) => s.user?.lastReadChapters);
  const removeMutation = useRemoveReadingHistory();

  // Dùng lastReadChapters keys (DB-backed) thay vì history (localStorage only)
  const readIds = Object.keys(lastReadChapters ?? {});

  const isEmpty = readIds.length === 0 && bookmarks.length === 0;
  const allIds = [...new Set([...readIds, ...bookmarks])];

  const { data: stories = [], isLoading: loading } = useStoriesByIds(allIds, !isEmpty);

  const byId = Object.fromEntries(stories.map((s) => [s.id, s]));
  const historyStories = readIds.map((id) => byId[id]).filter(Boolean) as Story[];
  const bookmarkStories = bookmarks.map((id) => byId[id]).filter(Boolean) as Story[];

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
        stories={bookmarkStories}
        emptyText="Chưa theo dõi truyện nào."
      />
      <Section
        title="Đã đọc"
        icon={History}
        stories={historyStories}
        lastReadChapters={lastReadChapters}
        emptyText="Chưa có lịch sử đọc."
        removeMutation={removeMutation}
      />
    </div>
  );
}
