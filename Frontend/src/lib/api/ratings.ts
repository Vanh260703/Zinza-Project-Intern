import { apiFetch } from "./client";

export type RatingInput = { rating: number; review?: string };

async function asMsg(res: Response, err: string): Promise<{ message: string }> {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? err);
  return json;
}

export const ratingsApi = {
  // Tạo đánh giá mới (user chưa đánh giá)
  create: (slug: string, body: RatingInput) =>
    apiFetch(`/api/novels/${slug}/ratings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => asMsg(r, "Không gửi được đánh giá")),

  // Cập nhật đánh giá đã có (PATCH thẳng, không POST thừa)
  update: (slug: string, body: RatingInput) =>
    apiFetch(`/api/novels/${slug}/ratings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => asMsg(r, "Không cập nhật được đánh giá")),

  remove: (slug: string) =>
    apiFetch(`/api/novels/${slug}/ratings`, { method: "DELETE" }).then((r) =>
      asMsg(r, "Không xoá được đánh giá")
    ),
};
