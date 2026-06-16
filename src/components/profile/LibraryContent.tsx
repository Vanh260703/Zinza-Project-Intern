"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLibraryStore } from "@/stores/libraryStore";
import { useAuthStore } from "@/stores/userStore";
import { BookOpen, BookMarked, History, Compass } from "lucide-react";
import type { User } from "@/types/user";
import { showToast } from "@/lib/toast";
import type { Story } from "@/types/story";

// ── Story card ────────────────────────────────────────────────────────────────

type LastChapter = NonNullable<User["lastReadChapters"]>[string];

function StoryCard({ story, lastChapter }: { story: Story; lastChapter?: LastChapter }) {
  const href = lastChapter
    ? `/novels/${story.slug}/chapters/${lastChapter.id}`
    : `/novels/${story.slug}`;

  return (
    <Link
      href={href}
      className="flex gap-3 p-3 rounded-xl hover:bg-stone-800 transition-colors group"
    >
      <div className="w-12 h-16 rounded-lg overflow-hidden bg-stone-800 shrink-0">
        {story.poster ? (
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
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  stories,
  emptyText,
  lastReadChapters,
}: {
  title: string;
  icon: React.ElementType;
  stories: Story[];
  emptyText: string;
  lastReadChapters?: User["lastReadChapters"];
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function LibraryContent() {
  const { history, bookmarks } = useLibraryStore();
  const lastReadChapters = useAuthStore((s) => s.user?.lastReadChapters);
  const [historyStories, setHistoryStories] = useState<Story[]>([]);
  const [bookmarkStories, setBookmarkStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const isEmpty = history.length === 0 && bookmarks.length === 0;

  useEffect(() => {
    if (isEmpty) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    const allIds = [...new Set([...history, ...bookmarks])];

    fetch(`/api/novels?ids=${allIds.join(",")}`)
      .then((r) => r.json())
      .then((stories: Story[]) => {
        const byId = Object.fromEntries(stories.map((s) => [s.id, s]));
        setHistoryStories(history.map((id) => byId[id]).filter(Boolean));
        setBookmarkStories(bookmarks.map((id) => byId[id]).filter(Boolean));
      })
      .catch(() => showToast.error("Không tải được tủ sách"))
      .finally(() => setLoading(false));
  }, [history, bookmarks, isEmpty]);

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
      />
    </div>
  );
}
