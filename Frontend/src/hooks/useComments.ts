import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "@/lib/api/comments";
import { showToast } from "@/lib/toast";

export function useComments(slug: string) {
  return useQuery({
    queryKey: ["comments", slug],
    queryFn: () => commentsApi.list(slug),
    enabled: !!slug,
  });
}

export function useCreateComment(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => commentsApi.create(slug, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", slug] });
    },
    onError: (err: Error) => showToast.error(err.message ?? "Không gửi được bình luận"),
  });
}

export function useDeleteComment(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentsApi.remove(slug, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", slug] });
    },
    onError: (err: Error) => showToast.error(err.message ?? "Không xoá được bình luận"),
  });
}
