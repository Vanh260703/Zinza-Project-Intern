"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useLibraryStore } from "@/stores/libraryStore";

type FollowButtonProps = {
  storyId: string;
};

export default function FollowButton({ storyId }: FollowButtonProps) {
  const bookmarks = useLibraryStore((s) => s.bookmarks);
  const toggleBookmark = useLibraryStore((s) => s.toggleBookmark);

  const isFollowing = bookmarks.includes(storyId);

  return (
    <button
      onClick={() => toggleBookmark(storyId)}
      className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border transition-colors ${
        isFollowing
          ? "bg-amber-500/15 border-amber-500/50 text-amber-400 hover:bg-amber-500/25"
          : "bg-stone-800 hover:bg-stone-700 border-stone-700 hover:border-stone-600 text-stone-300 hover:text-white"
      }`}
    >
      {isFollowing ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      {isFollowing ? "Đang theo dõi" : "Theo dõi"}
    </button>
  );
}
