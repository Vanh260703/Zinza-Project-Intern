"use client";

import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useBookmarks, useToggleBookmark } from "@/hooks/useBookmarks";
import { useAuthStore } from "@/stores/userStore";
import { showToast } from "@/lib/toast";

type FollowButtonProps = {
  novelId: string;
};

export default function FollowButton({ novelId }: FollowButtonProps) {
  const user = useAuthStore((s) => s.user);
  const { data: bookmarks } = useBookmarks();
  const toggleMut = useToggleBookmark();

  const isFollowing = !!bookmarks?.some((b) => b.novel.id === novelId);

  const handleClick = () => {
    if (!user) {
      showToast.error("Đăng nhập để lưu truyện");
      return;
    }
    toggleMut.mutate(novelId);
  };

  return (
    <button
      onClick={handleClick}
      disabled={toggleMut.isPending}
      className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border transition-colors disabled:opacity-60 ${
        isFollowing
          ? "bg-amber-500/15 border-amber-500/50 text-amber-400 hover:bg-amber-500/25"
          : "bg-stone-800 hover:bg-stone-700 border-stone-700 hover:border-stone-600 text-stone-300 hover:text-white"
      }`}
    >
      {toggleMut.isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      {isFollowing ? "Đã lưu" : "Lưu truyện"}
    </button>
  );
}
