import { apiFetch } from "./client";

export type ReadChapterInfo = { id: string; number: number; title: string };

export type ReadHistoryEntry = {
  id: string; // UserNovelRead record id — dùng để xoá
  novelId: string;
  lastReadAt: string;
  chapter: ReadChapterInfo;
};

export const userApi = {
  updateProfile: (data: object) =>
    apiFetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  changePassword: (data: object) =>
    apiFetch("/api/user/change-password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(async (r) => {
      const json = await r.json();
      if (!r.ok) throw new Error(json.message ?? "Đổi mật khẩu thất bại");
      return json;
    }),

  giftCandy: (
    slug: string,
    amount: number
  ): Promise<{ message: string; remainingBalance: number }> =>
    apiFetch(`/api/novels/${slug}/gift-candy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    }).then(async (r) => {
      const json = await r.json();
      if (!r.ok) throw new Error(json.message ?? "Tặng kẹo thất bại");
      return json;
    }),

  trackDailyRead: (data: {
    userId: string;
    storyId: string;
    chapterId: string;
    chapterTitle?: string;
    chapterNumber?: number;
  }) =>
    apiFetch("/api/user/daily-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  getDailyProgress: (): Promise<{
    todayCount: number;
    required: number;
    claimed: boolean;
    recommendationTicket: number;
  }> => apiFetch("/api/user/daily-ticket").then((r) => r.json()),

  claimDailyTicket: (userId: string) =>
    apiFetch("/api/user/daily-ticket/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).then((r) => r.json()),

  getReadHistory: (): Promise<ReadHistoryEntry[]> =>
    apiFetch("/api/user/reading-history").then((r) => r.json()),

  // Xoá 1 bản ghi lịch sử theo record id (UserNovelRead.id)
  removeReadingHistory: (recordId: string) =>
    apiFetch(`/api/user/reading-history?id=${recordId}`, {
      method: "DELETE",
    }).then((r) => {
      if (!r.ok) return r.json().then((d: { message: string }) => Promise.reject(d.message));
    }),
};

export const notificationsApi = {
  getAll: (userId: string) =>
    apiFetch(`/api/notifications?userId=${userId}&all=true`).then((r) => r.json()),

  markAllRead: (userId: string) =>
    apiFetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).then((r) => r.json()),
};
