import { create } from "zustand";
import { persist } from "zustand/middleware";

type LibraryStore = {
  userId: string | null;
  history: string[];    // story ids đã đọc
  bookmarks: string[];  // story ids đã bookmark
  init: (userId: string, history: string[], bookmarks: string[]) => void;
  addHistory: (storyId: string) => void;
  toggleBookmark: (storyId: string) => void;
  clear: () => void;
};

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      userId: null,
      history: [],
      bookmarks: [],

      init: (userId, history, bookmarks) =>
        set({ userId, history, bookmarks }),

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

      clear: () => set({ userId: null, history: [], bookmarks: [] }),
    }),
    { name: "library" }
  )
);
