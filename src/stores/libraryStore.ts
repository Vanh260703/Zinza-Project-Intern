import { create } from "zustand";
import { persist } from "zustand/middleware";

type LibraryStore = {
  userId: string | null;
  history: string[]; // story ids đã đọc        → user_story_reads
  bookmarks: string[]; // story ids đã bookmark   → user_story_bookmarks
  purchasedChapterIds: string[]; // chapter ids đã mua      → chapter_purchases
  init: (
    userId: string,
    history: string[],
    bookmarks: string[],
    purchasedChapterIds: string[]
  ) => void;
  addHistory: (storyId: string) => void;
  toggleBookmark: (storyId: string) => void;
  addPurchasedChapter: (chapterId: string) => void;
  clear: () => void;
};

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      userId: null,
      history: [],
      bookmarks: [],
      purchasedChapterIds: [],

      init: (userId, history, bookmarks, purchasedChapterIds) =>
        set({ userId, history, bookmarks, purchasedChapterIds }),

      addHistory: (storyId) => {
        const { history } = get();
        if (!history.includes(storyId)) {
          set({ history: [storyId, ...history] });
        }
      },

      toggleBookmark: (storyId) => {
        const { bookmarks } = get();
        set({
          bookmarks: bookmarks.includes(storyId)
            ? bookmarks.filter((id) => id !== storyId)
            : [storyId, ...bookmarks],
        });
      },

      addPurchasedChapter: (chapterId) => {
        const { purchasedChapterIds } = get();
        if (!purchasedChapterIds.includes(chapterId)) {
          set({ purchasedChapterIds: [...purchasedChapterIds, chapterId] });
        }
      },

      clear: () => {
        set({ userId: null, history: [], bookmarks: [], purchasedChapterIds: [] });
        // Persist middleware tự ghi lại sau set() — removeItem ngay sau để override
        localStorage.removeItem("library");
      },
    }),
    { name: "library" }
  )
);
