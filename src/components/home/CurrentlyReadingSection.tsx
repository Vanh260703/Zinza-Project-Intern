"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStoriesByIds } from "@/hooks/useStories";
import { BookOpen, Crown, BookMarked } from "lucide-react";
import { useAuthStore } from "@/stores/userStore";

export default function CurrentlyReadingSection() {
  const user = useAuthStore((s) => s.user);
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist?.hasHydrated() ?? false);

  useEffect(() => {
    const unsub = useAuthStore.persist?.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  // Dùng lastReadChapters (DB-backed) thay vì history (localStorage only)
  // → không bị mất sau logout/login
  const ids = Object.keys(user?.lastReadChapters ?? {}).slice(0, 5);

  const { data: stories = [] } = useStoriesByIds(ids, hydrated && ids.length > 0);

  if (!hydrated || stories.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mt-5">
      <h2 className="text-white font-bold text-sm flex items-center gap-1.5">
        <BookOpen className="w-4 h-4 text-amber-400" />
        Đang đọc
      </h2>

      <div className="flex flex-col bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        {stories.map((story) => {
          const lastChapter = user?.lastReadChapters?.[story.id];
          const href = lastChapter
            ? `/novels/${story.slug}/chapters/${lastChapter.id}`
            : `/novels/${story.slug}`;

          return (
            <Link
              key={story.id}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-stone-800/60 transition-colors border-b border-stone-800/60 last:border-0 group"
            >
              <div className="w-9 h-12 rounded-md overflow-hidden bg-stone-800 shrink-0">
                {story.poster ? (
                  <img
                    src={`/api/cover/${story.id}`}
                    alt={story.name}
                    className="w-full h-full object-cover"
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
                    {story.name}
                  </p>
                  {story.vip && <Crown className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
                </div>
                <p className="text-stone-500 text-[11px] truncate">{story.author}</p>
                <p className="text-stone-600 text-[10px] flex items-center gap-1">
                  <BookMarked className="w-3 h-3" />
                  {lastChapter
                    ? `Ch.${lastChapter.number}: ${lastChapter.title}`
                    : `${story.chapterCount} chương`}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
