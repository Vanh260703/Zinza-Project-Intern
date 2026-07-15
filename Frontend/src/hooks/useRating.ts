import { useMutation } from "@tanstack/react-query";
import { ratingsApi, type RatingInput } from "@/lib/api/ratings";
import { showToast } from "@/lib/toast";

// Tạo đánh giá mới (tab "Đánh giá") — POST
export function useSubmitRating(slug: string) {
  return useMutation({
    mutationFn: (body: RatingInput) => ratingsApi.create(slug, body),
    onError: (err: Error) => showToast.error(err.message ?? "Không gửi được đánh giá"),
  });
}

// Sửa đánh giá đã có (tab "Review truyện") — PATCH thẳng
export function useUpdateRating(slug: string) {
  return useMutation({
    mutationFn: (body: RatingInput) => ratingsApi.update(slug, body),
    onError: (err: Error) => showToast.error(err.message ?? "Không cập nhật được đánh giá"),
  });
}

export function useDeleteRating(slug: string) {
  return useMutation({
    mutationFn: () => ratingsApi.remove(slug),
    onError: (err: Error) => showToast.error(err.message ?? "Không xoá được đánh giá"),
  });
}
