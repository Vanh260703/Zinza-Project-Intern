import { apiFetch } from "./client";

export type BookmarkNovel = {
  id: string;
  name: string;
  slug: string;
  author: string;
  poster: string | null;
  status: string;
  rating: number;
  chapterCount: number;
  categories: string[];
  tags: string[];
};

export type Bookmark = { id: string; bookmarkedAt: string; novel: BookmarkNovel };

export const bookmarksApi = {
  list: (): Promise<Bookmark[]> => apiFetch("/api/user/bookmarks").then((r) => r.json()),

  // Toggle: thêm nếu chưa lưu, bỏ nếu đã lưu
  toggle: (novelId: string): Promise<{ bookmarked: boolean }> =>
    apiFetch(`/api/user/bookmarks/${novelId}`, { method: "POST" }).then((r) => r.json()),
};
