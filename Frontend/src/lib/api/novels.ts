import type { Novel } from "@/types/novel";
import type { Chapter } from "@/types/chapter";
import { apiFetch } from "./client";

// Thống kê 1 truyện của chính user (khớp shape BE trả về từ /user/my-novels/stats)
export type MyNovelStats = {
  id: string;
  name: string;
  author: string;
  views: number;
  nominated: number;
  unlocked: number;
  gifts: number;
  revenue: number;
};

export const novelsApi = {
  // Lấy nhiều truyện theo danh sách ID (vd resolve lịch sử đọc / thư viện đã lưu)
  getByIds: (ids: string[]): Promise<Novel[]> =>
    apiFetch(`/api/novels?ids=${ids.join(",")}`).then((r) => r.json()),

  // Truyện của chính mình (BE lấy user qua cookie) — không cần truyền userId
  getMyNovels: (): Promise<Novel[]> =>
    apiFetch(`/api/user/my-novels`).then((r) => r.json()),

  getMyNovelsStats: (): Promise<MyNovelStats[]> =>
    apiFetch(`/api/user/my-novels/stats`).then((r) => r.json()),

  // Nhận FormData (kèm cover trong cùng request, khớp BE POST /novels) để tạo truyện.
  create: (data: FormData) =>
    apiFetch("/api/novels", {
      method: "POST",
      body: data, // không set Content-Type — browser tự set multipart boundary
    }).then(async (r) => {
      const json = await r.json();
      if (!r.ok) throw new Error(json.message ?? "Đăng truyện thất bại");
      return json;
    }),

  // Sửa truyện theo slug. BE check owner qua cookie.
  update: (slug: string, data: object) =>
    apiFetch(`/api/novels/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(async (r) => {
      const json = await r.json();
      if (!r.ok) throw new Error(json.message ?? "Cập nhật thất bại");
      return json;
    }),

  // Xoá truyện theo slug. BE check owner qua cookie (không cần userId body).
  delete: (slug: string) =>
    apiFetch(`/api/novels/${slug}`, { method: "DELETE" }).then(async (r) => {
      const json = await r.json();
      if (!r.ok) throw new Error(json.message ?? "Xóa truyện thất bại");
      return json;
    }),

  // Đề cử theo slug (BE dùng @CurrentUser qua cookie, không cần body)
  nominate: (slug: string): Promise<{ message: string; remainingTickets: number }> =>
    apiFetch(`/api/novels/${slug}/nominate`, { method: "POST" }).then(async (r) => {
      const json = await r.json();
      if (!r.ok) throw new Error(json.message ?? "Đề cử thất bại");
      return json;
    }),
};

export const chaptersApi = {
  // Danh sách chương của truyện theo slug (dùng cho trang quản lý).
  getByNovel: (slug: string): Promise<Chapter[]> =>
    apiFetch(`/api/novels/${slug}/chapters`).then((r) => r.json()),

  create: (slug: string, data: object) =>
    apiFetch(`/api/novels/${slug}/chapters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  update: (slug: string, chapterId: string, data: object) =>
    apiFetch(`/api/novels/${slug}/chapters/${chapterId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  delete: (slug: string, chapterId: string) =>
    apiFetch(`/api/novels/${slug}/chapters/${chapterId}`, { method: "DELETE" }).then((r) =>
      r.json()
    ),

  // Mở khoá chương theo slug (cookie auth). BE unlock chỉ trả remainingBalance
  // → fetch lại nội dung vừa mở để hiển thị.
  unlock: async (
    slug: string,
    chapterId: string
  ): Promise<{ remainingBalance: number; content: string }> => {
    const res = await apiFetch(`/api/novels/${slug}/chapters/${chapterId}/unlock`, {
      method: "POST",
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Mở khoá thất bại");

    const cRes = await apiFetch(`/api/novels/${slug}/chapters/${chapterId}`);
    const chapter = await cRes.json();
    return { remainingBalance: json.remainingBalance, content: chapter.content ?? "" };
  },
};
