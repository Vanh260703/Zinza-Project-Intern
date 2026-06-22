export const userApi = {
  updateProfile: (data: object) =>
    fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  changePassword: (data: object) =>
    fetch("/api/user/change-password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  giftCandy: (novelId: string, userId: string, amount: number) =>
    fetch(`/api/novels/${novelId}/gift-candy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amount }),
    }).then((r) => r.json()),

  trackDailyRead: (data: {
    userId: string;
    storyId: string;
    chapterId: string;
    chapterTitle?: string;
    chapterNumber?: number;
  }) =>
    fetch("/api/user/daily-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  claimDailyTicket: (userId: string) =>
    fetch("/api/user/daily-ticket/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).then((r) => r.json()),

  removeReadingHistory: (userId: string, storyId: string) =>
    fetch(`/api/user/reading-history?userId=${userId}&storyId=${storyId}`, {
      method: "DELETE",
    }).then((r) => {
      if (!r.ok) return r.json().then((d: { message: string }) => Promise.reject(d.message));
    }),
};

export const notificationsApi = {
  getAll: (userId: string) =>
    fetch(`/api/notifications?userId=${userId}&all=true`).then((r) => r.json()),

  markAllRead: (userId: string) =>
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).then((r) => r.json()),
};
