import { apiFetch } from "./client";

export type CommentUser = { id: string; name: string; avatarUrl: string | null };

export type NovelComment = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
};

export type CommentsPage = {
  data: NovelComment[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

async function asJson<T>(res: Response, errMsg: string): Promise<T> {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? errMsg);
  return json as T;
}

export const commentsApi = {
  list: (slug: string, page = 1, limit = 50): Promise<CommentsPage> =>
    apiFetch(`/api/novels/${slug}/comments?page=${page}&limit=${limit}`).then((r) => r.json()),

  create: (slug: string, content: string): Promise<NovelComment> =>
    apiFetch(`/api/novels/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    }).then((r) => asJson<NovelComment>(r, "Không gửi được bình luận")),

  remove: (slug: string, commentId: string): Promise<{ message: string }> =>
    apiFetch(`/api/novels/${slug}/comments/${commentId}`, { method: "DELETE" }).then((r) =>
      asJson<{ message: string }>(r, "Không xoá được bình luận")
    ),
};
