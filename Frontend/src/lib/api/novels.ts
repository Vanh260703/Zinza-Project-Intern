import type { Story } from "@/types/story";
import type { Chapter } from "@/types/chapter";

export const novelsApi = {
  getByUser: (userId: string): Promise<Story[]> =>
    fetch(`/api/novels?postedBy=${userId}`).then((r) => r.json()),

  getById: (id: string): Promise<Story> => fetch(`/api/novels/${id}`).then((r) => r.json()),

  create: (data: FormData | object) =>
    fetch("/api/novels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  update: (id: string, data: object) =>
    fetch(`/api/novels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  delete: (id: string, userId: string) =>
    fetch(`/api/novels/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).then((r) => r.json()),

  nominate: (storyId: string, userId: string) =>
    fetch(`/api/novels/${storyId}/nominate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).then((r) => r.json()),
};

export const chaptersApi = {
  getByNovel: (novelId: string): Promise<Chapter[]> =>
    fetch(`/api/novels/${novelId}/chapters`).then((r) => r.json()),

  create: (novelId: string, data: object) =>
    fetch(`/api/novels/${novelId}/chapters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  update: (novelId: string, chapterId: string, data: object) =>
    fetch(`/api/novels/${novelId}/chapters/${chapterId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  delete: (novelId: string, chapterId: string) =>
    fetch(`/api/novels/${novelId}/chapters/${chapterId}`, { method: "DELETE" }).then((r) =>
      r.json()
    ),

  unlock: (novelId: string, chapterId: string, userId: string) =>
    fetch(`/api/novels/${novelId}/chapters/${chapterId}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).then((r) => r.json()),
};
